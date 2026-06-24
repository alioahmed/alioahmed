import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Ali Ahmed · Product & Innovation Operator",
  description:
    "I build and ship digital products end to end, and run the institutional programmes around them. Eight years across AI, IoT, and national-scale ecosystems.",
  metadataBase: new URL("https://alioahmed.vercel.app"),
  openGraph: {
    title: "Ali Ahmed · Product & Innovation Operator",
    description:
      "I write the specs, close the deals, and ship the code — as one operator, at production scale.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
