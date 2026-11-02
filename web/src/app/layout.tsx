import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";
import "./globals.css";

// Metadata becomes the <title> and <meta> tags. The template lets each page
// set its own title, e.g. "Projects · Bumkyu Kim".
export const metadata: Metadata = {
  title: {
    default: `${site.name}, ${site.role.toLowerCase()}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
};

// The root layout wraps every page. `children` is whichever page.tsx matches the URL.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Adds the "js" class before first paint so entrance motion only hides content when script runs. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* The two typefaces from the direction sheet, served by Fontshare. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=gambarino@400&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap" rel="stylesheet" />
      </head>
      <body className="relative flex min-h-full flex-col">
        <Reveal />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
