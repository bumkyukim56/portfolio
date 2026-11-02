"use client";

import { useEffect } from "react";

// Entrance motion for every element marked .reveal: once it scrolls into view it
// gets .is-in and rises into place. Runs once per element. Content is never hidden
// without script: the CSS only hides .reveal when <html> carries the "js" class,
// which the inline script in layout.tsx adds before first paint.
export default function Reveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
