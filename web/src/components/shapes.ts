// Clip-path helpers for the passport stationery. Pure functions: same input, same output.

/**
 * A polygon whose bottom edge is cut into `count` semicircular notches `depth` px deep,
 * like the scalloped edge of a stamp sheet. Returned as a CSS clip-path value.
 */
export function scallopEdge(count: number, depth: number, samples = 8): string {
  const points: string[] = ["0 0", "100% 0", `100% calc(100% - ${depth}px)`];
  const notchWidth = 100 / count;
  for (let i = count - 1; i >= 0; i--) {
    for (let s = 0; s <= samples; s++) {
      const t = s / samples; // 0 → 1 across one notch, right to left
      const x = (i + 1 - t) * notchWidth;
      const rise = Math.sin(Math.PI * t) * depth; // deepest at the middle of the notch
      points.push(`${x.toFixed(3)}% calc(100% - ${depth}px + ${rise.toFixed(2)}px)`);
    }
  }
  points.push(`0 calc(100% - ${depth}px)`);
  return `polygon(${points.join(", ")})`;
}
