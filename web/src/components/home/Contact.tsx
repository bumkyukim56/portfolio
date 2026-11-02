import Image from "next/image";
import { site, trips } from "@/data/site";

// A full-bleed photograph of the place BK is in now, carrying one solid card.
const philadelphia = trips.find((trip) => trip.code === "US")!;

export default function Contact() {
  return (
    <section id="contact" className="relative">
      <div className="relative h-[70svh] w-full overflow-hidden bg-surface sm:h-[100svh]">
        <Image
          src={philadelphia.image}
          alt={philadelphia.alt}
          fill
          sizes="100vw"
          className="drift object-cover object-top"
        />
      </div>

      <div className="reveal relative -mt-20 mx-4 bg-ground text-ink sm:absolute sm:right-[60px] sm:top-[60px] sm:mx-0 sm:mt-0 sm:w-[380px]">
        <div className="p-8">
          <h2 className="font-display text-lead leading-none">Say hello</h2>
          <p className="mt-5">
            {site.location}
            <br />
            {site.school}
          </p>
          <p className="mt-2 text-muted">From {site.from}</p>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 tabular-nums">
            <dt>Email</dt>
            <dd className="text-right"><a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a></dd>
            <dt>GitHub</dt>
            <dd className="text-right"><a href={site.github} target="_blank" rel="noreferrer" className="underline underline-offset-4">{site.githubHandle}</a></dd>
            <dt>LinkedIn</dt>
            <dd className="text-right"><a href={site.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-4">Profile</a></dd>
          </dl>
        </div>
        <a href={`mailto:${site.email}`} className="btn w-full">
          Email me
        </a>
      </div>
    </section>
  );
}
