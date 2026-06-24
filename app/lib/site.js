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
  // Person-schema sameAs: every verified public profile (entity-fusion for the search-authority build).
  sameAs: [
    "https://www.linkedin.com/in/alioahmed",
    "https://github.com/alioahmed",
    "https://gitlab.com/alioahmed",
    "https://x.com/Alioahmed_",
    "https://bsky.app/profile/alioahmed.bsky.social",
    "https://mastodon.social/@alioahmed",
    "https://dev.to/alioahmed",
    "https://medium.com/@alioahmed",
    "https://hashnode.com/@alioahmed",
    "https://substack.com/@alioahmed",
    "https://huggingface.co/alioahmed",
    "https://www.kaggle.com/alioahmed",
    "https://about.me/alioahmed",
    "https://alioahmed.bio",
    "https://www.producthunt.com/@alioahmed",
    "https://www.patreon.com/cw/alioahmed",
    "https://www.goodreads.com/user/show/202106301-ali-ahmed",
    "https://fueler.io/alioahmed",
    "https://orcid.org/0009-0007-4265-3295",
    "https://topmate.io/alioahmed",
    "https://wellfound.com/u/alioahmed",
  ],
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
