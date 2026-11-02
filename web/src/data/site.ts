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
  name: "Bumkyu Kim",
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
// The pictures are open-licence photographs of each place (credits in public/images/credits.json);
// none is BK's own photograph.
export type Trip = {
  code: string;
  numeric: string;
  place: string;
  country: string;
  image: string;
  alt: string;
  width: number;
  height: number;
};

export const trips: Trip[] = [
  { code: "KR", numeric: "410", place: "Seoul", country: "Korea", image: "/images/seoul-from-namsan-1.jpg", alt: "Seoul from Namsan: apartment blocks running out to the mountains at dusk", width: 1920, height: 1282 },
  { code: "US", numeric: "840", place: "Philadelphia", country: "United States", image: "/images/philadelphia-skyline-from-the-camden-waterfront.jpg", alt: "The Philadelphia skyline across the Delaware River on a clear day", width: 1920, height: 1509 },
  { code: "IS", numeric: "352", place: "Iceland", country: "Iceland", image: "/images/icelandic-landscape-near-neskaupsta-ur-july-2014.jpg", alt: "A green Icelandic valley under low cloud near Neskaupstaður", width: 1920, height: 1121 },
  { code: "EG", numeric: "818", place: "Giza", country: "Egypt", image: "/images/all-gizah-pyramids.jpg", alt: "The three pyramids of Giza in a row under a hazy sky", width: 1920, height: 1276 },
  { code: "PE", numeric: "604", place: "Machu Picchu", country: "Peru", image: "/images/machu-picchu-peru-2015-07-30-dd.jpg", alt: "The terraces of Machu Picchu with Huayna Picchu behind", width: 1920, height: 1276 },
  { code: "PT", numeric: "620", place: "Lisbon", country: "Portugal", image: "/images/tram-28-lisbon-portuguese.jpg", alt: "A yellow number 28 tram climbing a narrow Lisbon street", width: 1920, height: 1203 },
  { code: "MA", numeric: "504", place: "Chefchaouen", country: "Morocco", image: "/images/chefchaouen-blue-city-in-morocco.jpg", alt: "The blue-washed houses of Chefchaouen stacked up a hillside", width: 1920, height: 1440 },
];

// The letter on the About page. SAMPLE COPY written from the facts BK gave; BK should rewrite it in his own words.
export const letter: string[] = [
  "I grew up in Seoul and moved to Philadelphia for school. Somewhere between the two I started keeping a list of every city I had been to, and the list wanted to be a map.",
  "That map became Levart. It is the project I am learning on: React for the front, Java for the server, and a little C for the maths, each new piece added when I reach the lesson that needs it.",
  "Before this I wrote Python. I like problems that have a real thing at the end, something you can click or hand to someone.",
  "If you have been somewhere I have not, I would like to hear about it.",
];
