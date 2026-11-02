import { site } from "@/data/site";

// A full-bleed navy field carrying one solid card.

export default function Contact() {
  return (
    <section id="contact" className="relative">
      <div className="relative h-[46svh] w-full bg-field sm:h-[64svh]">
        <p className="wrap pt-16 font-display text-display text-field-ink sm:pt-24" aria-hidden="true">
          Say hello
        </p>
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
