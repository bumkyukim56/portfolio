"use client";
// "use client" marks this as a Client Component: it runs in the browser too.
// We need that here because usePathname() reads the current URL, which only
// the browser knows. Every other component in this app is a Server Component.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/levart", label: "Levart" },
  { href: site.github, label: "GitHub", external: true },
];

// Plain navigation: wordmark, three links, no bar, no border. It sits over the
// top of each page; the home page's dark first screen gets light text.
export default function Nav() {
  const pathname = usePathname();
  const onDark = pathname === "/";
  const tone = onDark ? "text-field-ink" : "text-ink";

  return (
    <header className={`absolute inset-x-0 top-0 z-20 ${tone}`}>
      <nav className="wrap flex items-center justify-between py-5" aria-label="Main">
        <Link href="/" className="font-display text-lead leading-none">
          {site.shortName}
        </Link>
        <ul className="flex gap-6">
          {links.map((link) => {
            const active = !link.external && pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className={active ? "underline underline-offset-[6px] decoration-2" : "hover:underline hover:underline-offset-[6px]"}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
