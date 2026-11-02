"use client";

import { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";

// The map's own coordinate system. The SVG scales to fit its container
// because of viewBox, so these are just proportions, not pixels.
const WIDTH = 960;
const HEIGHT = 500;

type CountryFeature = Feature<Geometry, { name: string }>;

type Props = {
  selected: string | null;                  // numeric id of the selected country
  onSelect: (numericId: string | null) => void;
  isKnown: (numericId: string) => boolean;  // do we have data for this shape?
  visited?: Set<string>;                    // numeric ids to fill as visited
  progress?: Record<string, number>;        // numeric id → share of cities ticked, 0..1
  flagCode?: (numericId: string) => string | undefined; // ISO alpha-2 for the flag image
  dataUrl?: string;                         // where countries-110m.json lives
};

// Fills come from the palette tokens so the map matches whatever ground it sits on.
// Colours come from CSS variables so the same component can take the portfolio's
// palette on the home page and Levart's own tone on /levart.
const fills = {
  unknown: "var(--map-land)",
  land: "var(--map-land)",
  visited: "var(--map-visited)",
  selected: "var(--map-selected)",
};

export default function WorldMap({ selected, onSelect, isKnown, visited, progress, flagCode, dataUrl = "/data" }: Props) {
  const [features, setFeatures] = useState<CountryFeature[] | null>(null);

  // Load the country shapes once, after the component first renders.
  // useEffect is where side effects like network requests go.
  useEffect(() => {
    let cancelled = false;
    fetch(`${dataUrl}/countries-110m.json`)
      .then((response) => response.json())
      .then((topology: Topology) => {
        if (cancelled) return;
        // TopoJSON is a compact encoding; feature() expands it to plain GeoJSON.
        const collection = feature(
          topology,
          topology.objects.countries as GeometryCollection<{ name: string }>,
        ) as FeatureCollection<Geometry, { name: string }>;
        setFeatures(collection.features);
      });
    return () => {
      cancelled = true; // ignore the response if the component unmounted meanwhile
    };
  }, [dataUrl]);

  // Build the projection and path generator once per dataset, not on every render.
  const path = useMemo(() => {
    if (!features) return null;
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
      type: "FeatureCollection",
      features,
    });
    return geoPath(projection);
  }, [features]);

  if (!features || !path) {
    return <div className="aspect-[960/500] w-full bg-surface" aria-hidden="true" />;
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="World map"
      onClick={() => onSelect(null)} // clicking the ocean clears the selection
    >
      {features.map((country, index) => {
        const id = country.id == null ? null : String(country.id);
        const known = id !== null && isKnown(id);
        const isSelected = id !== null && id === selected;
        const isVisited = id !== null && (visited?.has(id) ?? false);
        const share = id !== null ? (progress?.[id] ?? (isVisited ? 1 : 0)) : 0;
        const partial = isVisited && share > 0 && share < 1; // fills from the bottom
        const complete = isVisited && share >= 1;            // shows the flag
        const d = path(country) ?? undefined;
        // The country's box in map coordinates: [[minX, minY], [maxX, maxY]].
        const [[x0, y0], [x1, y1]] = path.bounds(country);
        const flag = complete && id !== null ? flagCode?.(id) : undefined;

        let fill = fills.unknown;
        let opacity = 0.6; // no data: fainter than land
        if (known) {
          fill = fills.land;
          opacity = 1;
        }
        if (isVisited) fill = fills.visited;
        if (isSelected) fill = fills.selected;

        // A partly visited country keeps the land colour and gets a second copy of its
        // own shape on top, clipped to the bottom `share` of its box: the fill-up.
        const baseFill = partial ? fills.land : fill;
        const baseOpacity = partial
          ? "var(--map-land-opacity)"
          : isVisited || isSelected
            ? 1
            : `calc(var(--map-land-opacity) * ${opacity})`;
        const select = (event: React.MouseEvent) => {
          event.stopPropagation(); // don't let the svg's onClick clear what we just set
          if (!known || id === null) return;
          onSelect(isSelected ? null : id);
        };
        const key = id ?? `noid-${index}`;

        return (
          <g key={key} className={known ? "cursor-pointer" : undefined} onClick={select}>
            <path
              d={d}
              fill={baseFill}
              style={{ fillOpacity: baseOpacity }}
              stroke="var(--map-stroke)"
              strokeWidth={0.6}
              className={`transition-[fill] duration-200 ${known && !flag ? "hover:brightness-90" : ""}`}
            >
              <title>{country.properties.name}</title>
            </path>

            {partial && (
              <>
                <clipPath id={`fill-${key}`}>
                  <rect
                    x={x0}
                    y={y0 + (y1 - y0) * (1 - share)}
                    width={x1 - x0}
                    height={(y1 - y0) * share}
                    style={{ transition: "y 500ms cubic-bezier(0.2, 0.7, 0.2, 1), height 500ms cubic-bezier(0.2, 0.7, 0.2, 1)" }}
                  />
                </clipPath>
                <path d={d} fill={isSelected ? fills.selected : fills.visited} clipPath={`url(#fill-${key})`} pointerEvents="none" />
              </>
            )}

            {flag && (
              <>
                <clipPath id={`flag-${key}`}>
                  <path d={d} />
                </clipPath>
                <g className="flag-in" style={{ transformOrigin: `${(x0 + x1) / 2}px ${(y0 + y1) / 2}px` }}>
                  <image
                    href={`https://flagcdn.com/w320/${flag}.png`}
                    x={x0}
                    y={y0}
                    width={x1 - x0}
                    height={y1 - y0}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#flag-${key})`}
                    pointerEvents="none"
                  />
                  {isSelected && <path d={d} fill="none" stroke={fills.selected} strokeWidth={1.5} pointerEvents="none" />}
                </g>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
