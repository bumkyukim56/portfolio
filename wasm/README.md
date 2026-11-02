# Levart stats in C → WebAssembly (build step 10, stretch) — your part

Goal: learn how C talks to the browser. You rewrite the "percentage explored" and milestone logic in C, compile it with Emscripten, and the frontend calls it instead of `web/src/levart/stats.ts`.

## What to port

`web/src/levart/stats.ts` has two things: `computeStats` and the milestone predicates. Port exactly that, nothing more. Keep `stats.ts` as the reference and as the fallback when WebAssembly is unavailable.

## Suggested shape

```
wasm/
  levart_stats.c      the logic, plain C99, no malloc needed
  levart_stats.h
  test_stats.c        a few asserts you can run natively with gcc before touching Emscripten
  build.sh            the emcc command
```

A C function the browser can call needs flat inputs: no objects, no strings if you can avoid them. Suggested signature:

```c
// counts[]: for each reachable country i, how many of its cities are ticked
// totals[]: for each reachable country i, how many cities it has
// continent[]: for each reachable country i, a small integer 0..5 for the continent
// n: number of reachable countries
// out[]: 7 numbers written back: countriesVisited, countriesTotal, citiesVisited, citiesTotal,
//        continentsVisited, continentsTotal, percent*10 (as an int, to avoid floats across the boundary)
void levart_stats(const int *counts, const int *totals, const int *continent, int n, int *out);
```

The JavaScript side builds the three arrays from `visits` and the countries map, writes them into the module's memory, calls the function, reads `out` back. That marshalling is the actual lesson.

## Steps

1. Write `levart_stats.c` and `test_stats.c`; compile natively: `gcc -std=c99 -Wall -o test_stats test_stats.c levart_stats.c && ./test_stats`. Make the numbers match `stats.ts` for a few hand-made inputs (one country, one city; everything; nothing).
2. Install Emscripten (`brew install emscripten` or the emsdk). Build:
   `emcc levart_stats.c -O2 -s EXPORTED_FUNCTIONS=_levart_stats,_malloc,_free -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,HEAP32 -s MODULARIZE=1 -s EXPORT_ES6=1 -o ../web/public/wasm/levart_stats.js`
3. In the frontend, a `useWasmStats()` hook loads the module once (dynamic `import("/wasm/levart_stats.js")`), falls back to `computeStats` if loading fails, and is used by `Levart.tsx` in place of the direct call.
4. Show which engine computed the number somewhere small ("computed in C" / "computed in JS") so you can see it switch.

## Things that will bite

- Integers vs floats at the boundary. Pass and return ints; divide in JavaScript or scale by 10 as above.
- Memory: `HEAP32` is a view over the module's memory; allocate with `_malloc`, write with `HEAP32.set(array, ptr / 4)`, free with `_free`. The `/ 4` is because the heap is indexed in 32-bit words, not bytes.
- Next.js and the `.wasm` file: putting the build output in `public/wasm/` and loading it by URL is the simplest route; bundler integration is a rabbit hole.
- `-s MODULARIZE=1` so the module doesn't pollute the global scope.

## Check before saying it's done

- Same percent for the same input from both engines, on at least five inputs.
- The page still works with the `.wasm` file deleted (fallback).
