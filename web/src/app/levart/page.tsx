import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Levart",
};

// Placeholder so the nav link works. The real map arrives in build step 4.
export default function LevartPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Levart</h1>
      <p className="mt-2 text-zinc-500">
        A travel tracker. Under construction.
      </p>
    </div>
  );
}
