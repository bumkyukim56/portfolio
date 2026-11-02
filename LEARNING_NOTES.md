# Learning Notes

Running summary of new concepts covered each session. Newest session at the bottom.

---

## Session 1 — 2026-11-01 — Build step 1: scaffold the Next.js portfolio

### What we did
- Scaffolded a Next.js 16 app into `web/` with `create-next-app`, using TypeScript, Tailwind CSS v4, ESLint, the App Router, and a `src/` directory.
- Moved the git repository to the top-level `portfolio+levart/` folder so `web/` can later sit beside `backend/` (Java), `scripts/` (Python), and `wasm/` (C).
- Ran the dev server (`npm run dev` inside `web/`) and confirmed the default page renders at http://localhost:3000.

### Concepts

**Scaffolding tool.** `create-next-app` is to Next.js what Spring Initializr is to Spring Boot: it generates the boilerplate so you start from a working app.

**package.json = pom.xml / requirements.txt.** It lists dependencies (what the app needs to run) and devDependencies (what you need only while developing, like TypeScript and ESLint). The `scripts` section defines named commands: `npm run dev`, `npm run build`, `npm run lint`.

**node_modules/ is the installed library folder.** Like a Python venv's `site-packages` or Maven's `.m2`. It is huge and is regenerated from `package-lock.json` with `npm install`, so it is git-ignored.

**TypeScript.** JavaScript plus static types. `function f(x: number): string` reads like Java. Unlike Java, TypeScript types are erased at build time; they exist only to catch mistakes before the code runs. `tsconfig.json` is the compiler config, with `"strict": true` turning on the strongest checks.

**The App Router: folders are routes.** Under `src/app/`, every folder with a `page.tsx` becomes a URL. `src/app/page.tsx` is `/`, and later `src/app/projects/page.tsx` will be `/projects`. This is file-based routing; there is no routing table to maintain.

**layout.tsx vs page.tsx.** `layout.tsx` is the shared wrapper (the `<html>` and `<body>`, fonts, and later the nav bar and footer). `page.tsx` is the content for one URL. The page is passed into the layout as `children`, the same way a Jinja base template wraps a child template in Python.

**Components are functions returning JSX.** `export default function Home() { return <div>...</div> }`. JSX looks like HTML inside JavaScript. The browser never sees JSX; the build step compiles it to ordinary function calls.

**Tailwind CSS.** Instead of writing CSS rules in a separate file, you add utility classes directly on elements: `className="flex items-center text-lg"`. In React, the attribute is `className`, not `class`, because `class` is a reserved word in JavaScript.

**globals.css with Tailwind v4.** A single `@import "tailwindcss";` line pulls in the framework. `@theme` declares design tokens (colors, fonts) as CSS variables, so `bg-background` becomes a usable class.

**Import alias `@/`.** `@/components/Nav` maps to `src/components/Nav`. Configured under `paths` in `tsconfig.json`. Avoids long `../../../` chains.

**ESLint.** A linter like Checkstyle (Java) or Pylint (Python). Catches likely bugs and style problems. Config lives in `eslint.config.mjs`.

**.gitignore.** Lists what git should never track: `node_modules/`, build output in `.next/`, and `.env*` secret files.

### Added later in session 1: git remotes, SSH keys, and deploying

**Local vs remote repo.** `git init` made a local repo on your Mac (history in `.git/`). GitHub holds a remote copy. `git remote add origin <url>` names the remote; `git push -u origin main` uploads the `main` branch and remembers the pairing so later pushes are just `git push`.

**Why the empty GitHub repo.** If GitHub had added a README, it would have made its own first commit, and the two histories would conflict with the commit already on your Mac.

**SSH keys.** A key pair: private key stays on the Mac (`~/.ssh/id_ed25519`), public key (`.pub`) gets pasted into GitHub. Git proves who you are by signing a challenge with the private key; GitHub checks the signature with the public key. No password or token needed. The private key can itself be locked with a passphrase; `ssh-add --apple-use-keychain` unlocks it once and stores the passphrase in macOS Keychain.

**Two GitHub accounts, one Mac.** Git's HTTPS credentials in the keychain belonged to one account, while the repo was under another. SSH sidestepped that: the remote URL `git@github.com:...` uses the key, while `https://github.com/...` uses the keychain password/token.

**Vercel deploy pipeline.** Vercel is linked to the GitHub repo with Root Directory set to `web`. Every push to `main` triggers `npm install`, `npm run build`, and a new production deploy. No manual upload needed. Site: https://bumkyu.vercel.app (Vercel project `bumkyu`), custom domain bumkyu.com pending purchase.

**Three separate authorizations Vercel needed.** (1) CLI login, (2) a "login connection" tying the Vercel account to a GitHub account, (3) installing Vercel's GitHub app on that account so it can read the repo and receive push notifications.

**Vercel framework preset.** When a Vercel project is created by hand (not by `vercel deploy`), it has no framework preset, so Vercel builds the app but doesn't know how to serve a Next.js output and every URL returns NOT_FOUND. Fix: set the preset to Next.js (`vercel project update <name> --framework nextjs`) and redeploy. Lesson: a green "Ready" build does not mean the site works; always open the URL.

### Common mistakes to watch for
- Writing `class=` instead of `className=` in JSX.
- Forgetting that `page.tsx` must have a `default` export, or Next.js won't recognize it as a route.
- Running `npm run dev` from the wrong folder. It must be run inside `web/`.
- Editing `node_modules/` directly. Changes there vanish on the next install.

### Check-in questions
1. If you create `src/app/levart/page.tsx`, what URL does it serve?
2. What is the difference between `layout.tsx` and `page.tsx`?
3. Why is `node_modules/` git-ignored but `package-lock.json` is committed?

---

## Session 2 — 2026-11-02 — Build step 2: Home and Projects pages

### What we did
- Added `src/data/site.ts` (personal info) and `src/data/projects.ts` (project list) so content lives apart from layout.
- Added three components: `Nav`, `Footer`, `ProjectCard`.
- Rewrote `layout.tsx` to wrap every page with the nav and footer, and `page.tsx` as the real home page.
- Added `/projects` and a placeholder `/levart`.
- Lint, build, preview on desktop and mobile, push, auto-deploy.

### Concepts

**Data vs presentation.** Pages never contain your name or project text directly; they import it. To add a project you append to one array. Compare: a Java `record Project(...)` plus a `List<Project>`, with the UI code as methods that take a `Project`.

**TypeScript types are shapes.** `type Project = { title: string; tech: string[]; featured?: boolean }` describes an object's shape. `?` means optional. `const projects: Project[] = [...]` makes the compiler check every element. Types vanish at build time; they're only for catching mistakes early, unlike Java where types exist at runtime too.

**Components and props.** A component is a function that returns JSX. Its single parameter is the props object, destructured in the signature: `function ProjectCard({ project }: { project: Project })`. Calling it looks like HTML: `<ProjectCard project={p} />`.

**Server vs Client Components.** By default every component renders on the server and ships as HTML, with no JavaScript for it in the browser. Add `"use client"` at the top of a file only when it needs browser-only things: current URL, click handlers, state. `Nav.tsx` is our only client component, because `usePathname()` needs the browser URL.

**Hooks.** `usePathname()` is a hook: a function starting with `use` that gives a component access to React or framework state. Hooks only work in client components and must be called at the top of the function body, not inside loops or conditions.

**Rendering lists with map().** `{projects.map((p) => <ProjectCard key={p.slug} project={p} />)}`. Like a Python list comprehension that produces JSX elements. Every item needs a unique `key` so React can track which element is which when the list changes.

**Ternary in JSX.** `{site.photo ? <Image ... /> : <div>BK</div>}` is Python's `a if cond else b`. You can't use an `if` statement inside JSX because JSX expects expressions, not statements.

**Layout nesting.** `layout.tsx` renders `<Nav />`, then `{children}`, then `<Footer />`. `children` is whichever `page.tsx` matched the URL. Change the layout once and every page changes.

**Metadata.** `export const metadata = { title: ... }` in a page sets its `<title>`. The layout's `title.template` turns "Projects" into "Projects · Bumkyu Kim".

**next/link vs <a>.** Use `<Link>` for internal routes: it navigates without a full page reload and prefetches. Plain `<a>` is fine for external links and `mailto:`.

**Responsive Tailwind.** Classes without a prefix apply at all widths; `sm:` prefixed classes apply from 640px up. `flex-col sm:flex-row` means stacked on phones, side by side on larger screens.

**JSX text escaping.** A raw `'` in JSX text triggers the lint rule `react/no-unescaped-entities`. Write `&apos;` or put the string in braces: `{"I've"}`.

**Dev server hot reload can glitch.** Creating a new file that an existing file already imports can leave a stale module in the dev server. The error mentions "module factory is not available". A hard reload fixes it; it's not a bug in your code.

### Common mistakes to watch for
- Forgetting `key` on list items (React warns in the console).
- Adding `"use client"` everywhere "just in case". It makes the bundle bigger and disables server rendering benefits. Add it only where needed.
- Calling a hook inside an `if` or a loop.
- Using `<a href="/projects">` instead of `<Link>` for internal pages.

### Your TODOs in `src/data/site.ts`
- Replace the placeholder bio.
- Replace `you@example.com` with your real contact email.
- Replace the LinkedIn URL.
- Optionally add `web/public/photo.jpg` and uncomment the `photo` line.

### Check-in questions
1. Why is `Nav.tsx` the only file with `"use client"`? What would break if you removed that line?
2. If you add a third project to `projects.ts` with `featured: true`, which pages change, and why?
3. What does `key={project.slug}` do, and why isn't the array index a good key?

---

## Session 3 — 2026-11-02 — Build step 3: countries and cities dataset

### What we did
- Wrote `scripts/build_world_data.py`: downloads GeoNames `countryInfo.txt` and `cities5000.zip`, keeps the capital plus the biggest cities per country (max 15), writes `web/src/data/world.json`.
- Result: 250 countries, 3,093 cities, 272 KB. Five uninhabited territories have no cities. Two defunct countries that GeoNames still lists are skipped.
- Raw downloads are cached in `scripts/data/` (git-ignored). Only the generated JSON is committed.

### Concepts

**Derived data belongs to a script, not to your hands.** If the rules change (20 cities, drop territories), edit a constant and re-run. The output is reproducible from the source files.

**Type hints in Python.** `def pick_cities(cities: list[dict]) -> list[dict]:` documents intent and lets editors catch mistakes, like TypeScript does for the frontend. Python doesn't enforce them at runtime, same as TypeScript after compilation.

**pathlib.** `ROOT / "web" / "src"` builds paths with `/` thanks to operator overloading, which Java doesn't have. `Path(__file__).resolve().parent.parent` finds the project root no matter where you run the script from.

**Grouping with setdefault.** `by_country.setdefault(code, []).append(city)` creates the list on first use. `collections.defaultdict(list)` does the same with less typing.

**Tab-separated files.** GeoNames uses tabs, not commas. `csv.reader(..., delimiter="\t", quoting=csv.QUOTE_NONE)` handles it; the quoting flag matters because some city names contain quote characters.

**Streaming a zip in memory.** `zipfile.ZipFile(path).read("cities5000.txt")` pulls one file out of the archive without extracting to disk.

**Why the capital rule.** Sorting purely by population drops some capitals (Canberra, Washington, Ottawa all lose to bigger cities). Picking `feature_code == "PPLC"` first guarantees one per country.

**Two codes per country.** The map library identifies countries by ISO numeric id ("410"), flag images by ISO alpha-2 ("kr"). We store both so step 4 and step 6 each have what they need.

**Guarding main.** `if __name__ == "__main__": sys.exit(main())` means `import build_world_data` in a test won't trigger a download.

### Common mistakes to watch for
- Committing raw downloads. Keep caches git-ignored; commit only the generated, cleaned output.
- Trusting source data blindly. This file had a trailing space in one name and two countries that no longer exist.
- Forgetting `encoding="utf-8"` when opening text files with non-ASCII names.

### Check-in questions
1. What would change in the output if you removed the `capitals[:1] +` part of `pick_cities`?
2. Why is `scripts/data/` git-ignored but `web/src/data/world.json` committed?
3. The JSON is 272 KB and the browser will download it. What's one way to make it smaller without losing cities?

---

## Session 4 — 2026-11-02 — Build step 4: clickable world map

### What we did
- Installed `d3-geo` (projection + path generator) and `topojson-client` (unpacks compact shapes), plus `world-atlas` for the country shapes.
- Moved both JSON files to `web/public/data/` so the browser fetches them only on `/levart` instead of bundling 380 KB into every page.
- Wrote `src/levart/types.ts`, `WorldMap.tsx`, `Levart.tsx`. The `/levart` page renders `<Levart />`.
- 174 of 175 map shapes match our dataset by ISO numeric id (Kosovo has no id in the map file).

### Concepts

**An SVG map is just paths.** Each country is a polygon of lat/lng points. A projection (`geoNaturalEarth1`) maps lat/lng to x/y; a path generator (`geoPath`) turns the polygon into the `d` attribute of an SVG `<path>`. One `<path>` per country, each stylable and clickable like any element.

**TopoJSON vs GeoJSON.** TopoJSON stores shared borders once, so the file is small. `feature(topology, object)` expands it into GeoJSON, which is what d3 wants.

**viewBox.** `<svg viewBox="0 0 960 500" className="w-full">` draws in a 960×500 coordinate system and scales to whatever width the container has. No pixel math.

**useEffect for side effects.** Network requests, timers, subscriptions: anything that reaches outside React goes in `useEffect`. The empty dependency array `[]` means "run once after the first render". The returned cleanup function runs on unmount; we use a `cancelled` flag so a late response doesn't update an unmounted component.

**useMemo for expensive computations.** Building the projection and path generator costs real work. `useMemo(() => ..., [features])` reruns it only when `features` changes, not on every click.

**Lifting state up.** `Levart` owns `selected`; `WorldMap` receives it as a prop and reports clicks via `onSelect`. Data flows down, events flow up. The child never changes the parent's state directly; it calls a function it was handed. Compare a Java listener/callback interface.

**event.stopPropagation().** The `<svg>` has an onClick that clears the selection (ocean click). A country's onClick would bubble up to it and immediately clear what it just set, unless it stops propagation.

**Record<string, Country> as a HashMap.** `byId[country.numeric] = country` gives O(1) lookup by id, the same job as `HashMap<String, Country>` in Java or a dict in Python.

**Render-time branching.** `if (!features) return <skeleton />` early-returns a loading placeholder. Below it, the code can assume data exists; TypeScript narrows the type accordingly.

**Tailwind on SVG.** `fill-zinc-300 hover:fill-zinc-400 dark:fill-zinc-700` work on `<path>` the same way `bg-*` works on divs.

### Common mistakes to watch for
- Forgetting the `[]` dependency array on an effect: it would refetch on every render, forever.
- Computing the projection inside the render body without `useMemo`: works, but recomputes 175 paths per click.
- Missing `stopPropagation` on nested click handlers.
- Using `String(country.id)` without a null check: `"undefined"` becomes a key and a lookup id.

### Check-in questions
1. Trace a click on Brazil: which handler runs first, what state changes, and which component re-renders?
2. Why is `path` built with `useMemo` but `features` stored with `useState`?
3. What would you see if you removed `event.stopPropagation()` from the country path?

---

## Session 5 — 2026-11-02 — Design pass with Taste Skill

### What we did
- Installed the `design-taste-frontend` skill and ran its process on the portfolio: measure the existing site, deal an art direction, write the idea and copy, rebuild, then inspect in a real browser at 1440/768/390 and fix until zero failures.
- Direction dealt: "The page is the object" (seed 727469968). Idea: the site is a passport. Fonts Gambarino + General Sans, palette sand and moss.
- Rebuilt the home page as four sections (passport hero with tabbed pages, stacked project folders with the live map, a letter on a scalloped sheet, a contact card over a Philadelphia photograph) and restyled the Projects and Levart pages to the same tokens.
- Seven open-licence photographs from Wikimedia Commons, credited in the footer.

### Concepts

**Design tokens.** Every colour, size and font is a CSS custom property on `:root` (`--bg`, `--ink`, `--accent`, `--step-body`...). Components reference tokens, never raw values. Change a token, the whole site follows. Tailwind v4's `@theme inline` block turns those tokens into utility classes (`bg-ground`, `text-ink`, `text-lead`).

**CSS cascade layers.** Tailwind v4 puts its utilities in `@layer utilities`. Unlayered CSS always beats layered CSS regardless of order or specificity, so my `.btn { display: inline-flex }` silently overrode `sm:hidden`. Fix: put your own component classes in `@layer components`, which sits below utilities. A bug you only find by looking at the screenshot.

**Margin collapsing.** A block's top margin "collapses" through its parent's top edge when nothing (padding, border, flex) separates them. The front page's `margin-top` moved the whole container instead of the page, so the back pages disappeared behind it. `display: flex` on the container stops the collapse.

**min-width: 0 in grids.** A grid column's default `min-width: auto` lets wide content (a `<pre>`) stretch the column past the viewport. `min-w-0` lets the column shrink and the content scroll instead.

**clip-path shapes.** Tabs and scalloped edges are flat filled boxes cut with `clip-path: polygon(...)`. `shapes.ts` generates the scallop polygon from a count and depth: a pure function returning a CSS string.

**Sticky stacking.** The project folders use `position: sticky` with increasing `top` offsets, so each band pins under the previous one's strip as you scroll. Pure CSS, no JavaScript.

**Entrance motion without hiding content.** `.reveal` elements start invisible only when `<html>` has a `js` class, added by an inline script before first paint. An IntersectionObserver adds `.is-in` when each element scrolls into view. No script, no hiding. `prefers-reduced-motion` turns it all off.

**The dev server can serve stale CSS.** Twice the Turbopack dev server kept serving an old compiled stylesheet after globals.css changed. Symptom: new classes in the HTML, no matching rules in the CSS. Fix: restart the dev server. Always confirm with the served file, not the source.

**Measure, then look.** The inspector catches what can be measured (contrast, sizes, edges, pictures, motion). It does not catch a hole, a weak crop or a tab the same colour as its background. Screenshots at every width, every round.

### Common mistakes to watch for
- Trusting hot reload. Check the served CSS when styles "don't apply".
- Raw hex colours or pixel sizes in components. Use the tokens.
- Putting your own CSS outside a layer when you also use utility classes.
- Forgetting `alt` text that says what the picture shows, and the credit line the licence requires.

### Still to do (yours)
- Rewrite the About letter in your own words (`src/data/site.ts`, `letter`).
- Real email and LinkedIn URL in `site.ts`.
- A photo of you, if you want one on the identity page.

### Check-in questions
1. Why did `sm:hidden` lose to `.btn`, and what single change fixed it for every class at once?
2. The front page sat on top of the back pages. What CSS behaviour caused it, and why does `display: flex` on the parent stop it?
3. The stamps didn't count as pictures at 112px but did at 150px. What does that tell you about how the inspector decides, and is that a reasonable rule?

---

## Session 6 — 2026-11-02 (overnight) — Build steps 5 and 6: city checklists, fill-up, flag reveal

### What we did
- `CityPanel.tsx`: the side panel. One country's cities as a checklist with real checkboxes; capital marked; "n of m cities".
- `Levart.tsx` now owns `visits`: `{ "076": [3448439, 3451190] }`, country numeric id → ticked city ids. A country is visited once one city is ticked.
- `WorldMap.tsx` takes `progress` (share of cities ticked per country) and `flagCode`. A partly visited country fills from the bottom; a complete one shows its flag inside its own outline, with a small arrival animation.

### Concepts

**Immutable state updates.** `toggleCity` never pushes into the existing array. It builds a new array and a new object: `{ ...previous, [numeric]: next }`. React decides whether to re-render by comparing object identity, so editing in place would change nothing on screen. In Java terms: return a new list rather than mutating the one you were handed.

**Derived state with useMemo.** `visitedCountries` and `progress` are computed from `visits`, not stored. Storing them too would mean two sources of truth that can drift. `useMemo` caches the computation until `visits` changes.

**Controlled inputs.** The checkbox's `checked` comes from state and `onChange` reports the click; React is the single owner of the value. The label wraps the input so the whole 44px row is the tap target.

**Clip paths.** The fill-up is a second copy of the country's path, filled in the visited colour, clipped by a `<rect>` covering the bottom share of the country's bounding box. The flag is an `<image>` clipped by the country's own path. Nothing is recomputed geometrically; the shapes just mask each other.

**path.bounds().** d3's path generator can also return a feature's bounding box in map coordinates, which gives the rect its position and the flag its size.

**SVG attribute transitions.** `y` and `height` on a rect are CSS properties in SVG 2, so a CSS `transition` animates the fill rising. Transform and opacity only for the flag's arrival.

**pointer-events: none** on the overlay paths and the flag image, so clicks still reach the base path (and its `<title>` tooltip).

### Common mistakes to watch for
- Mutating state arrays (`current.push(id)`): React won't re-render.
- Forgetting `key` on the per-country `<g>` after wrapping the path in a group.
- Duplicate clipPath ids when the same map is on two pages: ids include the country id, and there is one map per page.

### Check-in questions
1. Why does `toggleCity` use the function form `setVisits((previous) => ...)` instead of `setVisits({...visits, ...})`?
2. If BK ticks 7 of 14 cities, what are `x, y, width, height` of the clip rect relative to the country's box?
3. What would break if `pointerEvents="none"` were removed from the flag image?

---

## Session 7 — 2026-11-02 (overnight) — Build step 7: stats, percentage, localStorage, milestones

### What we did
- `stats.ts`: pure functions. `computeStats` counts countries, cities and continents visited and blends countries ÷ total and cities ÷ total, half each, into "% of the world explored". `milestones` is a list of predicates; `reachedMilestones` filters it.
- `StatsPanel.tsx`: the percentage leads, three counts in tabular figures, milestone badges (reached ones in lime), a "Start over" button with a confirm.
- `Confetti.tsx`: forty squares falling for 1.6 s when a new milestone is reached, never on page load.
- `Levart.tsx`: visits are saved to `localStorage` under `levart.visits` on every change and read back after the first render.

### Concepts

**Pure logic in its own file.** `stats.ts` imports no React and touches no browser API. That makes it testable with plain function calls, and it is exactly the piece step 10 will rewrite in C for WebAssembly. Draw the line between "computing" and "showing" early.

**localStorage and hydration.** The server renders the page with no saved data (it has no localStorage), the browser receives that HTML, and only then an effect reads storage and updates state. Reading storage during the first render would make the browser's HTML differ from the server's: a hydration mismatch. The `loaded` flag stops the save effect from overwriting the stored data with the empty initial state.

**try/catch around storage.** Private windows and blocked storage throw. The app must work without saving.

**Refs for "remembered" values that shouldn't re-render.** `seenMilestones` is a `useRef`: changing it does not trigger a render, which is what you want for bookkeeping. State is for things the screen shows.

**Why no setState synchronously inside effects.** React's lint rule flags it because each such call causes a second render pass. `Confetti` was rewritten to derive `active` from two values instead; the localStorage read is the one accepted exception and is marked.

**Deterministic "randomness".** The confetti positions use `(index * 37) % 100` rather than `Math.random()`, so the server and browser render the same markup and the layout is reproducible.

**Predicates as data.** Each milestone is `{ id, label, reached: (stats) => boolean }`. Adding one is adding an object. Compare a Java `Predicate<Stats>`.

### Common mistakes to watch for
- Saving to storage before loading from it (wipes the user's data on every visit).
- `JSON.parse` on unknown input without a try/catch.
- Celebrating milestones on page load because the "seen" set started empty.

### Check-in questions
1. In your own words: why can't the component read localStorage in its initial `useState`?
2. The blend gives countries and cities equal weight. What would change if a visitor ticked one city in each of 50 countries versus 50 cities in one country?
3. `continentsTotal` subtracts Antarctica. Where else in the app would that rule need to match?

---

## Session 8 — 2026-11-02 (overnight) — Steps 8, 9 and 11 prep, and what's left for you

### What was done for you
- `backend/README.md`: the Java backend's structure, the exact API contract the frontend expects, a Postgres schema, and hints in the order you'll hit the problems. No Java was written: that's yours.
- `wasm/README.md`: the same for the C module: what to port, a flat C signature the browser can call, the Emscripten command, and the memory-marshalling pitfalls.
- Levart polish (step 9, part): the page passed the taste skill's app-screen inspection (0 FAIL); the percentage figure is quieter; on phones the city panel scrolls into view when you pick a country.
- Step 11 prep: `<Levart />` now takes `visited`, `showStats`, `storageKey` and `dataUrl` props, so the same component can be embedded read-only elsewhere. `web/src/levart/README.md` lists the five changes needed before publishing to npm.

### Concepts
**Props as a public API.** Once a component is meant for other people, its props are a contract: named, typed, documented, with defaults. Changing them later breaks users. Design them before publishing, not after.

**Flat data across language boundaries.** C in WebAssembly can't take a JavaScript object. The lesson of step 10 is turning `{ "076": [id, id] }` into three parallel `int` arrays, writing them into the module's memory, and reading integers back. The same discipline applies to any FFI.

**A README is a spec.** The backend README doubles as the acceptance test: when your endpoints return those exact shapes, the frontend can switch from localStorage to the API with one setting.

### What's yours now (in order)
1. `src/data/site.ts`: the About letter in your words, your real email, your LinkedIn.
2. Buy `bumkyu.com` and attach it in Vercel (Settings → Domains).
3. Build step 8: the Spring Boot backend from `backend/README.md`. Then say "review my backend".
4. Build step 10: the C module from `wasm/README.md`.
5. Build step 11 proper: the five changes in `web/src/levart/README.md`, then `npm publish`.

### Check-in questions
1. Why do the backend endpoints use the same `Visits` shape as localStorage rather than a nicer one?
2. In the C signature, why is `percent` returned as `percent * 10` in an `int`?
3. If an embed passes `storageKey={null}`, which effects in `Levart.tsx` change behaviour, and how?

---

## Session 9 — 2026-11-03 — Typed cities, and the passport

### What we did
- Checkboxes are gone. `CitySearch.tsx` is a combobox: type two letters, pick from eight suggestions with the mouse or arrow keys and Enter. The country panel now lists what you added, each with Remove, and what is still to see.
- `Passport.tsx`: the Korean blue passport as the page's one object. Closed, its cover is the button. Click it and the cover swings on a 3D hinge (700ms, strong ease-out); the identity page with your stats is printed on the inside of the cover, the visa page beside it. The map and search mount once the swing is over.
- Every country you add for the first time lands on the visa page as a dated stamp with a landing animation (scale 1.5 → 1, 420ms). Stamps persist in localStorage next to the visits.
- Built with Taste Skill (page rules, inspector: 0 FAIL), Emil Kowalski's motion rules (ease-out curves, press feedback, no scale(0)), and Impeccable's craft floor (states, browser surfaces, copy).

### Concepts

**Combobox pattern.** An input with `role="combobox"`, a listbox of options, `aria-activedescendant` pointing at the highlighted one, arrow keys to move, Enter to choose, Escape to clear. `onMouseDown` with `preventDefault` on options keeps focus in the input so the list doesn't close before the click lands.

**3D in CSS.** `perspective` on the parent, `transform-style: preserve-3d` on the book, `transform-origin: left center` on the cover, `rotateY(-180deg)` to open. Two faces, front and back, the back pre-rotated 180° so it reads correctly when the cover is turned.

**Chrome and buttons.** `backface-visibility: hidden` is ignored on a `<button>` in Chrome, so the faces swap explicitly with `visibility` and a 320ms delay, at the moment the cover is edge-on. When a browser quirk fights you, make the behaviour explicit instead of relying on the clever property.

**Nested interactive elements are invalid HTML.** A `<button>` cannot contain a `<button>`. The cover had become a button wrapping the stats panel, which has its own "Start over" button; React reported it as a hydration error. Only the front face is a button now.

**Transitions can't start while the main thread is busy.** The click that opens the cover also used to mount the map's 175 paths in the same commit; the browser couldn't begin the CSS transition until that work finished, so the swing started a second late in dev. Mounting the tools 720ms later, after the swing, fixed it. `startTransition` did not, because nothing in the heavy subtree suspends.

**Event handlers own the bookkeeping.** Stamps are added and removed in `addCity`/`toggleCity`, not in an effect reacting to `visits`. React's lint rule against setting state inside effects pushed the design to the better place.

**A hydration-only attribute.** The inline script adds a `js` class to `<html>` before React hydrates; React sees a class the server didn't render. `suppressHydrationWarning` on `<html>` says "this difference is intended".

### Common mistakes to watch for
- Interactive elements inside interactive elements (button in button, link in link).
- Relying on `backface-visibility` for a flip on a form control.
- Heavy rendering in the same commit as a CSS transition's trigger.
- Percentage heights inside `calc()` on an auto-height parent: they compute to nothing. Size from the viewport instead.

### Check-in questions
1. Why does the option list use `onMouseDown` with `preventDefault` instead of `onClick`?
2. Walk through what the browser does in the 700ms after you click the cover: which properties change, and when do the faces swap?
3. If the stamps were derived from `visits` in an effect, what would happen on the first page load with saved data?

---

## Session 10 — 2026-11-03 — Pictures out, flag colours, city strips, the dive

### What we did
- Removed the seven photographs and their credit line; the hero lists the places as text and the contact card sits on a navy field. The site now says BK Kim.
- The data script now downloads each flag (40px) and picks its most common saturated colour; `world.json` carries `color` per country.
- On the Levart map a visited country is painted solid in its own colour. Click it and it divides into one vertical strip per city; the strips for cities you have added show the flag through them; all cities added, the whole country becomes the flag.
- "Dive" motion: the first screen of the home page and the tools under the open passport arrive from slightly too close and out of focus, then settle (900ms, strong ease-out, blur to zero by 60%). The open book lifts 4%.

### Concepts
**Colour from data, not by hand.** 250 countries each need a colour. Pick it from something real (the flag) with a rule you can explain: bucket pixels coarsely, skip white, black and greys, take the commonest saturated colour. Then look at a dozen results, because rules have edge cases (Germany becomes red, which is fine; a quantised blend of red and blue was not).

**Clip paths compose.** The strip reveal is a rectangle clip (how many strips) applied to the flag image inside a group that is itself clipped to the country's outline. Two clips, no geometry maths. The strip count comes from the city count, the width from the bounding box.

**Blur as a bridge.** A crossfade shows two objects overlapping; a blur during the move makes the eye read one object coming into focus. Keep it short and under 20px.

**When the brief removes something the tool wants.** The taste inspector's picture floor is a default, not a law. You said no pictures, so the inspector runs with `--allow few-pictures,no-footage` and the report says so. The brief wins.

### Check-in questions
1. Why is the flag colour computed in the Python script rather than in the browser when the page loads?
2. A country with 15 cities and 3 added shows a flag through 3 strips. Which two clip paths are involved, and which one changes when you add a 4th city?
3. The hero's three dive elements have delays of 0, 120 and 260ms. What would you lose if all three were 0?

---

## Session 11 — 2026-11-03 — Zoom into a country, sections per city

### What we did
- Click a country and the map flies into it: the group holding every country gets `translate(...) scale(k)` so the country fills the frame with air around it, animated by one CSS transition on `transform` (800ms, strong ease-out). Click the ocean or "Back to the world" and it flies out.
- The selected country divides into one vertical section per city, in dataset order (capital first), each with a vertical label and a click target. Clicking a section adds or removes that city, the same as typing it; added sections show the flag through them.

### Concepts
**Zoom by transforming, not re-projecting.** The projection and all 175 paths stay as they are; only a parent `<g>` is scaled and translated. `k = min(W / (bw · pad), H / (bh · pad))` fits the box, capped at 10; the translate puts the box's centre at the frame's centre. Cheap, and the browser can animate it.

**vector-effect: non-scaling-stroke.** Scaled by k, a 0.6-unit outline would become a 6px rope. This attribute keeps strokes at their on-screen width whatever the zoom. Text has no such attribute, so labels divide their size by k instead.

**Hit targets separate from visuals.** Each section's click target is a transparent `<rect>` clipped to the country outline. The flag, dividers and labels have `pointer-events: none` so clicks reach the rect and the base path beneath keeps its tooltip.

**paint-order: stroke.** Labels sit on a flag, which has every colour. A ground-coloured stroke painted *under* the glyphs (`paint-order="stroke"`) gives each label a halo so it reads on anything.

**Two inputs, one state.** Typing a city and clicking its section both call `toggleCity`. One function, one place to add the stamp bookkeeping; the two controls can never disagree.

### Check-in questions
1. Why does the zoom transform live on a `<g>` inside the SVG rather than on the `viewBox` attribute?
2. What would a section's label look like at `k = 3` if its font size were not divided by `k`?
3. The sections follow dataset order, capital first. What would you need to change to order them west to east by longitude instead?
