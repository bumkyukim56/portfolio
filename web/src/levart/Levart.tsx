"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WorldMap from "./WorldMap";
import CityPanel from "./CityPanel";
import StatsPanel from "./StatsPanel";
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
}: LevartProps = {}) {
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visits>({});
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
    } catch {
      // ignore
    }
  }, [visits, loaded, storageKey]);

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
          setVisits((previous) => {
            const next = { ...previous };
            for (const country of world.countries) {
              if (initialVisited.includes(country.code) && !(country.numeric in next) && country.cities[0]) {
                next[country.numeric] = [country.cities[0].id];
              }
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
      {showStats && <StatsPanel stats={stats} reached={reached} onReset={reset} />}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <div data-ui className="bg-[var(--lv-panel)] p-3 lg:col-span-8 sm:p-5">
        <WorldMap
          selected={selected}
          onSelect={setSelected}
          isKnown={(id) => id in countries}
          visited={visitedCountries}
          progress={progress}
          flagCode={(id) => countries[id]?.code.toLowerCase()}
          dataUrl={dataUrl}
        />
      </div>

      <div ref={panelRef} className="scroll-mt-4 lg:col-span-4">
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
