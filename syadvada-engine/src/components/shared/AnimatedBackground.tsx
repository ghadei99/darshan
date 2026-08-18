"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AnimatedBackground() {
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!isMounted) return null;

  return (
    <div className="animated-bg" aria-hidden>
      <div className="animated-bg__aurora animated-bg__aurora--1" />
      <div className="animated-bg__aurora animated-bg__aurora--2" />
      <div className="animated-bg__aurora animated-bg__aurora--3" />

      <svg
        className="animated-bg__mandala"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="200"
          cy="200"
          r="180"
          strokeWidth="0.5"
          strokeDasharray="8 12"
          opacity="0.12"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          strokeWidth="0.5"
          strokeDasharray="4 10"
          opacity="0.1"
        />
        <circle cx="200" cy="200" r="100" strokeWidth="0.5" opacity="0.08" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 200 + 60 * Math.cos(rad);
          const y1 = 200 + 60 * Math.sin(rad);
          const x2 = 200 + 160 * Math.cos(rad);
          const y2 = 200 + 160 * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth="0.5"
              opacity="0.06"
            />
          );
        })}
      </svg>

      <div className="animated-bg__particles">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="animated-bg__particle"
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              top: `${(i * 23 + 11) % 100}%`,
              animationDelay: `${(i * 1.3) % 12}s`,
              animationDuration: `${14 + (i % 5) * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
