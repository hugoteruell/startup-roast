import type { Metadata } from "next";
import { Inter, Inter_Tight, Fraunces, Caveat } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});
const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Startup Roast — your mom is lying to you",
  description: "Drop your startup. Get an honest opinion and a painting to remember it by.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${serif.variable} ${inter.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col warm-grain">{children}</body>
    </html>
  );
}
