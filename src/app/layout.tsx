import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import React from "react";

/**
 * Inline SVG favicon whose stroke color adapts to the user's theme.
 * The SVG contains a small <style> with prefers-color-scheme media queries.
 * We encode it and put it into metadata.icons so Next will render <link rel="icon" href="data:...">
 */

// build SVG as a string
const faviconSvg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64' fill='none' role='img' aria-label='Navbar Gallery favicon'>
  <style>
    /* set stroke per theme; encode '#' as %23 below via encodeURIComponent */
    @media (prefers-color-scheme: dark) {
      .st { stroke: #ffffff; }
    }
    @media (prefers-color-scheme: light) {
      .st { stroke: #111111; }
    }
    /* ensure transparent background */
    svg { background: none; }
  </style>

  <!-- three horizontal lines like your original SVG; use class="st" so CSS switches color -->
  <path class="st" d="M4 18H10" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path class="st" d="M4 12L16 12" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path class="st" d="M4 6L20 6" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>
`;

// encode to safe data URI
const faviconDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}`;

// Google font setup
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

// Export metadata — Next will put the favicon link(s) in the head from metadata.icons
export const metadata: Metadata = {
  title: {
    default: "Next.js Navbar Gallery",
    template: "%s | Next.js Navbar Gallery",
  },
  description:
    "A collection of modern, responsive, and accessible navbars built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.",
  metadataBase: new URL("https://nextjs-navbar-gallery.vercel.app"),
  openGraph: {
    title: "Next.js Navbar Gallery",
    description:
      "Modern, responsive, and accessible navbars built with Next.js, Tailwind, and Framer Motion.",
    url: "https://nextjs-navbar-gallery.vercel.app",
    siteName: "Next.js Navbar Gallery",
    images: [
      {
        url: "/logo.png",
        width: 256,
        height: 256,
        alt: "Next.js Navbar Gallery",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js Navbar Gallery",
    description:
      "A gallery of responsive navbar designs built with Next.js, Tailwind, and Framer Motion.",
    images: ["/logo.png"],
  },
  icons: {
    icon: faviconDataUri,
    shortcut: faviconDataUri,
    apple: "/logo.png",
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
