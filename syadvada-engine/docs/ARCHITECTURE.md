# Darshana Suite Architecture

## Overview

Darshana Suite is a Next.js 16 application. Each philosophical module (Prāmāṇa, Syādvāda, Nyāya, Yoga, Dharma, Debate) has isolated domain logic with shared AI infrastructure.

```
UI (Client Components)
  → Route Handlers (/api/*)
    → Domain analyzers (lib/<module>/analyzer.ts)
      → AI infrastructure (lib/ai/*)
        → Google Gemini API (server-only)
      → Heuristic fallback (lib/<module>/heuristic.ts)
```

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI | `src/components/<module>/` | User interaction, fetch API routes |
| Routes | `src/app/api/<module>/` | HTTP boundary, validation |
| Domain | `src/lib/<module>/` | Philosophical analysis, prompts, heuristics |
| AI | `src/lib/ai/` | Gemini client, error classification, fallback orchestration |
| Config | `src/lib/config/env.ts` | Server-only environment access |

## Gemini API keys

- Read only via `getGeminiApiKey()` in `src/lib/config/env.ts`
- **Server-only** — never `NEXT_PUBLIC_GEMINI_API_KEY`
- Browser calls `/api/*`; Gemini is never contacted from the client

## Fallback behavior

When Gemini is unavailable (missing key, invalid key, auth error, quota, etc.), domain heuristics run instead.

- Response includes `analyzer: "gemini" | "heuristic"`
- When heuristic: optional safe `fallbackReason` (e.g. `authentication_error`)
- Heuristic analysis is a **fallback**, not equivalent to Gemini analysis

## Vercel

- Root directory: `syadvada-engine` (do not change)
- Set `GEMINI_API_KEY` in Vercel dashboard, then redeploy
