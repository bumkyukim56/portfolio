"use client";

import type { Country } from "./types";

type Props = {
  country: Country;
  added: Set<number>;                 // ids of this country's cities BK has added
  onRemove: (cityId: number) => void;
  onClose: () => void;
};

// The side panel for one country: the cities added so far, each removable, and
// how many of the country's cities are still to go. Cities are added by typing
// in the search box above the map.
export default function CityPanel({ country, added, onRemove, onClose }: Props) {
  const total = country.cities.length;
  const cities = country.cities.filter((city) => added.has(city.id));
  const remaining = country.cities.filter((city) => !added.has(city.id));

  return (
    <aside aria-label={`Cities in ${country.name}`} className="bg-[var(--lv-panel)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lead leading-none">{country.name}</h2>
          <p className="mt-2 text-muted">
            {country.continent} · {cities.length} of {total} cities
          </p>
        </div>
        <button type="button" onClick={onClose} className="min-h-11 underline underline-offset-4">
          Close
        </button>
      </div>

      {cities.length > 0 ? (
        <ul className="mt-4 flex flex-col">
          {cities.map((city) => (
            <li key={city.id} className="flex min-h-11 items-center justify-between gap-4">
              <span className="font-medium">
                {city.name}
                {city.name === country.capital && <span className="ml-2 text-small font-normal text-muted">capital</span>}
              </span>
              <button type="button" onClick={() => onRemove(city.id)} className="min-h-11 text-small text-muted underline underline-offset-4">
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-muted">Nothing here yet. Type a city above to add it.</p>
      )}

      {remaining.length > 0 && (
        <p className="mt-4 text-small text-muted">
          Still to see: {remaining.slice(0, 6).map((city) => city.name).join(", ")}
          {remaining.length > 6 ? ` and ${remaining.length - 6} more` : ""}.
        </p>
      )}
    </aside>
  );
}
