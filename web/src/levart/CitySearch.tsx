"use client";

import { useId, useMemo, useState } from "react";
import type { Country } from "./types";

type Props = {
  countries: Record<string, Country>;
  onAdd: (numeric: string, cityId: number) => void;
  isAdded: (numeric: string, cityId: number) => boolean;
};

type Entry = { id: number; name: string; numeric: string; country: string; key: string };

// A combobox: type a city, pick one from the suggestions with the mouse or the
// arrow keys and Enter. The list of all cities is built once from the dataset.
export default function CitySearch({ countries, onAdd, isAdded }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const index = useMemo<Entry[]>(() => {
    const entries: Entry[] = [];
    for (const country of Object.values(countries)) {
      for (const city of country.cities) {
        entries.push({
          id: city.id,
          name: city.name,
          numeric: country.numeric,
          country: country.name,
          key: `${city.name} ${country.name}`.toLowerCase(),
        });
      }
    }
    return entries;
  }, [countries]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    // Names that start with the query first, then names that merely contain it.
    const starts = index.filter((entry) => entry.name.toLowerCase().startsWith(q));
    const contains = index.filter((entry) => !entry.name.toLowerCase().startsWith(q) && entry.key.includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [index, query]);

  function choose(entry: Entry) {
    if (!isAdded(entry.numeric, entry.id)) onAdd(entry.numeric, entry.id);
    setQuery("");
    setActive(0);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (matches.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="block font-display text-lead leading-none">
        Where have you been?
      </label>
      <input
        id={`${listId}-input`}
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        placeholder="Type a city, like Lisbon"
        autoComplete="off"
        role="combobox"
        aria-expanded={matches.length > 0}
        aria-controls={listId}
        aria-activedescendant={matches.length > 0 ? `${listId}-${active}` : undefined}
        className="mt-3 min-h-[52px] w-full bg-[var(--lv-ground)] px-4 text-body text-ink placeholder:text-muted"
      />
      {matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 z-20 mt-1 bg-[var(--lv-ground)] py-1"
        >
          {matches.map((entry, index) => {
            const added = isAdded(entry.numeric, entry.id);
            return (
              <li
                key={entry.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault(); // keep focus in the input
                  choose(entry);
                }}
                onMouseEnter={() => setActive(index)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 px-4 ${index === active ? "bg-[var(--lv-mint)]" : ""}`}
              >
                <span>
                  {entry.name}
                  <span className="text-muted">, {entry.country}</span>
                </span>
                {added && <span className="text-small text-muted">added</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
