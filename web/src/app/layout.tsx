import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata becomes the <title> and <meta> tags. The template lets each page
// set its own title, e.g. "Projects · Bumkyu Kim".
export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: `${site.name}, ${site.role.toLowerCase()}. Projects and work.`,
};

// The root layout wraps every page. `children` is whichever page.tsx matches the URL.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Nav />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
