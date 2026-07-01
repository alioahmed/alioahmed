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
  booking: "https://calendar.app.google/byKeMUBfy4zbCJSx8",
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

// Visible profile links (footer "Find me everywhere"). alioahmed.bio = the Gravatar hub.
export const PROFILES = [
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "GitHub", href: SITE.github },
  { label: "GitLab", href: "https://gitlab.com/alioahmed" },
  { label: "X", href: SITE.x },
  { label: "Bluesky", href: SITE.bluesky },
  { label: "Mastodon", href: "https://mastodon.social/@alioahmed" },
  { label: "dev.to", href: "https://dev.to/alioahmed" },
  { label: "Medium", href: "https://medium.com/@alioahmed" },
  { label: "Substack", href: "https://substack.com/@alioahmed" },
  { label: "Hashnode", href: "https://hashnode.com/@alioahmed" },
  { label: "Hugging Face", href: "https://huggingface.co/alioahmed" },
  { label: "Kaggle", href: "https://www.kaggle.com/alioahmed" },
  { label: "Product Hunt", href: "https://www.producthunt.com/@alioahmed" },
  { label: "Patreon", href: "https://www.patreon.com/cw/alioahmed" },
  { label: "Goodreads", href: "https://www.goodreads.com/user/show/202106301-ali-ahmed" },
  { label: "Fueler", href: "https://fueler.io/alioahmed" },
  { label: "ORCID", href: "https://orcid.org/0009-0007-4265-3295" },
  { label: "Topmate", href: "https://topmate.io/alioahmed" },
  { label: "Wellfound", href: "https://wellfound.com/u/alioahmed" },
  { label: "about.me", href: "https://about.me/alioahmed" },
  { label: "alioahmed.bio", href: SITE.gravatar },
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
