"use client";

import type { ReactNode } from "react";

export type Stamp = {
  numeric: string;
  code: string;   // ISO alpha-2
  name: string;
  date: string;   // ISO date, the day the first city was added
};

type Props = {
  open: boolean;
  onToggle: () => void;
  holder: string;
  stamps: Stamp[];
  latest: string | null;   // numeric id of the stamp that just landed, for its animation
  identity: ReactNode;     // the stats, rendered on the inside cover
};

// A passport. Closed: the navy cover of the Republic of Korea's blue passport, which is
// the one button on the page. Open: the cover swings on its hinge and shows the identity
// page on its inside and the visa page beside it, where every added country lands as a stamp.
export default function Passport({ open, onToggle, holder, stamps, latest, identity }: Props) {
  return (
    <div
      className={`passport flex-col items-center ${open ? "is-open" : ""}`}
      // Page size: a passport's 88×125 mm ratio, capped at 340px wide, fitting the phone with its margins.
      style={{ "--page-w": "min(340px, calc(100vw - 48px))", "--page-h": "calc(min(340px, calc(100vw - 48px)) * 1.42)" } as React.CSSProperties}
    >
      <div className="passport-book">
        {/* The visa page: always underneath; visible once the cover swings away. */}
        <div className="passport-page" aria-hidden={!open}>
          <div className="passport-page-inner">
            <p className="text-small text-muted">Visas · 사증</p>
            <div className="lg:hidden">{identity}</div>
            {stamps.length === 0 ? (
              <p className="mt-6 max-w-[22ch] text-muted">
                No stamps yet. Type a city you have been to and the first one lands here.
              </p>
            ) : (
              <ul className="passport-stamps" aria-label="Stamps">
                {stamps.map((stamp, index) => {
                  const tilt = ((parseInt(stamp.numeric, 10) * 37) % 13) - 6; // -6..6 degrees, stable per country
                  const landing = stamp.numeric === latest;
                  return (
                    <li
                      key={stamp.numeric}
                      className={`stamp ${landing ? "stamp-landing" : ""}`}
                      style={{ transform: `rotate(${tilt}deg)`, zIndex: index + 1 }}
                    >
                      <span className="stamp-name">{stamp.name}</span>
                      <span className="stamp-meta">
                        {stamp.code} · {stamp.date}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* The cover, hinged on its left edge. Its front face is the button; its back face is
            the identity page (a plain div: the stats inside it have their own button). */}
        <div className="passport-cover" aria-hidden={open}>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label="Open the passport"
            tabIndex={open ? -1 : 0}
            className="passport-face passport-front"
          >
            {/* The rosette emblem: a ring of petals around a two-part swirl, tone on tone. */}
            <svg className="passport-emblem" viewBox="0 0 80 80" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="1.6">
                {Array.from({ length: 18 }, (_, i) => {
                  const a = (i / 18) * Math.PI * 2;
                  return <circle key={i} cx={40 + Math.cos(a) * 31} cy={40 + Math.sin(a) * 31} r="4.2" />;
                })}
                <circle cx="40" cy="40" r="24" />
                <circle cx="40" cy="40" r="20" strokeWidth="1" />
              </g>
              <g fill="currentColor">
                <path d="M40 24 a16 16 0 0 1 0 32 a8 8 0 0 1 0 -16 a8 8 0 0 0 0 -16 z" opacity="0.9" />
                <circle cx="40" cy="32" r="2.6" opacity="0.9" />
                <circle cx="40" cy="48" r="2.6" opacity="0.35" />
              </g>
            </svg>

            <span className="passport-title">
              <span className="passport-title-ko">대한민국 여권</span>
              <span className="passport-title-en">REPUBLIC OF KOREA</span>
              <span className="passport-title-en">PASSPORT</span>
            </span>

            {/* The embossed swirl, bottom left, running off the cover's edge. */}
            <svg className="passport-swirl" viewBox="0 0 200 200" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="100" cy="100" r="92" strokeDasharray="2 5" />
                <circle cx="100" cy="100" r="76" strokeDasharray="2 5" />
                <circle cx="100" cy="100" r="60" strokeDasharray="2 5" />
                <path d="M100 8 a92 92 0 0 1 0 184 a46 46 0 0 1 0 -92 a46 46 0 0 0 0 -92 z" strokeWidth="2.2" />
                <circle cx="100" cy="54" r="12" strokeWidth="2.2" />
                <circle cx="100" cy="146" r="12" strokeWidth="2.2" />
              </g>
            </svg>

            {/* The e-passport chip mark, bottom right. */}
            <svg className="passport-chip" viewBox="0 0 40 28" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="36" height="24" rx="3" />
                <circle cx="20" cy="14" r="5" />
                <path d="M4 14 h11 M25 14 h11" />
              </g>
            </svg>
          </button>
          <div className="passport-face passport-back">
            <p className="text-small text-muted">Levart · {holder}</p>
            <div className="mt-4">{identity}</div>
          </div>
        </div>
      </div>
      {open && (
        <button type="button" onClick={onToggle} className="mt-4 min-h-11 underline underline-offset-4">
          Close the passport
        </button>
      )}
    </div>
  );
}
