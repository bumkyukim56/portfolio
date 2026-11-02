"use client";

import type { Country } from "./types";

type Props = {
  country: Country;
  checked: Set<number>;               // ids of this country's cities BK has ticked
  onToggle: (cityId: number) => void;
  onClose: () => void;
};

// The side panel: one country's cities as a checklist. It owns no state; the parent
// passes what is checked and a function to call when a box is toggled.
export default function CityPanel({ country, checked, onToggle, onClose }: Props) {
  const total = country.cities.length;
  const done = country.cities.filter((city) => checked.has(city.id)).length;

  return (
    <aside aria-label={`Cities in ${country.name}`} className="bg-[var(--lv-panel)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lead leading-none">{country.name}</h2>
          <p className="mt-2 text-muted">
            {country.continent} · {done} of {total} cities
          </p>
        </div>
        <button type="button" onClick={onClose} className="min-h-11 underline underline-offset-4">
          Close
        </button>
      </div>

      {total === 0 ? (
        <p className="mt-5 text-muted">No cities in the dataset for this place.</p>
      ) : (
        <ul className="mt-4 flex flex-col">
          {country.cities.map((city) => {
            const on = checked.has(city.id);
            const isCapital = city.name === country.capital;
            return (
              <li key={city.id}>
                {/* A label wrapping the input makes the whole row clickable, 44px tall for thumbs. */}
                <label className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onToggle(city.id)}
                    className="h-5 w-5 accent-[var(--lv-mint-deep)]"
                  />
                  <span className={on ? "font-medium" : ""}>{city.name}</span>
                  {isCapital && <span className="text-small text-muted">capital</span>}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
