import Link from "next/link";
import { site } from "@/data/site";
import credits from "../../public/images/credits.json";

type Credit = {
  title: string;
  creator: string;
  license: string;
  licenseUrl: string;
  page: string;
  via: string;
};

// The footer is the back cover of the passport: the name returns at full width,
// the practical links, and the credit line for every found picture.
export default function Footer() {
  const pictures = credits as Credit[];

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
        <p className="mt-16 max-w-[80ch]">
          Pictures:{" "}
          {pictures.map((picture, index) => (
            <span key={picture.page}>
              <a href={picture.page} className="underline underline-offset-4">“{picture.title}”</a> by {picture.creator},{" "}
              <a href={picture.licenseUrl} className="underline underline-offset-4">{picture.license}</a>, via {picture.via}
              {index < pictures.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
