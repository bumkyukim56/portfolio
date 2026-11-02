"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WorldMap from "./WorldMap";
import CityPanel from "./CityPanel";
import CitySearch from "./CitySearch";
import StatsPanel from "./StatsPanel";
import Passport, { type Stamp } from "./Passport";
import Confetti from "./Confetti";
import { computeStats, reachedMilestones } from "./stats";
import type { Country, World } from "./types";

const DEFAULT_STORAGE_KEY = "levart.visits";

// The public props, kept small so the component can be published on its own (build step 11).
export type LevartProps = {
  /** ISO alpha-2 codes to show as visited from the start, e.g. ["KR", "JP"]. Their capital is ticked. */
  visited?: string[];
  /** Show the percentage, counts and milestones above the map. Default true. */
  showStats?: boolean;
  /** Where to save in localStorage. Pass null to never save (read-only embeds). */
  storageKey?: string | null;
  /** Where to fetch the two data files from. Default: the site's own /data folder. */
  dataUrl?: string;
  /** The name printed inside the passport. */
  holder?: string;
};

// What the user has ticked: country numeric id → the ids of cities seen there.
// A plain object keyed by string, like a HashMap<String, List<Integer>>.
export type Visits = Record<string, number[]>;

// Levart owns all state; WorldMap and CityPanel just draw and report events.
export default function Levart({
  visited: initialVisited = [],
  showStats = true,
  storageKey = DEFAULT_STORAGE_KEY,
  dataUrl = "/data",
  holder = "BK Kim",
}: LevartProps = {}) {
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visits>({});
  const [stamps, setStamps] = useState<Record<string, string>>({}); // numeric id → date of first city
  const [open, setOpen] = useState(false);     // is the passport open?
  const [tools, setTools] = useState(false);   // are the search and map mounted? (follows `open`, after the swing)

  // The cover's swing is 700ms of CSS. Mounting the map (175 paths) in the same frame would
  // stall the start of that transition, so the tools mount once the swing is over.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setTools(true), 720);
    return () => clearTimeout(timer);
  }, [open]);
  const [latestStamp, setLatestStamp] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false); // true once localStorage has been read
  const [burst, setBurst] = useState(0);       // increments when a new milestone is reached
  const seenMilestones = useRef<Set<string> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // On a phone the city panel sits below the map, out of view: bring it up when a country is chosen.
  useEffect(() => {
    if (!selected || !panelRef.current) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return; // on a laptop it is already beside the map
    panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selected]);

  // Read saved visits once, after the first render. The server can't see localStorage,
  // so starting empty and loading in an effect keeps server and browser HTML identical.
  // (The lint rule against setting state inside an effect is right in general; here it is
  // the standard way to pick up browser-only data after hydration, so it is switched off once.)
  /* eslint-disable react-hooks/set-state-in-effect -- reading browser storage after hydration */
  useEffect(() => {
    if (storageKey === null) {
      setLoaded(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setVisits(JSON.parse(raw) as Visits);
      const rawStamps = window.localStorage.getItem(`${storageKey}.stamps`);
      if (rawStamps) setStamps(JSON.parse(rawStamps) as Record<string, string>);
    } catch {
      // private mode or blocked storage: carry on without saving
    }
    setLoaded(true);
  }, [storageKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save on every change, but not before the first load (that would wipe the saved data).
  useEffect(() => {
    if (!loaded || storageKey === null) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(visits));
      window.localStorage.setItem(`${storageKey}.stamps`, JSON.stringify(stamps));
    } catch {
      // ignore
    }
  }, [visits, stamps, loaded, storageKey]);

  useEffect(() => {
    fetch(`${dataUrl}/world.json`)
      .then((response) => response.json())
      .then((world: World) => {
        const byId: Record<string, Country> = {};
        for (const country of world.countries) byId[country.numeric] = country;
        setCountries(byId);
        // Countries passed in as props start with their first city (the capital) ticked,
        // unless the visitor already has something saved for them.
        if (initialVisited.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          setVisits((previous) => {
            const next = { ...previous };
            for (const country of world.countries) {
              if (initialVisited.includes(country.code) && !(country.numeric in next) && country.cities[0]) {
                next[country.numeric] = [country.cities[0].id];
              }
            }
            return next;
          });
          setStamps((previous) => {
            const next = { ...previous };
            for (const country of world.countries) {
              if (initialVisited.includes(country.code) && !(country.numeric in next)) next[country.numeric] = today;
            }
            return next;
          });
        }
      });
    // initialVisited is a prop given once; re-running on every new array identity would reset nothing useful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  // Toggle one city. State is never mutated in place: we build a new object so
  // React sees the change (compare: returning a new list instead of editing one).
  function toggleCity(numeric: string, cityId: number) {
    const current = visits[numeric] ?? [];
    const next = current.includes(cityId) ? current.filter((id) => id !== cityId) : [...current, cityId];
    setVisits({ ...visits, [numeric]: next });
    syncStamp(numeric, current.length, next.length);
  }

  // A country's stamp appears the first time it gets a city and goes when its last city is removed.
  function syncStamp(numeric: string, before: number, after: number) {
    if (before === 0 && after > 0) {
      setStamps({ ...stamps, [numeric]: new Date().toISOString().slice(0, 10) });
      setLatestStamp(numeric);
    } else if (before > 0 && after === 0) {
      const rest = { ...stamps };
      delete rest[numeric];
      setStamps(rest);
      if (latestStamp === numeric) setLatestStamp(null);
    }
  }

  // A country counts as visited once at least one of its cities is ticked.
  const visitedCountries = useMemo(
    () => new Set(Object.keys(visits).filter((numeric) => visits[numeric].length > 0)),
    [visits],
  );

  // Share of each visited country's cities that are ticked: 3 of 10 → 0.3. Drives the fill-up.
  const progress = useMemo(() => {
    const out: Record<string, number> = {};
    for (const numeric of visitedCountries) {
      const total = countries[numeric]?.cities.length ?? 0;
      out[numeric] = total === 0 ? 1 : (visits[numeric]?.length ?? 0) / total;
    }
    return out;
  }, [visits, visitedCountries, countries]);

  const stats = useMemo(() => computeStats(visits, countries), [visits, countries]);
  const reached = useMemo(() => reachedMilestones(stats), [stats]);

  // Fire confetti when a milestone is newly reached (not on load, not when one is lost).
  useEffect(() => {
    if (!loaded || Object.keys(countries).length === 0) return;
    const ids = new Set(reached.map((milestone) => milestone.id));
    if (seenMilestones.current === null) {
      seenMilestones.current = ids; // first evaluation after load: remember, don't celebrate
      return;
    }
    const isNew = [...ids].some((id) => !seenMilestones.current!.has(id));
    seenMilestones.current = ids;
    if (isNew) setBurst((n) => n + 1);
  }, [reached, loaded, countries]);

  function reset() {
    if (!window.confirm("Clear every city and start over?")) return;
    setVisits({});
    setStamps({});
    setLatestStamp(null);
    setSelected(null);
  }

  function addCity(numeric: string, cityId: number) {
    const current = visits[numeric] ?? [];
    if (current.includes(cityId)) return;
    setVisits({ ...visits, [numeric]: [...current, cityId] });
    syncStamp(numeric, current.length, current.length + 1);
    setSelected(numeric); // show the country you just added to
  }

  const country = selected ? countries[selected] : undefined;

  const stampList: Stamp[] = Object.entries(stamps)
    .filter(([numeric]) => countries[numeric])
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([numeric, date]) => ({ numeric, date, code: countries[numeric].code, name: countries[numeric].name }));

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Confetti burst={burst} />

      <Passport
        open={open}
        onToggle={() => {
          if (open) setTools(false); // closing: unmount the tools at once so the next open starts clean
          setOpen(!open);
        }}
        holder={holder}
        stamps={stampList}
        latest={latestStamp}
        identity={showStats ? <StatsPanel stats={stats} reached={reached} onReset={reset} compact /> : null}
      />

      {open && tools && (
        <div className="dive flex flex-col gap-4 sm:gap-6">
          <CitySearch
            countries={countries}
            onAdd={addCity}
            isAdded={(numeric, cityId) => (visits[numeric] ?? []).includes(cityId)}
          />
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            <div data-ui className="relative bg-[var(--lv-panel)] p-3 lg:col-span-8 sm:p-5">
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute left-3 top-3 z-10 min-h-11 bg-[var(--lv-ground)] px-4 text-small underline underline-offset-4 sm:left-5 sm:top-5"
                >
                  Back to the world
                </button>
              )}
              <WorldMap
                selected={selected}
                onSelect={setSelected}
                isKnown={(id) => id in countries}
                visited={visitedCountries}
                progress={progress}
                cities={(id) =>
                  (countries[id]?.cities ?? []).map((city) => ({
                    id: city.id,
                    name: city.name,
                    lat: city.lat,
                    lng: city.lng,
                    added: (visits[id] ?? []).includes(city.id),
                  }))
                }
                onToggleCity={toggleCity}
                colorOf={(id) => countries[id]?.color ?? undefined}
                flagCode={(id) => countries[id]?.code.toLowerCase()}
                dataUrl={dataUrl}
              />
            </div>
            <div ref={panelRef} className="scroll-mt-4 lg:col-span-4">
              {country ? (
                <CityPanel
                  country={country}
                  added={new Set(visits[country.numeric] ?? [])}
                  onRemove={(cityId) => toggleCity(country.numeric, cityId)}
                  onClose={() => setSelected(null)}
                />
              ) : (
                <div className="bg-[var(--lv-panel)] p-5 sm:p-6">
                  <p className="font-display text-lead leading-none">Pick a country</p>
                  <p className="mt-2 text-muted">
                    Type a city above, or click a country on the map to see what you have added there.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
