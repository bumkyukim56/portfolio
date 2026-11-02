import Link from "next/link";
import HomeMap from "./HomeMap";
import { projects } from "@/data/projects";

// Two projects filed as stacked folders. Each band sticks as the page scrolls so
// the one behind shows a 64px strip above the one in front, tabs rising from the top edge.
const codeFragment = `export const projects: Project[] = [
  {
    slug: "levart",
    title: "Levart",
    category: "Web app",
    tech: ["Next.js", "TypeScript", "SVG", "Java / Spring Boot"],
    href: "/levart",
    featured: true,
  },
  // add a project: append an object here
];`;

// `heading` is false on the Projects page, which supplies its own title.
export default function Work({ heading = true }: { heading?: boolean }) {
  return (
    <section id="work" className={heading ? "pt-32 sm:pt-48" : "pt-6"}>
      {heading && (
        <div className="wrap flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <h2 className="head reveal">Things built</h2>
          <p className="reveal text-muted" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>Two so far. Both are in progress.</p>
        </div>
      )}

      <div className="relative mt-20">
        {projects.map((project, index) => {
          const band = index === 0 ? "bg-surface text-ink" : "bg-ink text-ground";
          const quiet = index === 0 ? "text-muted" : "text-surface";
          const tab = index === 0 ? "bg-accent text-accent-ink" : "bg-ground text-ink";
          const external = project.href.startsWith("http");
          return (
            <article
              key={project.slug}
              className={`relative ${band} sm:sticky`}
              style={{ top: `${44 + index * 64}px`, marginTop: index === 0 ? 0 : "44px" }}
            >
              <h3 className={`tab reveal absolute -top-11 left-0 flex h-11 items-center px-7 font-display text-lead ${tab}`}>
                {project.title}
              </h3>
              <p className="wrap reveal absolute right-0 top-4 text-small" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>{project.category}</p>

              <div className="wrap grid gap-8 pb-12 pt-16 sm:min-h-[60svh] sm:grid-cols-12 sm:gap-gutter sm:pt-20">
                <div className="reveal min-w-0 sm:col-span-7">
                  {index === 0 ? (
                    <HomeMap />
                  ) : (
                    <pre data-ui className="max-w-full overflow-x-auto bg-ground p-5 text-small leading-relaxed text-ink">
                      <code>{codeFragment}</code>
                    </pre>
                  )}
                </div>
                <div className="reveal min-w-0 sm:col-span-4 sm:col-start-9" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
                  <p>{project.description}</p>
                  <p className={`mt-3 ${quiet}`}>{project.tech.join(" · ")}</p>
                  <Link
                    href={project.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="mt-6 inline-block underline underline-offset-[6px] decoration-2"
                  >
                    {project.cta}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
