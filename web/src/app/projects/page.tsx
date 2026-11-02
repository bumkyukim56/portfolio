import type { Metadata } from "next";
import Link from "next/link";
import Work from "@/components/home/Work";

export const metadata: Metadata = {
  title: "Projects",
};

// The same stacked folders as the home page, led by a display-size title.
export default function ProjectsPage() {
  return (
    <div className="pb-24 pt-28 sm:pt-32">
      <div className="wrap">
        <h1 className="display reveal">Things built</h1>
        <p className="lead reveal mt-6 max-w-[46ch] text-muted" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          Two so far, both in progress. More as the lessons arrive.
        </p>
        <Link href="/levart" className="btn reveal mt-8" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
          Open Levart
        </Link>
      </div>
      <Work heading={false} />
    </div>
  );
}
