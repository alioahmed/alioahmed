import { Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "./lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Ali Ahmed · AI Solutions Engineer",
  description:
    "AI Solutions Engineer who builds LLM/RAG products, AI agents, and IoT platforms that ship to production. Trusted on Gates Foundation and UNIDO programmes.",
  metadataBase: new URL("https://alioahmed.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ali Ahmed · AI Solutions Engineer",
    description:
      "AI Solutions Engineer who builds LLM/RAG products, AI agents, and IoT platforms that ship to production.",
    url: "https://alioahmed.com",
    type: "website",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://alioahmed.com/#person",
  name: "Ali Ahmed",
  alternateName: "alioahmed",
  url: "https://alioahmed.com",
  image: "https://alioahmed.com/ali-ahmed.jpeg",
  jobTitle: "AI Solutions Engineer",
  description:
    "AI Solutions Engineer who builds LLM/RAG products, AI agents, and IoT platforms that ship to production.",
  worksFor: [
    { "@type": "Organization", name: "Cognilium AI" },
    { "@type": "Organization", name: "Bijli Bachao" },
  ],
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Central Punjab" },
  address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
  knowsAbout: [
    "Large Language Models",
    "Retrieval-Augmented Generation",
    "AI agents",
    "Generative AI",
    "Prompt engineering",
    "Vector databases",
    "Product management",
    "IoT platforms",
  ],
  sameAs: SITE.sameAs,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
