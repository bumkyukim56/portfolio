"use client";

import { useEffect, useState } from "react";

// Forty small squares that fall and fade for 1.6 seconds. Transform and opacity only;
// nothing when the visitor prefers reduced motion (the CSS handles that).
const pieces = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,          // spread across the width, deterministically
  delay: `${(index % 8) * 60}ms`,
  drift: `${((index * 53) % 80) - 40}px`,  // sideways drift, -40..40px
  tone: index % 3,                          // alternate the three Levart colours
}));

export default function Confetti({ burst }: { burst: number }) {
  // `dismissed` remembers which burst has already finished. The pieces show while the
  // current burst is not yet dismissed; a timer dismisses it. No state is set during render
  // or synchronously inside the effect, only from the timer.
  const [dismissed, setDismissed] = useState(0);

  useEffect(() => {
    if (burst === 0) return;
    const timer = setTimeout(() => setDismissed(burst), 1800);
    return () => clearTimeout(timer);
  }, [burst]);

  const active = burst !== 0 && dismissed !== burst;
  if (!active) return null;

  const colours = ["var(--lv-mint)", "var(--lv-lime)", "var(--ink)"];
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti absolute top-0 block h-3 w-3"
          style={{
            left: piece.left,
            background: colours[piece.tone],
            animationDelay: piece.delay,
            ["--drift" as string]: piece.drift,
          }}
        />
      ))}
    </div>
  );
}
