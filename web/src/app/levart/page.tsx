import type { Metadata } from "next";
import Levart from "@/levart/Levart";

export const metadata: Metadata = {
  title: "Levart",
};

export default function LevartPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Levart</h1>
        <p className="mt-2 text-zinc-500">
          Mark the places you&apos;ve been and see how much of the world you&apos;ve explored.
        </p>
      </div>
      <Levart />
    </div>
  );
}
