#!/usr/bin/env python3
"""Build web/public/data/world.json from GeoNames.

Downloads two files from GeoNames (CC BY 4.0, https://www.geonames.org):
  countryInfo.txt  one row per country: ISO codes, name, continent, capital
  cities5000.zip   every populated place with population >= 5000

Then, for each country, keeps the capital plus the biggest cities up to
MAX_CITIES, and writes a single JSON file that the Next.js app imports.

Usage:
    python3 scripts/build_world_data.py

Re-running is cheap: downloads are cached in scripts/data/ (git-ignored).
Delete that folder to force a fresh download.
"""

from __future__ import annotations

import csv
import io
import json
import sys
import urllib.error
import urllib.request
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

# --- Paths ------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent          # the project folder
RAW_DIR = ROOT / "scripts" / "data"                     # cached downloads
OUT_FILE = ROOT / "web" / "public" / "data" / "world.json"

# --- Settings ---------------------------------------------------------------

COUNTRY_INFO_URL = "https://download.geonames.org/export/dump/countryInfo.txt"
CITIES_URL = "https://download.geonames.org/export/dump/cities5000.zip"
FLAG_URL = "https://flagcdn.com/w40/{code}.png"   # tiny flags, only used to pick each country's colour

MAX_CITIES = 15          # per country, capital included

# GeoNames still lists a few countries that no longer exist. Skip them.
DEFUNCT_CODES = {"AN", "CS"}   # Netherlands Antilles, Serbia and Montenegro
COORD_DECIMALS = 3       # ~100 m precision, plenty for a world map

CONTINENTS = {
    "AF": "Africa",
    "AS": "Asia",
    "EU": "Europe",
    "NA": "North America",
    "OC": "Oceania",
    "SA": "South America",
    "AN": "Antarctica",
}

# --- Download ---------------------------------------------------------------


def download(url: str, dest: Path, quiet: bool = False) -> Path | None:
    """Fetch url into dest unless it is already there. Returns None if the server has no such file."""
    if dest.exists():
        if not quiet:
            print(f"  cached    {dest.name}")
        return dest
    if not quiet:
        print(f"  fetching  {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "levart-data-builder"})
    try:
        with urllib.request.urlopen(request) as response, open(dest, "wb") as out:
            out.write(response.read())
    except urllib.error.HTTPError:
        return None
    if not quiet:
        print(f"  saved     {dest.name} ({dest.stat().st_size // 1024} KB)")
    return dest


# --- Parse ------------------------------------------------------------------


def load_countries(path: Path) -> dict[str, dict]:
    """Return {iso2: country dict} from countryInfo.txt.

    The file is tab-separated with '#' comment lines. Column order:
    ISO, ISO3, ISO-Numeric, fips, Country, Capital, Area, Population, Continent, ...
    """
    countries: dict[str, dict] = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue
            cols = line.rstrip("\n").split("\t")
            iso2, iso3, iso_numeric, _fips, name, capital, _area, population, continent = cols[:9]
            if iso2 in DEFUNCT_CODES:
                continue
            name = name.strip()   # one entry has a trailing space in the source file
            countries[iso2] = {
                "code": iso2,
                "iso3": iso3,
                "numeric": iso_numeric.zfill(3),   # world map ids are zero-padded, e.g. "036"
                "name": name,
                "continent": CONTINENTS.get(continent, continent),
                "capital": capital,
                "population": int(population or 0),
                "cities": [],
            }
    return countries


def load_cities(zip_path: Path) -> list[dict]:
    """Return a list of city dicts from cities5000.zip.

    Each row has 19 tab-separated columns; we only need a few of them.
    """
    cities: list[dict] = []
    with zipfile.ZipFile(zip_path) as zf:
        raw = zf.read("cities5000.txt").decode("utf-8")
    reader = csv.reader(io.StringIO(raw), delimiter="\t", quoting=csv.QUOTE_NONE)
    for row in reader:
        geonameid, name, _ascii, _alt, lat, lng, feature_class, feature_code, country = row[:9]
        population = int(row[14] or 0)
        if feature_class != "P":        # P = populated place
            continue
        cities.append({
            "id": int(geonameid),
            "name": name,
            "lat": round(float(lat), COORD_DECIMALS),
            "lng": round(float(lng), COORD_DECIMALS),
            "population": population,
            "country": country,
            "isCapital": feature_code == "PPLC",
        })
    return cities


# --- Flag colour ------------------------------------------------------------


def flag_colour(code: str) -> str | None:
    """The flag's most prominent colour that is not white, as a hex string.

    Downloads a 40px-wide flag (cached), quantises it to a few colours and picks
    the commonest one that is not near-white. White-heavy flags (Japan) then give
    their emblem colour, which is what people recognise.
    """
    try:
        from PIL import Image  # Pillow; already installed with Anaconda
    except ImportError:
        return None
    path = download(FLAG_URL.format(code=code.lower()), RAW_DIR / "flags" / f"{code.lower()}.png", quiet=True)
    if path is None:
        return None
    image = Image.open(path).convert("RGB")
    # Count real pixel colours, bucketed coarsely so anti-aliased edges join their neighbours.
    # Prefer a saturated colour: white, black and greys are structure, not identity.
    buckets: Counter[tuple[int, int, int]] = Counter()
    for r, g, b in image.getdata():
        buckets[(r // 24 * 24, g // 24 * 24, b // 24 * 24)] += 1
    def saturation(c: tuple[int, int, int]) -> float:
        hi, lo = max(c), min(c)
        return 0.0 if hi == 0 else (hi - lo) / hi
    saturated = [(c, n) for c, n in buckets.most_common() if saturation(c) > 0.35 and max(c) > 60]
    chosen = saturated[0][0] if saturated else buckets.most_common(1)[0][0]
    r, g, b = (min(255, v + 12) for v in chosen)  # bucket floor → roughly the bucket's middle
    return f"#{r:02x}{g:02x}{b:02x}"


# --- Combine ----------------------------------------------------------------


def pick_cities(cities: list[dict]) -> list[dict]:
    """Capital first (if any), then the rest by population, up to MAX_CITIES."""
    capitals = [c for c in cities if c["isCapital"]]
    others = [c for c in cities if not c["isCapital"]]
    others.sort(key=lambda c: c["population"], reverse=True)
    chosen = (capitals[:1] + others)[:MAX_CITIES]
    # Drop the helper fields the app doesn't need.
    return [
        {"id": c["id"], "name": c["name"], "lat": c["lat"], "lng": c["lng"], "population": c["population"]}
        for c in chosen
    ]


def build() -> dict:
    print("Downloading")
    country_file = download(COUNTRY_INFO_URL, RAW_DIR / "countryInfo.txt")
    cities_file = download(CITIES_URL, RAW_DIR / "cities5000.zip")

    print("Parsing")
    countries = load_countries(country_file)
    cities = load_cities(cities_file)
    print(f"  {len(countries)} countries, {len(cities)} cities with population >= 5000")

    # Group cities by country code. defaultdict would also work here.
    by_country: dict[str, list[dict]] = {}
    for city in cities:
        by_country.setdefault(city["country"], []).append(city)

    print("Flag colours")
    for code, country in countries.items():
        country["cities"] = pick_cities(by_country.get(code, []))
        country["color"] = flag_colour(code)
    print(f"  {sum(1 for c in countries.values() if c['color'])} of {len(countries)} countries coloured")

    ordered = sorted(countries.values(), key=lambda c: c["name"])
    return {
        "source": "GeoNames (CC BY 4.0)",
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "maxCitiesPerCountry": MAX_CITIES,
        "countries": ordered,
    }


def report(data: dict) -> None:
    countries = data["countries"]
    total_cities = sum(len(c["cities"]) for c in countries)
    empty = [c["name"] for c in countries if not c["cities"]]
    few = [c["name"] for c in countries if 0 < len(c["cities"]) < 5]
    print("Summary")
    print(f"  countries: {len(countries)}")
    print(f"  cities:    {total_cities}")
    print(f"  countries with no cities ({len(empty)}): {', '.join(empty) or '-'}")
    print(f"  countries with 1-4 cities ({len(few)}): {', '.join(few) or '-'}")


def main() -> int:
    data = build()
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Wrote {OUT_FILE.relative_to(ROOT)} ({OUT_FILE.stat().st_size // 1024} KB)")
    report(data)
    return 0


if __name__ == "__main__":
    sys.exit(main())
