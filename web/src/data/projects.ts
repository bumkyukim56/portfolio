// The list of projects shown on /projects and on the home page.
// To add a project, append an object to the array below.

export type Project = {
  slug: string; // short unique id, used as the React key
  title: string;
  category: string; // what kind of thing it is, shown beside the name
  description: string;
  tech: string[];
  href: string; // internal route ("/levart") or external URL
  cta: string; // the link's label
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "levart",
    title: "Levart",
    category: "Web app",
    description:
      "An interactive world map. Click a country, tick the cities you have seen, and watch it fill. The map is live now; a Java backend and an embeddable widget come next.",
    tech: ["Next.js", "TypeScript", "SVG", "Java / Spring Boot"],
    href: "/levart",
    cta: "Open Levart",
    featured: true,
  },
  {
    slug: "portfolio",
    title: "This site",
    category: "Portfolio",
    description:
      "Built from scratch while learning React, one build step at a time, with the learning notes committed alongside the code.",
    tech: ["Next.js", "Tailwind CSS", "Vercel"],
    href: "https://github.com/bumkyukim56/portfolio",
    cta: "See the code",
  },
];

// Derived list: only the featured ones. filter() is like a Python list comprehension with an if.
export const featuredProjects = projects.filter((project) => project.featured);
