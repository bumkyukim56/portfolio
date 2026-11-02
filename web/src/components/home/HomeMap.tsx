"use client";

import { useState } from "react";
import Link from "next/link";
import WorldMap from "@/levart/WorldMap";
import { trips } from "@/data/site";

// The live thing: BK's own Levart map with his visited countries filled.
// Click a filled country and its name appears; the plain fallback is the list beneath.
const visited = new Set(trips.map((trip) => trip.numeric));
const byNumeric = Object.fromEntries(trips.map((trip) => [trip.numeric, trip]));

export default function HomeMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const trip = selected ? byNumeric[selected] : undefined;

  return (
    <div data-ui className="map-on-band">
      <WorldMap
        selected={selected}
        onSelect={setSelected}
        isKnown={(id) => visited.has(id)}
        visited={visited}
      />
      <p className="mt-3 min-h-[1.5em]">
        {trip ? (
          <>
            <span className="font-medium">{trip.place}, {trip.country}.</span>{" "}
            <Link href="/levart" className="underline underline-offset-4">Mark your own</Link>
          </>
        ) : (
          <span className="text-muted">Seven countries filled. Click one.</span>
        )}
      </p>
    </div>
  );
}
