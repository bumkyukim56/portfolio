# Levart component (build step 11 prep)

`<Levart />` is the whole travel tracker: map, city checklists, stats, saving. Everything it needs is in this folder plus the two data files in `public/data/`.

## Props

```tsx
<Levart
  visited={["KR", "JP", "US"]}   // start with these countries' capitals ticked
  showStats={true}               // percentage, counts, milestones above the map
  storageKey="levart.visits"     // localStorage key; null = never save (read-only embed)
  dataUrl="/data"                // where world.json and countries-110m.json are served
/>
```

## What has to change before it can be published to npm as `levart`

1. **Styling.** The components use Tailwind utility classes, which only exist in a project that runs Tailwind. The package needs its own small stylesheet (`levart.css`) using the `--lv-*` and `--map-*` variables, with the utility classes replaced by plain class names. Consumers import the CSS once.
2. **Data.** Ship `world.json` and `countries-110m.json` inside the package and default `dataUrl` to the package's own copy (or let consumers host them and pass `dataUrl`).
3. **Build.** A library build (tsup or Vite library mode) emitting ESM + types, with `react`, `react-dom` as peer dependencies and `d3-geo`, `topojson-client` as dependencies.
4. **The iframe embed.** A tiny page at `/levart/embed` that renders `<Levart storageKey={null} visited={...from the query string} showStats />`, plus a snippet: `<iframe src="https://bumkyu.com/levart/embed?visited=KR,JP" width="800" height="520"></iframe>`.
5. **Publish.** `npm login` (BK's account), `npm publish --access public`. Check the name `levart` is free first: `npm view levart`.

Steps 1–3 are a mechanical refactor; do them after the Java backend so the storage layer is settled.
