import type { Metadata } from "next";
import Levart from "@/levart/Levart";

export const metadata: Metadata = {
  title: "Levart",
};

export default function LevartPage() {
  return (
    <div className="wrap pb-24 pt-28 sm:pt-32">
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="head">Levart, a map of where you have been</h1>
          <p className="lead mt-4 max-w-[46ch] text-muted">
            Click a country, tick the cities you have seen, and watch it fill.
          </p>
        </div>
        <Levart />
      </div>
    </div>
  );
}
