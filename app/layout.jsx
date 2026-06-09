import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata = {
  title: "Ali Ahmed — Product & Innovation Operator",
  description:
    "I build 0→100 products and institutional programmes — the specs, the code, and the deals, in one person, at production scale. Eight years shipping across hardware, software, and AI.",
  metadataBase: new URL("https://ali-ahmed.vercel.app"),
  openGraph: {
    title: "Ali Ahmed — Product & Innovation Operator",
    description:
      "I write the specs, close the deals, and ship the code — in one person, at production scale.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
