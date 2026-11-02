// Personal info used across the site. Edit this file, not the pages.

export type Site = {
  name: string;
  shortName: string;
  role: string;
  from: string;
  location: string;
  school: string;
  tagline: string;
  email: string;
  github: string;
  githubHandle: string;
  linkedin: string;
  photo?: string; // optional: path under /public, e.g. "/photo.jpg"
};

export const site: Site = {
  name: "BK Kim",
  shortName: "BK",
  role: "Student developer",
  from: "Seoul, Korea",
  location: "Philadelphia, PA",
  school: "University of Pennsylvania",
  tagline:
    "A student developer from Seoul, now at Penn in Philadelphia, building Levart: a map of the places you have been.",
  email: "you@example.com", // TODO
  github: "https://github.com/bumkyukim56",
  githubHandle: "bumkyukim56",
  linkedin: "https://www.linkedin.com/in/TODO", // TODO
  // photo: "/photo.jpg", // uncomment once you add web/public/photo.jpg
};

// Places BK has been. `numeric` is the ISO code the map shapes use.
export type Trip = {
  code: string;
  numeric: string;
  place: string;
  country: string;
};

export const trips: Trip[] = [
  { code: "KR", numeric: "410", place: "Seoul", country: "Korea" },
  { code: "US", numeric: "840", place: "Philadelphia", country: "United States" },
  { code: "IS", numeric: "352", place: "Iceland", country: "Iceland" },
  { code: "EG", numeric: "818", place: "Giza", country: "Egypt" },
  { code: "PE", numeric: "604", place: "Machu Picchu", country: "Peru" },
  { code: "PT", numeric: "620", place: "Lisbon", country: "Portugal" },
  { code: "MA", numeric: "504", place: "Chefchaouen", country: "Morocco" },
];

// The letter on the About page. SAMPLE COPY written from the facts BK gave; BK should rewrite it in his own words.
export const letter: string[] = [
  "I grew up in Seoul and moved to Philadelphia for school. Somewhere between the two I started keeping a list of every city I had been to, and the list wanted to be a map.",
  "That map became Levart. It is the project I am learning on: React for the front, Java for the server, and a little C for the maths, each new piece added when I reach the lesson that needs it.",
  "Before this I wrote Python. I like problems that have a real thing at the end, something you can click or hand to someone.",
  "If you have been somewhere I have not, I would like to hear about it.",
];

// The letter and the footer sign with the full name; the site uses the short one.
export const fullName = "Bumkyu Kim";
