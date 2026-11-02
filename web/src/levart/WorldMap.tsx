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
  cities?: (numericId: string) => { id: number; name: string; added: boolean }[]; // the sections of a selected country
  onToggleCity?: (numericId: string, cityId: number) => void;                       // clicking a section
  colorOf?: (numericId: string) => string | undefined;  // the country's own colour (from its flag)
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

export default function WorldMap({ selected, onSelect, isKnown, visited, progress, cities, onToggleCity, colorOf, flagCode, dataUrl = "/data" }: Props) {
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

  // The zoom. When a country is selected the whole map group is scaled and moved so that
  // country fills the frame with some air around it. One CSS transition on `transform`
  // does the flight; nothing is re-projected.
  const zoom = useMemo(() => {
    if (!features || !path || !selected) return { k: 1, tx: 0, ty: 0 };
    const target = features.find((country) => country.id != null && String(country.id) === selected);
    if (!target) return { k: 1, tx: 0, ty: 0 };
    const [[x0, y0], [x1, y1]] = path.bounds(target);
    const padding = 1.35;
    const k = Math.min(10, WIDTH / ((x1 - x0) * padding), HEIGHT / ((y1 - y0) * padding));
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    return { k, tx: WIDTH / 2 - k * cx, ty: HEIGHT / 2 - k * cy };
  }, [features, path, selected]);

  if (!features || !path) {
    return <div className="aspect-[960/500] w-full bg-surface" aria-hidden="true" />;
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="World map"
      onClick={() => onSelect(null)} // clicking the ocean clears the selection and zooms back out
    >
      <g
        style={{
          transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.k})`,
          transformOrigin: "0 0",
          transition: "transform 800ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
      {features.map((country, index) => {
        const id = country.id == null ? null : String(country.id);
        const known = id !== null && isKnown(id);
        const isSelected = id !== null && id === selected;
        const isVisited = id !== null && (visited?.has(id) ?? false);
        const share = id !== null ? (progress?.[id] ?? (isVisited ? 1 : 0)) : 0;
        const complete = isVisited && share >= 1;            // the whole flag
        const d = path(country) ?? undefined;
        // The country's box in map coordinates: [[minX, minY], [maxX, maxY]].
        const [[x0, y0], [x1, y1]] = path.bounds(country);
        const code = id !== null ? flagCode?.(id) : undefined;
        const own = id !== null ? colorOf?.(id) : undefined;

        // The selected country divides into one vertical section per city, in the order of the
        // dataset (capital first). Sections for cities you have added show the flag through them.
        const sections = isSelected && !complete && id !== null ? (cities?.(id) ?? []) : [];
        const strips = sections.length;
        const addedSections = sections.filter((city) => city.added).length;
        const showFlag = code && (complete || addedSections > 0);

        let fill = fills.unknown;
        let opacity = 0.6; // no data: fainter than land
        if (known) {
          fill = fills.land;
          opacity = 1;
        }
        if (isVisited) fill = own ?? fills.visited;
        if (isSelected && !isVisited) fill = fills.selected;

        const baseOpacity = isVisited || isSelected ? 1 : `calc(var(--map-land-opacity) * ${opacity})`;
        const select = (event: React.MouseEvent) => {
          event.stopPropagation(); // don't let the svg's onClick clear what we just set
          if (!known || id === null) return;
          onSelect(isSelected ? null : id);
        };
        const key = id ?? `noid-${index}`;
        const stripWidth = strips > 0 ? (x1 - x0) / strips : 0;
        const k = zoom.k; // so strokes and labels keep their on-screen size when zoomed in

        return (
          <g key={key} className={known ? "cursor-pointer" : undefined} onClick={select}>
            <path
              d={d}
              fill={fill}
              style={{ fillOpacity: baseOpacity }}
              stroke={isSelected ? fills.selected : "var(--map-stroke)"}
              strokeWidth={isSelected ? 1.2 : 0.6}
              vectorEffect="non-scaling-stroke"
              className={`transition-[fill] duration-200 ${known && !showFlag ? "hover:brightness-90" : ""}`}
            >
              <title>{country.properties.name}</title>
            </path>

            {/* The sections of the selected country: dividers, a click target and a label each. */}
            {strips > 0 && (
              <>
                <clipPath id={`shape-${key}`}>
                  <path d={d} />
                </clipPath>
                <g clipPath={`url(#shape-${key})`}>
                  {sections.map((city, i) => {
                    const sx = x0 + stripWidth * i;
                    return (
                      <g key={city.id}>
                        {i > 0 && (
                          <line x1={sx} x2={sx} y1={y0} y2={y1} stroke="var(--map-stroke)" strokeWidth={1} vectorEffect="non-scaling-stroke" pointerEvents="none" />
                        )}
                        <rect
                          x={sx}
                          y={y0}
                          width={stripWidth}
                          height={y1 - y0}
                          fill="transparent"
                          className="cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (id !== null) onToggleCity?.(id, city.id);
                          }}
                        >
                          <title>{city.added ? `${city.name}: added. Click to remove.` : `${city.name}: click to add.`}</title>
                        </rect>
                      </g>
                    );
                  })}
                </g>
              </>
            )}

            {showFlag && (
              <>
                <clipPath id={`flag-${key}`}>
                  {complete ? (
                    <path d={d} />
                  ) : (
                    // One rectangle per added section; the flag group below is clipped to the outline too.
                    sections.map((city, i) =>
                      city.added ? <rect key={city.id} x={x0 + stripWidth * i} y={y0} width={stripWidth} height={y1 - y0} /> : null,
                    )
                  )}
                </clipPath>
                <g className={complete ? "flag-in" : undefined} style={{ transformOrigin: `${(x0 + x1) / 2}px ${(y0 + y1) / 2}px` }} pointerEvents="none">
                  <g clipPath={complete ? undefined : `url(#shape-${key})`}>
                    <image
                      href={`https://flagcdn.com/w320/${code}.png`}
                      x={x0}
                      y={y0}
                      width={x1 - x0}
                      height={y1 - y0}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#flag-${key})`}
                    />
                  </g>
                  {isSelected && <path d={d} fill="none" stroke={fills.selected} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />}
                </g>
              </>
            )}

            {/* Labels, drawn last so they sit above the flag. Vertical, one per section, sized for the screen. */}
            {strips > 0 && (
              <g clipPath={`url(#shape-${key})`} pointerEvents="none" aria-hidden="true">
                {sections.map((city, i) => {
                  const mid = x0 + stripWidth * (i + 0.5);
                  const fontSize = Math.min(13 / k, stripWidth * 0.7);
                  return (
                    <text
                      key={city.id}
                      x={mid}
                      y={(y0 + y1) / 2}
                      fontSize={fontSize}
                      fontFamily="var(--font-text)"
                      fontWeight={city.added ? 500 : 400}
                      fill="var(--ink)"
                      stroke="var(--map-stroke)"
                      strokeWidth={fontSize * 0.25}
                      paintOrder="stroke"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(-90 ${mid} ${(y0 + y1) / 2})`}
                    >
                      {city.name}
                    </text>
                  );
                })}
              </g>
            )}
          </g>
        );
      })}
      </g>
    </svg>
  );
}
