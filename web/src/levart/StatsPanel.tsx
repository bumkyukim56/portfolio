"use client";

import type { Stats, Milestone } from "./stats";
import { milestones } from "./stats";

type Props = {
  stats: Stats;
  reached: Milestone[];
  onReset: () => void;
};

// The figures. The percentage leads; four counts follow in tabular figures; the
// milestones sit beneath, reached ones in lime.
export default function StatsPanel({ stats, reached, onReset }: Props) {
  const reachedIds = new Set(reached.map((milestone) => milestone.id));
  const figures = [
    { label: "Countries", value: stats.countriesVisited, total: stats.countriesTotal },
    { label: "Cities", value: stats.citiesVisited, total: stats.citiesTotal },
    { label: "Continents", value: stats.continentsVisited, total: stats.continentsTotal },
  ];

  return (
    <section aria-label="Your progress" className="bg-[var(--lv-panel)] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <p className="font-display text-lead leading-none tabular-nums sm:text-[2.5rem]">{stats.percent}%</p>
          <p className="mt-2 text-muted">of the world explored</p>
        </div>
        <dl className="grid grid-cols-3 gap-x-8 tabular-nums">
          {figures.map((figure) => (
            <div key={figure.label}>
              <dt className="text-small text-muted">{figure.label}</dt>
              <dd className="text-lead leading-tight">
                {figure.value}
                <span className="text-small text-muted"> / {figure.total}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Milestones">
        {milestones.map((milestone) => {
          const on = reachedIds.has(milestone.id);
          return (
            <li
              key={milestone.id}
              className={`px-3 py-1 text-small ${on ? "bg-[var(--lv-lime)] text-ink" : "bg-[var(--lv-ground)] text-muted"}`}
              aria-label={`${milestone.label}${on ? ", reached" : ""}`}
            >
              {milestone.label}
            </li>
          );
        })}
      </ul>

      {stats.countriesVisited > 0 && (
        <button type="button" onClick={onReset} className="mt-5 min-h-11 underline underline-offset-4 text-muted">
          Start over
        </button>
      )}
    </section>
  );
}
