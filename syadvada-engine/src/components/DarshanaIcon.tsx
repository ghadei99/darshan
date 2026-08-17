"use client";

import { useEffect, useState } from "react";

interface DarshanaIconProps {
  className?: string;
  size?: number;
}

export function DarshanaIcon({ className = "", size = 48 }: DarshanaIconProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={className}
        aria-hidden
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="darshana-gold" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="var(--icon-gold-light)" />
          <stop offset="50%" stopColor="var(--icon-gold-mid)" />
          <stop offset="100%" stopColor="var(--icon-gold-dark)" />
        </linearGradient>
        <linearGradient id="darshana-sky" x1="32" y1="4" x2="32" y2="60">
          <stop offset="0%" stopColor="var(--icon-sky)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--icon-gold-mid)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g className="darshana-spin-slow" style={{ transformOrigin: "32px 32px" }}>
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="url(#darshana-gold)"
          strokeWidth="0.75"
          strokeDasharray="4 6"
          opacity="0.5"
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 32 + 28 * Math.cos(rad);
          const y = 32 + 28 * Math.sin(rad);
          return (
            <circle
              key={deg}
              cx={x}
              cy={y}
              r="1.5"
              fill="var(--icon-gold-mid)"
              opacity="0.6"
            />
          );
        })}
      </g>

      <g
        className="darshana-spin-reverse"
        style={{ transformOrigin: "32px 32px" }}
      >
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 32 + 8 * Math.cos(rad);
          const y1 = 32 + 8 * Math.sin(rad);
          const x2 = 32 + 20 * Math.cos(rad);
          const y2 = 32 + 20 * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#darshana-gold)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}
      </g>

      <circle cx="32" cy="32" r="10" fill="url(#darshana-sky)" opacity="0.35" />
      <circle
        cx="32"
        cy="32"
        r="6"
        stroke="url(#darshana-gold)"
        strokeWidth="1.25"
        fill="none"
      />
      <circle cx="32" cy="32" r="2.5" fill="var(--icon-gold-mid)" opacity="0.85" />

      <line x1="32" y1="14" x2="32" y2="22" stroke="var(--icon-gold-mid)" strokeWidth="1" opacity="0.4" />
      <line x1="32" y1="42" x2="32" y2="50" stroke="var(--icon-gold-mid)" strokeWidth="1" opacity="0.4" />
      <line x1="14" y1="32" x2="22" y2="32" stroke="var(--icon-gold-mid)" strokeWidth="1" opacity="0.4" />
      <line x1="42" y1="32" x2="50" y2="32" stroke="var(--icon-gold-mid)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
