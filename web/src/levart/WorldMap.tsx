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

export default function WorldMap({ selected, onSelect, isKnown, visited }: Props) {
  const [features, setFeatures] = useState<CountryFeature[] | null>(null);

  // Load the country shapes once, after the component first renders.
  // useEffect is where side effects like network requests go.
  useEffect(() => {
    let cancelled = false;
    fetch("/data/countries-110m.json")
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
  }, []);

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

        let fill = fills.unknown;
        let opacity = 0.6; // no data: fainter than land
        if (known) {
          fill = fills.land;
          opacity = 1;
        }
        if (isVisited) fill = fills.visited;
        if (isSelected) fill = fills.selected;

        return (
          <path
            key={id ?? `noid-${index}`}
            d={path(country) ?? undefined}
            fill={fill}
            style={{ fillOpacity: isVisited || isSelected ? 1 : `calc(var(--map-land-opacity) * ${opacity})` }}
            stroke="var(--map-stroke)"
            strokeWidth={0.6}
            className={`transition-[fill] duration-200 ${known ? "cursor-pointer hover:brightness-90" : ""}`}
            onClick={(event) => {
              event.stopPropagation(); // don't let the svg's onClick clear what we just set
              if (!known || id === null) return;
              onSelect(isSelected ? null : id);
            }}
          >
            <title>{country.properties.name}</title>
          </path>
        );
      })}
    </svg>
  );
}
