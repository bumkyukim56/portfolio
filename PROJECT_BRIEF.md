# PORTFOLIO + LEVART PROJECT BRIEF

**Owner:** BK (bumkyubk.com)
**Purpose:** Starting prompt for Claude Code. I'm a student taking Java and C with prior Python experience, and I want to learn from this project, not just vibe-code it. See "How I want Claude Code to work with me" at the end.

---

## PART 1: PORTFOLIO WEBSITE

### Tech stack

- Next.js (App Router) with React and TypeScript
- Tailwind CSS for styling
- Deployed on Vercel, custom domain bumkyubk.com

### Pages

1. **Home (`/`)** — name, short bio, photo; links to email, GitHub, LinkedIn; short "featured projects" section linking to `/projects`
2. **Projects (`/projects`)** — grid of project cards (title, description, tech used, link); projects stored in a data file (`projects.ts`) so they're easy to add; Levart appears as a featured project linking to `/levart`
3. **Levart (`/levart`)** — see Part 2

### Design

- Clean, minimal, mobile friendly
- Navigation bar on every page: Home, Projects, Levart
- Footer with social links

---

## PART 2: LEVART (travel tracker)

### Concept

An interactive world map where people mark the countries and cities they've visited, and it calculates what percentage of the world they've explored. Lives at bumkyubk.com/levart and, later, can be embedded by anyone on their own portfolio.

### Phase 1: Countries

- SVG world map (react-simple-maps or similar, with world GeoJSON/TopoJSON)
- Each country is clickable
- Clicking a country opens a side panel listing major cities in that country

### Phase 2: Cities

- Each country has a curated list of major cities (start with 5–15 per country; data from GeoNames or SimpleMaps World Cities)
- User checks off the cities they've been to
- A country counts as "visited" if at least one city is checked

### Phase 3: Fill and flag reveal

- Each country on the map fills from the bottom up as cities are checked (3 of 10 cities = 30% filled)
- When all cities in a country are checked, the country shape reveals that country's flag, using an SVG clip-path over a flag image (flagcdn.com or similar)
- Small animation on completion

### Phase 4: Progress and stats

- Overall "percentage of the world explored." Suggested formula: a blend of countries visited ÷ ~195 total, and cities visited ÷ total cities in the dataset
- Stats panel: countries visited, cities visited, continents touched, percentage explored
- Confetti or badge on milestones (first 10 countries, every continent, etc.)

### Phase 5: Saving data

- Start simple: localStorage so nothing is lost on refresh
- Then: Java backend (see Part 3) with accounts so a map is shareable by link, e.g. bumkyubk.com/levart/bk

### Phase 6: Embeddable widget

- Package the map as a standalone React component, published to npm as "levart"
- Usage example: `<Levart visited={["KR", "JP", "US"]} />`
- Also offer an iframe embed snippet for non-React sites
- Props: visited countries and cities, color theme, size, show/hide stats

### Interaction summary

1. Land on `/levart`, see an empty world map and 0% explored
2. Click a country, side panel shows its cities
3. Check the cities you've been to
4. Country fills up; at 100% it becomes the flag; stats update with animation
5. Share or embed your map

---

## PART 3: LEARNING GOALS AND TECH CHOICES

- **Frontend (JavaScript/React):** Next.js map UI, city checklists, stats, flag-reveal effect.
- **Backend (Java):** Spring Boot REST API that stores each user's visited countries and cities and returns their stats. Endpoints like `GET /api/users/{id}/visits`, `POST /api/users/{id}/visits`, `GET /api/users/{id}/stats`. Postgres database (Supabase or Vercel Postgres).
- **C (stretch):** Write the "percentage explored" and milestone logic in C, compile to WebAssembly with Emscripten, call it from the frontend. Goal: learn how C talks to the browser.
- **Python (optional):** Script that pulls a cities dataset, cleans it, and generates the JSON file of countries and cities the app uses.

---

## SUGGESTED BUILD ORDER

1. Scaffold the Next.js portfolio and deploy a blank version to Vercel
2. Build Home and Projects pages
3. Python script to generate the countries/cities JSON
4. Add `/levart` with a clickable world map and country highlighting
5. Add city lists and the side panel
6. Add fill-up effect and flag reveal
7. Add progress percentage, stats, and localStorage saving
8. Build the Java Spring Boot backend and connect it
9. Polish: animations, mobile layout, milestones
10. Stretch: C/WebAssembly stats module
11. Extract the embeddable component and publish

---

## HOW I WANT CLAUDE CODE TO WORK WITH ME

- Work one build step at a time; don't jump ahead unless I ask.
- Before writing a file, explain in plain terms what it does and why it's needed.
- When I ask "why" or say I'm stuck, slow down and walk me through it step by step. Relate concepts to Python, Java, or C where it helps.
- For the Java backend and C module, let me write the first version myself; give me structure and hints, then review my code rather than replacing it.
- Point out common mistakes and ask quick check-in questions to confirm I understand before moving on.
- Keep a `LEARNING_NOTES.md` file summarizing new concepts covered each session.

---

## PROMPT TO START WITH IN CLAUDE CODE

> "Read PROJECT_BRIEF.md. Start with build step 1 only: create a Next.js App Router project with TypeScript and Tailwind for my portfolio at bumkyubk.com. Explain each file you create and why, since I'm learning React coming from Python and Java."
