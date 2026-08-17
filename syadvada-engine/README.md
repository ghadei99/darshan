# Darshana Suite

Unified Next.js application combining two classical Indian epistemology tools:

- **Nyāya-Logic** — five-membered syllogistic argument analysis (*pañcāvayava*)
- **Syādvāda Engine** — seven-fold conditional perspective analysis (*Saptabhaṅgī*)

Dark, meditative UI with amber accents. Gemini integration optional; heuristic fallbacks work without an API key.

> **Note:** The folder is still named `syadvada-engine/` for git history. The unified app package name is `darshana-suite`.

Production deploys automatically from `main` on [GitHub](https://github.com/ghadei99/darshan) via Vercel → https://darshana-suite.vercel.app

## Quick Start

```bash
cd syadvada-engine
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

Live at [https://darshana-suite.vercel.app](https://darshana-suite.vercel.app).

| Route | URL |
| --- | --- |
| Landing | https://darshana-suite.vercel.app/ |
| Nyāya-Logic | https://darshana-suite.vercel.app/nyaya |
| Syādvāda | https://darshana-suite.vercel.app/syadvada |

## Pages

| Route | Module |
| --- | --- |
| `/` | Landing page — choose a module |
| `/nyaya` | Nyāya-Logic syllogistic analyzer |
| `/syadvada` | Syādvāda seven-fold analyzer |

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | **No** (but recommended) | **The only env var you need.** Enables Gemini AI across all modules. Without it, heuristic fallbacks run locally in TypeScript. |

### Vercel (production) — one variable

1. Open [darshana-suite → Settings → Environment Variables](https://vercel.com/ghadei99s-projects/darshana-suite/settings/environment-variables)
2. Add **`GEMINI_API_KEY`** with your key from [Google AI Studio](https://aistudio.google.com/apikey)
3. Apply to **Production** (and Preview if you want)
4. **Redeploy** — env changes only apply to new deployments (Deployments → ⋯ → Redeploy)

That's it. No other API keys or config required. Model defaults to `gemini-2.5-flash`.

## API

### `POST /api/nyaya/analyze`

Nyāya syllogistic analysis.

**Request:**

```json
{
  "argument": "Democracy is essential for human flourishing, because it allows citizens to participate in governance."
}
```

**Response:**

```json
{
  "validity": "partially valid",
  "steps": {
    "pratijna": "...",
    "hetu": "...",
    "udaharana": "...",
    "upanaya": "...",
    "nigamana": "..."
  },
  "fallacies": [],
  "analyzer": "heuristic"
}
```

```bash
curl -s -X POST http://localhost:3000/api/nyaya/analyze \
  -H "Content-Type: application/json" \
  -d '{"argument":"Everyone knows taxes are theft, so we should abolish them immediately."}' | jq .
```

### `POST /api/syadvada/analyze`

Syādvāda seven-fold analysis. Alias: `POST /api/analyze` (backward compatible).

**Request:**

```json
{
  "statement": "Remote work is always better than office work"
}
```

```bash
curl -s -X POST http://localhost:3000/api/syadvada/analyze \
  -H "Content-Type: application/json" \
  -d '{"statement":"AI will replace all human jobs"}' | jq .
```

## Project Structure

```
syadvada-engine/                    # Darshana Suite (unified app)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts       # Syādvāda alias
│   │   │   ├── nyaya/analyze/route.ts
│   │   │   └── syadvada/analyze/route.ts
│   │   ├── nyaya/page.tsx
│   │   ├── syadvada/page.tsx
│   │   ├── page.tsx                   # Landing
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AppNav.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NyayaLogic.tsx
│   │   ├── SyadvadaEngine.tsx
│   │   ├── PerspectiveCard.tsx
│   │   ├── PerspectiveGrid.tsx
│   │   └── ViewToggle.tsx
│   └── lib/
│       ├── nyaya/
│       │   ├── analyzer.ts
│       │   ├── heuristic.ts
│       │   └── types.ts
│       ├── analyzer.ts                # Syādvāda orchestration
│       ├── heuristic.ts
│       └── types.ts
├── .env.example
└── README.md
```

## Deprecated Standalone Apps

The following standalone apps are **deprecated** — use Darshana Suite instead:

| Old app | Was | Now |
| --- | --- | --- |
| `nyaya-logic/` | FastAPI + static HTML on port 8000 | Ported to `/nyaya` + `/api/nyaya/analyze` |
| `syadvada-engine/` (as standalone Syādvāda only) | Next.js on port 3000 at `/` | Evolved into unified suite; Syādvāda at `/syadvada` |

Python source in `nyaya-logic/` is retained for reference but is **not required** to run the unified app. Do not start the FastAPI server unless you need the legacy setup.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
