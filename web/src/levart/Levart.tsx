"use client";

import { useEffect, useMemo, useState } from "react";
import WorldMap from "./WorldMap";
import CityPanel from "./CityPanel";
import type { Country, World } from "./types";

// What the user has ticked: country numeric id → the ids of cities seen there.
// A plain object keyed by string, like a HashMap<String, List<Integer>>.
export type Visits = Record<string, number[]>;

// Levart owns all state; WorldMap and CityPanel just draw and report events.
export default function Levart() {
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visits>({});

  useEffect(() => {
    fetch("/data/world.json")
      .then((response) => response.json())
      .then((world: World) => {
        const byId: Record<string, Country> = {};
        for (const country of world.countries) byId[country.numeric] = country;
        setCountries(byId);
      });
  }, []);

  // Toggle one city. State is never mutated in place: we build a new object so
  // React sees the change (compare: returning a new list instead of editing one).
  function toggleCity(numeric: string, cityId: number) {
    setVisits((previous) => {
      const current = previous[numeric] ?? [];
      const next = current.includes(cityId)
        ? current.filter((id) => id !== cityId)
        : [...current, cityId];
      return { ...previous, [numeric]: next };
    });
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

  const country = selected ? countries[selected] : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <div data-ui className="bg-[var(--lv-panel)] p-3 lg:col-span-8 sm:p-5">
        <WorldMap
          selected={selected}
          onSelect={setSelected}
          isKnown={(id) => id in countries}
          visited={visitedCountries}
          progress={progress}
          flagCode={(id) => countries[id]?.code.toLowerCase()}
        />
      </div>

      <div className="lg:col-span-4">
        {country ? (
          <CityPanel
            country={country}
            checked={new Set(visits[country.numeric] ?? [])}
            onToggle={(cityId) => toggleCity(country.numeric, cityId)}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div className="bg-[var(--lv-panel)] p-5 sm:p-6">
            <p className="font-display text-lead leading-none">Pick a country</p>
            <p className="mt-2 text-muted">
              Click one on the map to see its cities, then tick the ones you have been to.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
