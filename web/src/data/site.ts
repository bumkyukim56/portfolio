// Personal info used across the site. Edit this file, not the pages.

export type Site = {
  name: string;
  shortName: string;
  role: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  photo?: string; // optional: path under /public, e.g. "/photo.jpg"
};

export const site: Site = {
  name: "Bumkyu Kim",
  shortName: "BK",
  role: "Student developer",
  bio: "TODO: two or three sentences about you. What you study, what you like building, what you're learning right now.",
  email: "you@example.com", // TODO
  github: "https://github.com/bumkyukim56",
  linkedin: "https://www.linkedin.com/in/TODO", // TODO
  // photo: "/photo.jpg", // uncomment once you add web/public/photo.jpg
};
