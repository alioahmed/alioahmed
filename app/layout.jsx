import { Sofia_Sans } from "next/font/google";
import "./globals.css";

const sofia = Sofia_Sans({
  subsets: ["latin"],
  variable: "--font-sofia",
  display: "swap",
});

export const metadata = {
  title: "Ali Ahmed · Product & Innovation Operator",
  description:
    "I build 0→1 products and institutional programmes: the specs, the code, and the deals, in one person, at production scale. Eight years shipping across hardware, software, and AI.",
  metadataBase: new URL("https://ali-ahmed.vercel.app"),
  openGraph: {
    title: "Ali Ahmed · Product & Innovation Operator",
    description:
      "I write the specs, close the deals, and ship the code, in one person, at production scale.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sofia.variable}>
      <body>{children}</body>
    </html>
  );
}
