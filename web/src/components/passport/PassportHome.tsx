"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import IdPage from "./IdPage";
import { site, letter, fullName, trips } from "@/data/site";
import { projects } from "@/data/projects";

// The passport is the whole home page. Closed: the cover, portrait, the one thing to click.
// Hover peeks it open. Click: the cover swings away and the book turns sideways into a
// two-page spread, the endpaper pattern above and the identity page below. The lower page
// is a catalogue: tap the identity page to reach the index, then any entry to turn to it.

type PageId = "profile" | "index" | "levart" | "projects" | "about" | "contact";

const catalogue: { id: PageId; label: string; note: string }[] = [
  { id: "levart", label: "Levart", note: "A map of where you have been" },
  { id: "projects", label: "Projects", note: "Things built so far" },
  { id: "about", label: "About", note: "A letter" },
  { id: "contact", label: "Contact", note: "Email, GitHub, LinkedIn" },
];

export default function PassportHome() {
  const [open, setOpen] = useState(false);
  const [spread, setSpread] = useState(false); // the sideways two-page view, after the swing
  const [page, setPage] = useState<PageId>("profile");
  const [turning, setTurning] = useState(false);

  // The swing takes 600ms; the book turns sideways once the cover is out of the way.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setSpread(true), 520);
    return () => clearTimeout(timer);
  }, [open]);

  function close() {
    setSpread(false);
    setOpen(false);
    setPage("profile");
  }

  // A page turn: the lower page slides out, the content changes, it slides back in.
  function turnTo(next: PageId) {
    if (next === page) return;
    setTurning(true);
    setTimeout(() => {
      setPage(next);
      setTurning(false);
    }, 180);
  }

  return (
    <section className="passport-home" aria-label="Passport">
      {/* Closed book */}
      <div className={`pbook dive ${open ? "is-open" : ""} ${spread ? "is-spread" : ""}`}>
        <div className="pbook-inside" aria-hidden="true" />
        <button
          type="button"
          className="pbook-cover"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open the passport"
          tabIndex={open ? -1 : 0}
        >
          <Image src="/passport/cover.webp" alt="" width={850} height={1210} priority className="pbook-cover-img" />
        </button>
      </div>

      {/* Open spread, sideways */}
      <div className={`pspread ${spread ? "is-in" : ""}`} aria-hidden={!spread}>
        <div className="pspread-page pspread-top">
          <Image src="/passport/pattern.png" alt="" fill sizes="(min-width: 640px) 560px, 100vw" className="object-cover" />
        </div>
        <div className="pspread-spine" aria-hidden="true" />
        <div className={`pspread-page pspread-bottom ${turning ? "is-turning" : ""}`}>
          {page === "profile" && (
            <button type="button" className="ppage ppage-profile" onClick={() => turnTo("index")} aria-label="Open the catalogue">
              <IdPage />
              <span className="ppage-hint">Tap to turn the page</span>
            </button>
          )}

          {page === "index" && (
            <div className="ppage ppage-paper">
              <h2 className="ppage-head">Contents · 목차</h2>
              <ul className="ppage-index">
                {catalogue.map((entry) => (
                  <li key={entry.id}>
                    <button type="button" onClick={() => turnTo(entry.id)} className="ppage-index-item">
                      <span className="font-display text-lead">{entry.label}</span>
                      <span className="text-muted">{entry.note}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <PageFoot onBack={() => turnTo("profile")} />
            </div>
          )}

          {page === "levart" && (
            <div className="ppage ppage-paper">
              <h2 className="ppage-head">Levart, a map of where you have been</h2>
              <p className="mt-4 max-w-[46ch]">
                Type a city, watch its country fill in its own colour, and collect a stamp for every country.
                {" "}{trips.length} countries so far: {trips.map((trip) => trip.country).join(", ")}.
              </p>
              <Link href="/levart" className="btn mt-6 self-start">Open Levart</Link>
              <PageFoot onBack={() => turnTo("index")} />
            </div>
          )}

          {page === "projects" && (
            <div className="ppage ppage-paper">
              <h2 className="ppage-head">Projects · 작업</h2>
              <ul className="flex flex-col gap-4">
                {projects.map((project) => (
                  <li key={project.slug}>
                    <p className="font-display text-lead leading-none">{project.title}</p>
                    <p className="mt-1 text-muted">{project.category} · {project.tech.join(", ")}</p>
                  </li>
                ))}
              </ul>
              <Link href="/projects" className="btn mt-6 self-start">See the projects</Link>
              <PageFoot onBack={() => turnTo("index")} />
            </div>
          )}

          {page === "about" && (
            <div className="ppage ppage-paper">
              <h2 className="ppage-head">About · 소개</h2>
              <div className="ppage-letter">
                {letter.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
                <p className="mt-3 font-display text-lead leading-none">{fullName}</p>
              </div>
              <PageFoot onBack={() => turnTo("index")} />
            </div>
          )}

          {page === "contact" && (
            <div className="ppage ppage-paper">
              <h2 className="ppage-head">Say hello · 연락</h2>
              <p className="mt-3">{site.location} · {site.school}</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt>Email</dt><dd><a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a></dd>
                <dt>GitHub</dt><dd><a href={site.github} target="_blank" rel="noreferrer" className="underline underline-offset-4">{site.githubHandle}</a></dd>
                <dt>LinkedIn</dt><dd><a href={site.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-4">Profile</a></dd>
              </dl>
              <a href={`mailto:${site.email}`} className="btn mt-6 self-start">Email me</a>
              <PageFoot onBack={() => turnTo("index")} />
            </div>
          )}
        </div>
      </div>

      {spread ? (
        <button type="button" onClick={close} className="mt-5 min-h-11 underline underline-offset-4">
          Close the passport
        </button>
      ) : (
        <div className="dive mt-8 text-center" style={{ "--dive-delay": "200ms" } as React.CSSProperties}>
          <h1 className="font-display text-lead leading-none">{site.name}, {site.role.toLowerCase()}</h1>
          <p className="mt-2 text-muted">From {site.from}, at Penn in {site.location}. Open the passport.</p>
        </div>
      )}
    </section>
  );
}

function PageFoot({ onBack }: { onBack: () => void }) {
  return (
    <div className="ppage-foot">
      <button type="button" onClick={onBack} className="min-h-11 underline underline-offset-4">
        Back
      </button>
    </div>
  );
}
