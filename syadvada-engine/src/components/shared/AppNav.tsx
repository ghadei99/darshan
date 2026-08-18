"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DarshanaIcon } from "./DarshanaIcon";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home", key: "home" },
  { href: "/nyaya", label: "Nyāya-Logic", key: "nyaya" },
  { href: "/syadvada", label: "Syādvāda Engine", key: "syadvada" },
  { href: "/pramana", label: "Prāmāṇa Explorer", key: "pramana" },
  { href: "/debate", label: "Vāda-Katha", key: "debate" },
  { href: "/yoga-analyzer", label: "Yoga-Sūtra", key: "yoga" },
  { href: "/dharma", label: "Dharma", key: "dharma" },
  { href: "/archive", label: "Archive", key: "archive" },
];

function activeKey(pathname: string): string {
  if (pathname.startsWith("/nyaya")) return "nyaya";
  if (pathname.startsWith("/syadvada")) return "syadvada";
  if (pathname.startsWith("/pramana")) return "pramana";
  if (pathname.startsWith("/debate")) return "debate";
  if (pathname.startsWith("/yoga-analyzer")) return "yoga";
  if (pathname.startsWith("/dharma")) return "dharma";
  if (pathname.startsWith("/archive")) return "archive";
  return "home";
}

function NavLink({
  href,
  label,
  active,
  onClick,
  className = "",
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors sm:px-4 sm:py-2 ${className} ${
        active
          ? "font-medium text-accent-strong"
          : "text-muted hover:text-body"
      }`}
      style={active ? { background: "var(--accent-muted)" } : undefined}
    >
      {label}
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const active = activeKey(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trackedPathname, setTrackedPathname] = useState(pathname);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  if (trackedPathname !== pathname) {
    setTrackedPathname(pathname);
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  }

  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <nav
        className="relative z-40 border-b border-border backdrop-blur-md"
        style={{ background: "var(--nav-bg)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-initial">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="nav-hamburger flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border transition-colors hover:border-border-hover md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <span className="nav-hamburger__bars" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>

            <Link
              href="/"
              className="group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <DarshanaIcon size={32} className="shrink-0" />
              <span className="truncate font-display text-sm font-semibold tracking-[0.12em] text-body uppercase">
                Darshana Suite
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 md:flex lg:gap-2">
            {links.map((link) => (
              <NavLink
                key={link.key}
                href={link.href}
                label={link.label}
                active={active === link.key}
              />
            ))}
          </div>

          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div
        className={`nav-drawer-overlay fixed inset-0 z-50 md:hidden ${
          drawerOpen ? "nav-drawer-overlay--open" : ""
        }`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className="nav-drawer-backdrop absolute inset-0"
          onClick={closeDrawer}
          aria-label="Close navigation menu"
          tabIndex={drawerOpen ? 0 : -1}
        />

        <aside
          className={`nav-drawer-panel absolute top-0 left-0 flex h-full w-[min(18rem,85vw)] flex-col ${
            drawerOpen ? "nav-drawer-panel--open" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <DarshanaIcon size={28} />
              <span className="font-display text-xs font-semibold tracking-[0.12em] text-body uppercase">
                Menu
              </span>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-body"
              aria-label="Close menu"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={closeDrawer}
                    className={`block rounded-xl px-4 py-3 text-sm transition-colors ${
                      active === link.key
                        ? "bg-accent-muted font-medium text-accent-strong"
                        : "text-muted hover:bg-surface hover:text-body"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border px-5 py-4">
            <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
              Darshana Suite
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
