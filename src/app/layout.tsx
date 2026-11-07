import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dashboard of Me",
    template: "%s · Dashboard of Me",
  },
  description:
    "A nocturnal personal command center for training, reading, nutrition, Commander decks, and the things I love.",
  applicationName: "Dashboard of Me",
  authors: [{ name: "sadhubby", url: "https://github.com/sadhubby" }],
  openGraph: {
    title: "Dashboard of Me",
    description:
      "Training consistency, reading velocity, nutrition, Commander decks, and more.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full overflow-x-hidden bg-canvas font-sans text-text-primary">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,45,107,0.18),transparent_58%)]" />
          <div className="ambient-orb absolute -left-40 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-glow-indigo opacity-30" />
          <div className="ambient-orb absolute right-[-14rem] top-[22%] h-[30rem] w-[30rem] rounded-full bg-glow-teal opacity-25 [animation-delay:-7s]" />
          <div className="ambient-orb absolute bottom-[-16rem] left-[28%] h-[32rem] w-[32rem] rounded-full bg-glow-amber opacity-20 [animation-delay:-13s]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,8,17,0.15),rgba(7,8,17,0.72))]" />
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
