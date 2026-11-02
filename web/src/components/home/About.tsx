import { site, letter } from "@/data/site";
import { scallopEdge } from "@/components/shapes";

// A letter on a paper sheet with a scalloped bottom edge, on a contrasting ground,
// and below it a perforated tear-off strip that carries the email address.
export default function About() {
  return (
    <section id="about" className="bg-field py-32 text-field-ink sm:py-48">
      <div className="mx-auto w-full sm:w-[640px]">
        <div className="reveal bg-ground px-6 pb-14 pt-10 text-ink sm:px-[60px] sm:pt-[60px]" style={{ clipPath: scallopEdge(26, 12) }}>
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-display text-accent-ink" aria-hidden="true">
              {site.shortName}
            </span>
            <h2 className="font-display text-lead leading-none">About me</h2>
          </div>
          <div className="mt-7">
            {letter.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-[0.9em] max-w-[62ch] leading-[1.55] first:mt-0">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-8 font-display text-lead leading-none">{site.name}</p>
          <p className="mt-1 text-small text-muted">
            {site.role}, {site.school}
          </p>
        </div>

        <div className="perforation reveal mt-3 flex flex-col gap-4 bg-ground px-6 py-4 text-ink sm:min-h-[72px] sm:flex-row sm:items-center sm:justify-between sm:px-[60px]" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
          <span>{site.email}</span>
          <a href={`mailto:${site.email}`} className="btn sm:hidden">Email me</a>
          <a href={`mailto:${site.email}`} className="hidden underline underline-offset-[6px] sm:inline">Write to me</a>
        </div>
      </div>
    </section>
  );
}
