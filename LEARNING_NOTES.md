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
