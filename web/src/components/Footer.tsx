import Link from "next/link";
import { site } from "@/data/site";

// The footer is the back cover of the passport: the name returns at full width, then the practical links.
export default function Footer() {
  return (
    <footer className="bg-field text-field-ink">
      <div className="wrap py-16 sm:py-24">
        <p className="head">{site.name}</p>
        <p className="mt-3 max-w-[48ch]">
          {site.role}. {site.from} to {site.location}.
        </p>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <li><a href={`mailto:${site.email}`} className="underline underline-offset-[6px]">Email</a></li>
          <li><a href={site.github} target="_blank" rel="noreferrer" className="underline underline-offset-[6px]">GitHub</a></li>
          <li><a href={site.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-[6px]">LinkedIn</a></li>
          <li><Link href="/projects" className="underline underline-offset-[6px]">Projects</Link></li>
          <li><Link href="/levart" className="underline underline-offset-[6px]">Levart</Link></li>
        </ul>
      </div>
    </footer>
  );
}
