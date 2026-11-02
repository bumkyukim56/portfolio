import Link from "next/link";
import type { Project } from "@/data/projects";

// Props are a component's parameters. This one takes a single Project.
export default function ProjectCard({ project }: { project: Project }) {
  const external = project.href.startsWith("http");

  return (
    <Link
      href={project.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group block rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <h3 className="font-semibold group-hover:underline">{project.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tech}
          </li>
        ))}
      </ul>
    </Link>
  );
}
