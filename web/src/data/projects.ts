// The list of projects shown on /projects and (if featured) on the home page.
// To add a project, append an object to the array below.

export type Project = {
  slug: string; // short unique id, used as the React key
  title: string;
  description: string;
  tech: string[];
  href: string; // internal route ("/levart") or external URL
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "levart",
    title: "Levart",
    description:
      "An interactive world map that tracks the countries and cities you've visited and tells you how much of the world you've explored.",
    tech: ["Next.js", "TypeScript", "SVG", "Java / Spring Boot"],
    href: "/levart",
    featured: true,
  },
  {
    slug: "portfolio",
    title: "This site",
    description:
      "My portfolio, built from scratch while learning React and Next.js. Deployed on Vercel.",
    tech: ["Next.js", "Tailwind CSS", "Vercel"],
    href: "https://github.com/bumkyukim56/portfolio",
  },
];

// Derived list: only the featured ones. filter() is like a Python list comprehension with an if.
export const featuredProjects = projects.filter((project) => project.featured);
