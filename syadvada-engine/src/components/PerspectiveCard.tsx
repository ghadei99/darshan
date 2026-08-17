"use client";

import type { Perspective } from "@/lib/types";

interface PerspectiveCardProps {
  perspective: Perspective;
  index: number;
  viewMode: "classical" | "stakeholder";
}

export function PerspectiveCard({
  perspective,
  index,
  viewMode,
}: PerspectiveCardProps) {
  const content =
    viewMode === "classical" ? perspective.classical : perspective.stakeholder;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl suite-card p-6 transition-all duration-500 hover:shadow-[var(--card-hover-shadow)]"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/8 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-accent">
            {perspective.sanskrit}
          </p>
          <h3 className="mt-1 text-sm font-medium text-heading">
            {perspective.label}
          </h3>
        </div>
        <span className="badge-accent flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs">
          {index + 1}
        </span>
      </header>
      <p className="text-[15px] leading-relaxed text-body">{content}</p>
    </article>
  );
}
