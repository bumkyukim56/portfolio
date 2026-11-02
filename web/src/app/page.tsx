import Image from "next/image";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { site } from "@/data/site";
import { featuredProjects } from "@/data/projects";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{site.name}</h1>
          <p className="mt-1 text-zinc-500">{site.role}</p>
          <p className="mt-4 max-w-prose leading-relaxed text-zinc-700 dark:text-zinc-300">
            {site.bio}
          </p>
          <ul className="mt-5 flex gap-4 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                Email
              </a>
            </li>
            <li>
              <a href={site.github} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                GitHub
              </a>
            </li>
            <li>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        {/* A ternary: condition ? ifTrue : ifFalse. Same as Python's `a if cond else b`. */}
        {site.photo ? (
          <Image
            src={site.photo}
            alt={site.name}
            width={112}
            height={112}
            priority
            className="h-28 w-28 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {site.shortName}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Featured projects</h2>
          <Link
            href="/projects"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            All projects
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
