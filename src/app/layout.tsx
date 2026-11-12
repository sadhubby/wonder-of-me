import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { site } from "@/lib/site";

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
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: "sadhubby", url: "https://github.com/sadhubby" }],
  openGraph: {
    title: site.name,
    description:
      "Training consistency, reading velocity, nutrition, Commander decks, and more.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full overflow-x-hidden font-sans text-text-primary">
        <div
          aria-hidden="true"
          className="page-bg pointer-events-none fixed inset-0 -z-10"
        />
        {children}
      </body>
    </html>
  );
}
