export const SITE = {
  name: "Ali Ahmed",
  initials: "AA",
  role: "Product & Innovation Operator",
  tagline: "I build and ship digital products end to end, and run the programmes around them.",
  location: "Lahore, Pakistan",
  email: "a.aliahmeedd1@gmail.com",
  linkedin: "https://www.linkedin.com/in/alioahmed",
  github: "https://github.com/alioahmed",
  x: "https://x.com/Alioahmed_",
  bluesky: "https://bsky.app/profile/alioahmed.bsky.social",
  gravatar: "https://alioahmed.bio",
  contactForm: "https://alioahmed.com/contact",
  // Card identity (locked) — kept separate from SITE.role so the rest of the site is untouched.
  headline: "AI Solutions Engineer · Cognilium AI",
  bio: "I build LLM/RAG products, AI agents & IoT platforms that ship to production. 4 AI products + 3 IoT platforms shipped. Building in public.",
  // Google Calendar appointment-schedule link — powers the "Book a call" CTA across the whole site.
  booking: "https://calendar.app.google/M4cB7An18terfbNd7",
  available: "Open to fractional, advisory & 0→1 builds",
};

export const NAV = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export const WORK_LINKS = [
  { label: "Bijli Bachao", slug: "bijli-bachao" },
  { label: "Cognilium AI", slug: "cognilium" },
  { label: "Paralegent AI", slug: "paralegent" },
  { label: "Build Buy Software", slug: "build-buy-software" },
  { label: "Wonder Women", slug: "wonder-women" },
];

export const mail = (subject) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject || "Hello Ali")}`;

// Book-a-call target: the booking link if set, otherwise an email fallback.
export const book = () => SITE.booking || mail("Booking a call");
