export const SITE = {
  name: "Ali Ahmed",
  initials: "AA",
  role: "Product & Innovation Operator",
  location: "Lahore, Pakistan",
  email: "a.aliahmeedd1@gmail.com",
  linkedin: "https://www.linkedin.com/in/alioahmed",
  github: "https://github.com/alioahmed",
  available: "Open to fractional, advisory & 0→1 builds",
};

export const NAV = [
  { label: "What I do", href: "/#do" },
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
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
