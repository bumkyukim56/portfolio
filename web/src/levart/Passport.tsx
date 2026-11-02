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
            <span className="passport-front-text">
              <span className="block text-[15px] tracking-[0.2em]">대한민국</span>
              <span className="mt-1 block text-[13px] tracking-[0.18em]">REPUBLIC OF KOREA</span>
            </span>
            <svg className="passport-emblem" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="32" cy="32" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="32" cy="32" r="3.5" fill="currentColor" />
            </svg>
            <span className="passport-front-text">
              <span className="block text-[15px] tracking-[0.24em]">여권</span>
              <span className="mt-1 block text-[13px] tracking-[0.3em]">PASSPORT</span>
            </span>
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
