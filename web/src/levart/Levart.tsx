"use client";

import { useEffect, useState } from "react";
import WorldMap from "./WorldMap";
import type { Country, World } from "./types";

// Levart owns the state; WorldMap just draws and reports clicks.
// This "state lives in the parent" pattern is called lifting state up.
export default function Levart() {
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/world.json")
      .then((response) => response.json())
      .then((world: World) => {
        // Index by numeric id so lookups are O(1): like a HashMap<String, Country>.
        const byId: Record<string, Country> = {};
        for (const country of world.countries) byId[country.numeric] = country;
        setCountries(byId);
      });
  }, []);

  const country = selected ? countries[selected] : undefined;

  return (
    <div className="flex flex-col gap-4">
      <WorldMap
        selected={selected}
        onSelect={setSelected}
        isKnown={(id) => id in countries}
      />
      <div className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        {country ? (
          <p>
            <span className="font-semibold">{country.name}</span>
            <span className="text-zinc-500">
              {" "}· {country.continent} · {country.cities.length} cities
            </span>
          </p>
        ) : (
          <p className="text-zinc-500">Click a country.</p>
        )}
      </div>
    </div>
  );
}
