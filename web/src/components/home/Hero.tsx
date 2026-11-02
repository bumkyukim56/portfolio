import Link from "next/link";
import { site, trips } from "@/data/site";

// The first screen, built as the direction's "tabbed folder stack": the name at
// display size, one sentence, then five stacked pages with tabs, like the pages of
// a passport. The front page carries the one action and the stamps of places visited.
const pages = [
  { href: "/levart", label: "Levart" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: site.github, label: "GitHub", external: true },
];

// Tab positions along the top edge, left to right, so every tab shows.
const tabLeft = ["4%", "24%", "44%", "64%", "84%"];
const tabLeftPhone = ["4%", "36%", "68%", "4%", "36%"];

export default function Hero() {
  const back = pages.slice(0, -1);
  const front = pages[pages.length - 1];

  return (
    <section className="relative bg-field text-field-ink">
      <div className="wrap pt-24 text-center sm:pt-28">
        <h1 className="display dive mx-auto">{site.name}</h1>
        <p className="lead dive mx-auto mt-6 max-w-[46ch]" style={{ "--dive-delay": "120ms" } as React.CSSProperties}>{site.tagline}</p>
      </div>

      {/* The stack. Each page is offset below the one behind it so only a strip shows. */}
      {/* flex-col keeps the front page's top margin from collapsing through the container */}
      <div className="dive relative mx-auto mt-14 flex w-full flex-col sm:mt-20 sm:w-[86%]" style={{ "--dive-delay": "260ms" } as React.CSSProperties}>
        {back.map((page, index) => (
          <Link
            key={page.label}
            href={page.href}
            className="group absolute inset-x-0 block"
            style={{ top: `calc(${index} * var(--page-offset))` }}
            aria-label={page.label}
          >
            <span
              className={`tab absolute -top-10 hidden h-10 items-center px-7 sm:flex ${index % 2 === 0 ? "bg-ground text-ink" : "bg-surface text-ink"}`}
              style={{ left: tabLeft[index] }}
            >
              {page.label}
            </span>
            <span
              className={`tab absolute -top-8 flex h-8 items-center px-5 text-small sm:hidden ${index % 2 === 0 ? "bg-ground text-ink" : "bg-surface text-ink"}`}
              style={{ left: tabLeftPhone[index] }}
            >
              {page.label}
            </span>
            <span className={`block h-[400px] ${index % 2 === 0 ? "bg-ground" : "bg-surface"} transition-transform duration-300 group-hover:-translate-y-2`} />
          </Link>
        ))}

        {/* The front page: open, running off the bottom edge. */}
        <div className="relative bg-ground text-ink" style={{ marginTop: "calc(4 * var(--page-offset))" }}>
          <a
            href={front.href}
            target="_blank"
            rel="noreferrer"
            className="tab absolute -top-10 hidden h-10 items-center bg-accent px-7 text-accent-ink sm:flex"
            style={{ left: tabLeft[4] }}
          >
            {front.label}
          </a>
          <a
            href={front.href}
            target="_blank"
            rel="noreferrer"
            className="tab absolute -top-8 flex h-8 items-center bg-accent px-5 text-small text-accent-ink sm:hidden"
            style={{ left: tabLeftPhone[4] }}
          >
            {front.label}
          </a>

          <div className="flex flex-col gap-10 p-6 sm:p-8">
            <div className="reveal" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
              <Link href="/levart" className="btn w-full sm:w-auto">
                Open Levart
              </Link>
              <p className="mt-6 max-w-[28ch]">
                From {site.from}. Now in {site.location}, at the {site.school}.
              </p>
              <p className="mt-2 text-muted">Seven countries, so far:</p>
            </div>
            <p className="max-w-[60ch]" aria-label="Places visited">
              {trips.map((trip) => trip.place).join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
