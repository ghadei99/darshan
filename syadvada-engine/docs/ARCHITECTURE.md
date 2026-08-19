# Darshana Suite Architecture

## Overview

Darshana Suite is a Next.js 16 application. Each philosophical module (Prāmāṇa, Syādvāda, Nyāya, Yoga, Dharma, Debate) has isolated domain logic with shared AI infrastructure.

```
UI (Client Components)
  → Route Handlers (/api/*)
    → Domain analyzers (lib/<module>/analyzer.ts)
      → AI infrastructure (lib/ai/*)
        → Provider router (lib/ai/generate.ts)
          → Gemini | OpenRouter | Groq (server-only)
            → Groq: ordered multi-model failover
        → Heuristic fallback (lib/<module>/heuristic.ts)
```

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI | `src/components/<module>/` | User interaction, fetch API routes |
| Routes | `src/app/api/<module>/` | HTTP boundary, validation |
| Domain | `src/lib/<module>/` | Philosophical analysis, prompts, heuristics |
| AI | `src/lib/ai/` | Provider clients, error classification, fallback orchestration |
| Config | `src/lib/config/env.ts` | Server-only environment access |

## Provider selection

`AI_PROVIDER` (case-insensitive) selects the transport. Missing/unknown values default to Gemini.

| `AI_PROVIDER` | Implementation |
|---------------|----------------|
| unset / `gemini` | Existing Gemini client |
| `openrouter` | Existing OpenRouter chat completions client |
| `groq` | Groq OpenAI-compatible chat completions with model failover |

## API keys

- Read only via `src/lib/config/env.ts` (`getGeminiApiKey`, `getOpenRouterApiKey`, `getGroqApiKey`)
- **Server-only** — never `NEXT_PUBLIC_*_API_KEY`
- Browser calls `/api/*`; providers are never contacted from the client

## Groq model failover

When `AI_PROVIDER=groq`, each request tries models in `GROQ_MODELS` order (comma-separated). Default order:

```
openai/gpt-oss-120b
llama-3.3-70b-versatile
qwen/qwen3.6-27b
openai/gpt-oss-20b
llama-3.1-8b-instant
```

Retryable failures (rate limit, 5xx, model not found, empty/truncated/malformed output, network) advance to the next model. Authentication/permission failures stop immediately. After all configured models fail, the existing heuristic fallback runs. Maximum Groq attempts per request equals the number of configured models.

## Fallback behavior

When the selected provider is unavailable (missing key, invalid key, auth error, exhausted Groq models, etc.), domain heuristics run instead.

- Response includes `analyzer: "gemini" | "openrouter" | "groq" | "heuristic"`
- Successful Groq responses may include `model` (the model that succeeded)
- When heuristic: optional safe `fallbackReason`
- Heuristic analysis is a **fallback**, not equivalent to model analysis

## Vercel

- Root directory: `syadvada-engine` (do not change)
- Set provider env vars in the Vercel dashboard, then redeploy
