# Nyāya-Logic

> **Deprecated:** This standalone FastAPI app has been merged into **Darshana Suite** (`syadvada-engine/`).  
> Use `cd syadvada-engine && npm run dev` and open [http://localhost:3000/nyaya](http://localhost:3000/nyaya).  
> The Python code below is retained for reference; the unified app ports the analyzer to TypeScript.

Full-stack argument analyzer grounded in classical Indian **Nyāya** epistemology. Decomposes discourse into the five-membered syllogism (*pañcāvayava*) and flags logical fallacies (*hetvābhāsa*).

## Structure

```
nyaya-logic/
├── backend/
│   ├── main.py          # FastAPI app, CORS, /analyze endpoint
│   ├── analyzer.py      # OpenAI or heuristic Nyāya analysis
│   └── models.py        # Pydantic request/response schemas
├── frontend/
│   └── index.html       # Single-page Tailwind UI
├── requirements.txt
└── README.md
```

## Setup

Requires **Python 3.10+**.

```bash
cd nyaya-logic
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Optional: OpenAI

For richer LLM-powered analysis, set:

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini   # optional, defaults to gpt-4o-mini
```

Or create `nyaya-logic/.env`:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Without an API key, the **heuristic analyzer** still produces structured Nyāya breakdowns using pattern matching and classical fallacy detection.

## Run

### Backend (serves API + frontend)

```bash
cd nyaya-logic
source .venv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000** in your browser.

### Frontend only (separate static server)

If you prefer to serve the HTML separately:

```bash
cd nyaya-logic/frontend
python3 -m http.server 5500
```

The frontend auto-detects port 5500 and calls the API at `http://localhost:8000`.

## API

### `POST /analyze`

**Request:**

```json
{
  "argument": "Democracy is essential for human flourishing, because it allows citizens to participate in governance. For example, nations with free elections tend to have higher civic trust. Therefore, democratic institutions should be strengthened."
}
```

**Response:**

```json
{
  "validity": "partially valid",
  "steps": {
    "pratijna": "Democracy is essential for human flourishing",
    "hetu": "it allows citizens to participate in governance",
    "udaharana": "For example, nations with free elections tend to have higher civic trust.",
    "upanaya": "As in the stated example, the same invariable concomitance applies to the subject of the thesis: 'Democracy is essential for human flourishing'.",
    "nigamana": "democratic institutions should be strengthened."
  },
  "fallacies": [],
  "analyzer": "heuristic"
}
```

### `GET /health`

Returns `{"status": "ok", "service": "nyaya-logic"}`.

### Example curl

```bash
curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"argument": "Everyone knows taxes are theft, so we should abolish them immediately."}' | python3 -m json.tool
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables OpenAI-powered analysis |
| `OPENAI_MODEL` | No | Model name (default: `gpt-4o-mini`) |

## The five Nyāya avayavas

| Sanskrit | Role |
| --- | --- |
| **Pratijñā** | Thesis — the proposition to be proved |
| **Hetu** | Reason — logical ground linking subject and predicate |
| **Udāharaṇa** | Example — known instance illustrating *vyāpti* (invariable concomitance) |
| **Upanaya** | Application — applying the example to the subject |
| **Nigamana** | Conclusion — reaffirmed thesis |
