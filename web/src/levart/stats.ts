// Pure functions: no React, no browser. Same input, same output. This is the logic
// that build step 10 will rewrite in C and compile to WebAssembly, so it stays small.

import type { Country } from "./types";
import type { Visits } from "./Levart";

export type Stats = {
  countriesVisited: number;
  countriesTotal: number;
  citiesVisited: number;
  citiesTotal: number;
  continentsVisited: number;
  continentsTotal: number;
  percent: number; // 0..100, one decimal
};

// "Percentage of the world explored": a blend of countries and cities, half each.
// Only countries that have at least one city in the dataset count as reachable.
export function computeStats(visits: Visits, countries: Record<string, Country>): Stats {
  const reachable = Object.values(countries).filter((country) => country.cities.length > 0);
  const countriesTotal = reachable.length;
  const citiesTotal = reachable.reduce((sum, country) => sum + country.cities.length, 0);
  // Antarctica has no real cities to tick (research stations only), so it never counts as a continent to reach.
  const continentsTotal = new Set(reachable.map((country) => country.continent)).size - (reachable.some((c) => c.continent === "Antarctica") ? 1 : 0);

  let countriesVisited = 0;
  let citiesVisited = 0;
  const continents = new Set<string>();
  for (const [numeric, cityIds] of Object.entries(visits)) {
    if (cityIds.length === 0) continue;
    const country = countries[numeric];
    if (!country) continue;
    countriesVisited += 1;
    citiesVisited += cityIds.length;
    if (country.continent !== "Antarctica") continents.add(country.continent);
  }

  const share =
    countriesTotal === 0 || citiesTotal === 0
      ? 0
      : 0.5 * (countriesVisited / countriesTotal) + 0.5 * (citiesVisited / citiesTotal);

  return {
    countriesVisited,
    countriesTotal,
    citiesVisited,
    citiesTotal,
    continentsVisited: continents.size,
    continentsTotal,
    percent: Math.round(share * 1000) / 10,
  };
}

export type Milestone = {
  id: string;
  label: string;
  reached: (stats: Stats) => boolean;
};

// In order of difficulty. Each is a plain predicate over the stats.
export const milestones: Milestone[] = [
  { id: "first-country", label: "First country", reached: (s) => s.countriesVisited >= 1 },
  { id: "ten-cities", label: "10 cities", reached: (s) => s.citiesVisited >= 10 },
  { id: "ten-countries", label: "10 countries", reached: (s) => s.countriesVisited >= 10 },
  { id: "fifty-cities", label: "50 cities", reached: (s) => s.citiesVisited >= 50 },
  { id: "twenty-five-countries", label: "25 countries", reached: (s) => s.countriesVisited >= 25 },
  { id: "every-continent", label: "Every continent", reached: (s) => s.continentsTotal > 0 && s.continentsVisited >= s.continentsTotal },
  { id: "hundred-cities", label: "100 cities", reached: (s) => s.citiesVisited >= 100 },
];

export function reachedMilestones(stats: Stats): Milestone[] {
  return milestones.filter((milestone) => milestone.reached(stats));
}
