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
      <div data-ui className="bg-surface p-3 sm:p-5">
        <WorldMap
          selected={selected}
          onSelect={setSelected}
          isKnown={(id) => id in countries}
        />
      </div>
      <div className="bg-surface px-5 py-4">
        {country ? (
          <p>
            <span className="font-medium">{country.name}</span>
            <span className="text-muted">
              {" "}· {country.continent} · {country.cities.length} cities
            </span>
          </p>
        ) : (
          <p className="text-muted">Click a country.</p>
        )}
      </div>
    </div>
  );
}
