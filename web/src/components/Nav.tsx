"use client";
// "use client" marks this as a Client Component: it runs in the browser too.
// We need that here because usePathname() reads the current URL, which only
// the browser knows. Every other component in this app is a Server Component.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/levart", label: "Levart" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {site.shortName}
        </Link>
        <ul className="flex gap-5 text-sm">
          {links.map((link) => {
            // "/" would match every path with startsWith, so it gets an exact check.
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    active
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }
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
