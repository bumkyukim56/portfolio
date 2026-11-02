"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WorldMap from "./WorldMap";
import CityPanel from "./CityPanel";
import StatsPanel from "./StatsPanel";
import Confetti from "./Confetti";
import { computeStats, reachedMilestones } from "./stats";
import type { Country, World } from "./types";

const STORAGE_KEY = "levart.visits";

// What the user has ticked: country numeric id → the ids of cities seen there.
// A plain object keyed by string, like a HashMap<String, List<Integer>>.
export type Visits = Record<string, number[]>;

// Levart owns all state; WorldMap and CityPanel just draw and report events.
export default function Levart() {
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visits>({});
  const [loaded, setLoaded] = useState(false); // true once localStorage has been read
  const [burst, setBurst] = useState(0);       // increments when a new milestone is reached
  const seenMilestones = useRef<Set<string> | null>(null);

  // Read saved visits once, after the first render. The server can't see localStorage,
  // so starting empty and loading in an effect keeps server and browser HTML identical.
  // (The lint rule against setting state inside an effect is right in general; here it is
  // the standard way to pick up browser-only data after hydration, so it is switched off once.)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setVisits(JSON.parse(raw) as Visits);
    } catch {
      // private mode or blocked storage: carry on without saving
    }
    setLoaded(true);
  }, []);

  // Save on every change, but not before the first load (that would wipe the saved data).
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    } catch {
      // ignore
    }
  }, [visits, loaded]);

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
    if (!window.confirm("Clear every ticked city and start over?")) return;
    setVisits({});
    setSelected(null);
  }

  const country = selected ? countries[selected] : undefined;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Confetti burst={burst} />
      <StatsPanel stats={stats} reached={reached} onReset={reset} />
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
    </div>
  );
}
