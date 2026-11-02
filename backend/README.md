# Levart backend (build step 8) — your part

This folder is yours to write. The brief says the Java backend is a first version by BK, then reviewed. Below is the structure, the contract the frontend expects, and hints. No Java code has been written for you.

## What it is for

Right now Levart saves visits in the browser's localStorage, so they live in one browser only. The backend stores each user's visits on a server so a map can be shared by link (`bumkyu.com/levart/bk`) and survives a new device.

## The contract the frontend will call

The frontend already has the data shapes in `web/src/levart/types.ts` and `web/src/levart/Levart.tsx` (`Visits` is `{ "<country numeric id>": [cityId, ...] }`). Keep the API in the same terms.

| Method | Path | Body / Response |
| --- | --- | --- |
| `GET` | `/api/users/{id}/visits` | → `{ "visits": { "076": [3448439, 3451190] } }` |
| `PUT` | `/api/users/{id}/visits` | body `{ "visits": {...} }` → same back (replace all) |
| `POST` | `/api/users/{id}/visits` | body `{ "country": "076", "city": 3448439 }` → toggles one city, returns the updated visits |
| `GET` | `/api/users/{id}/stats` | → `{ "countriesVisited": 1, "citiesVisited": 2, "continentsVisited": 1, "percent": 0.3, ... }` (same fields as `Stats` in `web/src/levart/stats.ts`) |

`id` is a short handle like `bk`. Start without authentication; add it once the endpoints work.

## Suggested structure (Spring Boot 3, Java 17, Maven)

```
backend/
  pom.xml
  src/main/java/com/bumkyu/levart/
    LevartApplication.java        @SpringBootApplication, main()
    visit/
      Visit.java                  @Entity: id, userId, countryNumeric, cityId
      VisitRepository.java        extends JpaRepository<Visit, Long>
      VisitService.java           the logic: toggle, replace, stats
      VisitController.java        @RestController, the four endpoints above
    world/
      WorldData.java              loads web/public/data/world.json once at startup (copy it into src/main/resources/)
  src/main/resources/
    application.properties        datasource URL, etc.
    world.json
  src/test/java/...               start with VisitServiceTest
```

Generate the skeleton with Spring Initializr (https://start.spring.io): Maven, Java 17, Spring Boot 3.x, dependencies **Spring Web**, **Spring Data JPA**, **PostgreSQL Driver**, **Validation**. Unzip it into this folder.

## Database

Postgres (Supabase or Vercel Postgres, both have free tiers). One table is enough to begin:

```sql
create table visit (
  id            bigserial primary key,
  user_id       text not null,
  country       text not null,     -- ISO numeric id as text, e.g. '076'
  city_id       integer not null,
  created_at    timestamptz not null default now(),
  unique (user_id, country, city_id)
);
```

Let JPA create it for you at first (`spring.jpa.hibernate.ddl-auto=update`), then look at what it made.

## Hints, in the order you will hit the problems

1. **Start with the hard-coded version.** Make `GET /api/users/{id}/visits` return a fixed map before touching the database. Prove the wiring, then replace the fake.
2. **The stats formula is in `web/src/levart/stats.ts`.** Port it line by line. Count only countries with at least one city; exclude Antarctica from continents; blend countries and cities half each; round to one decimal.
3. **Toggle is "if present delete, else insert".** The unique constraint protects you from double inserts; catch the exception or check first.
4. **Group rows into the map shape** with `Collectors.groupingBy(Visit::getCountry, mapping(Visit::getCityId, toList()))`. That is the Java form of the `by_country.setdefault(...)` idiom from the Python script.
5. **CORS.** The frontend on `bumkyu.vercel.app` calls the API on a different origin. Add `@CrossOrigin(origins = "https://bumkyu.vercel.app")` on the controller, or a global `WebMvcConfigurer`.
6. **Validate input.** A country id that is not in `world.json` or a city id not in that country should return 400, not land in the table.
7. **Tests before the database.** `VisitServiceTest` with an in-memory list, or H2 for the repository tests.

## Common mistakes to expect

- Forgetting the no-args constructor JPA needs on `@Entity` classes.
- Returning entities straight from the controller (lazy-loading surprises). Return small record types instead.
- `ddl-auto=update` in production. Fine for now, not for later.
- Hard-coding the database password. Use an environment variable.

## When it runs

Tell Claude Code "review my backend" and it will read it, compare it against this contract, and comment rather than rewrite. Then the frontend gets a `storage` setting: localStorage or the API.
