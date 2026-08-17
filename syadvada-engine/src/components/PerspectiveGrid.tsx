"use client";

import type { Perspective } from "@/lib/types";

import { PerspectiveCard } from "./PerspectiveCard";

interface PerspectiveGridProps {
  perspectives: Perspective[];
  viewMode: "classical" | "stakeholder";
}

export function PerspectiveGrid({ perspectives, viewMode }: PerspectiveGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {perspectives.map((perspective, index) => (
        <PerspectiveCard
          key={perspective.id}
          perspective={perspective}
          index={index}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
