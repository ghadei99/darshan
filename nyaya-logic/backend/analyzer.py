"""Nyāya epistemological argument analyzer — OpenAI or heuristic fallback."""

from __future__ import annotations

import json
import os
import re
from typing import Any

from .models import AnalyzeResponse, NyayaSteps

NYAYA_SYSTEM_PROMPT = """You are a scholar of classical Indian Nyāya epistemology.
Analyze the given argument through the five-membered syllogism (pañcāvayava):

1. Pratijñā (thesis) — the proposition to be proved
2. Hetu (reason) — the logical ground connecting subject and predicate
3. Udāharaṇa (example) — a known instance illustrating the invariable concomitance (vyāpti)
4. Upanaya (application) — applying the example to the subject under discussion
5. Nigamana (conclusion) — the reaffirmed thesis

Also detect logical fallacies (hetvābhāsa / informal fallacies) such as:
sadhyasama (the unproved), asiddha (the unestablished), anaikāntika (inconclusive reason),
vyabhicāra (deviating), kālātīta (mistimed), ad hominem, straw man, false dichotomy,
hasty generalization, circular reasoning, appeal to authority, slippery slope, etc.

Respond ONLY with valid JSON matching this schema:
{
  "validity": "valid" | "partially valid" | "invalid",
  "steps": {
    "pratijna": "...",
    "hetu": "...",
    "udaharana": "...",
    "upanaya": "...",
    "nigamana": "..."
  },
  "fallacies": ["...", ...]
}

Extract or reconstruct each step from the argument. If a step is implicit, state what is implied.
Be precise and scholarly but accessible. Use Sanskrit terms only in fallacy names where appropriate."""


FALLACY_PATTERNS: list[tuple[str, str]] = [
    (r"\b(always|never|everyone|no one|all .+ are)\b", "hasty generalization (sāmānya-doṣa)"),
    (r"\b(either .+ or|only two (choices|options))\b", "false dichotomy (dvaya-doṣa)"),
    (r"\b(because I said|trust me|experts say|studies show)\b", "appeal to authority (śabda-doṣa, unexamined)"),
    (r"\b(you are|you're) (stupid|ignorant|biased|liar)\b", "ad hominem (puruṣa-doṣa)"),
    (r"\b(if we allow .+ then .+ will happen)\b", "slippery slope (anavasthā-doṣa)"),
    (r"\b(clearly|obviously|everyone knows)\b", "begging the question / unproved assertion (siddhasādhanā)"),
    (r"\b(they say|some people claim).{0,80}(but really|actually)\b", "straw man (pratibandha-doṣa)"),
    (r"\b(the same thing|that's just|it's the same as)\b", "false equivalence (sāmāna-doṣa)"),
    (r"\b(because .+ because)\b", "circular reasoning (āvṛtti-doṣa)"),
    (r"\b(correlation|linked to|associated with).{0,40}(therefore|so|proves)\b", "post hoc / false cause (kālātīta)"),
]

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+|\n+")
BECAUSE_SPLIT = re.compile(r"\b(?:because|since|given that)\b", re.I)
THEREFORE_SPLIT = re.compile(r"\b(?:therefore|thus|hence|consequently|it follows that)\b", re.I)
EXAMPLE_MARKERS = re.compile(r"\b(?:for example|for instance|such as|like|consider|e\.g\.)\b", re.I)


def _sentences(text: str) -> list[str]:
    parts = SENTENCE_SPLIT.split(text.strip())
    return [p.strip() for p in parts if p.strip()]


def _first_match(pattern: re.Pattern[str], text: str) -> str | None:
    m = pattern.search(text)
    return m.group(0) if m else None


def _detect_fallacies(text: str) -> list[str]:
    found: list[str] = []
    lower = text.lower()
    for pattern, name in FALLACY_PATTERNS:
        if re.search(pattern, lower, re.I):
            found.append(name)
    if not _sentences(text):
        found.append("empty or incoherent argument (śabda-doṣa)")
    if len(_sentences(text)) == 1 and len(text) < 40:
        found.append("underdeveloped syllogism — insufficient avayavas (members)")
    return list(dict.fromkeys(found))


def _rate_validity(fallacies: list[str], steps: NyayaSteps) -> str:
    missing = sum(
        1
        for v in (
            steps.pratijna,
            steps.hetu,
            steps.udaharana,
            steps.upanaya,
            steps.nigamana,
        )
        if v.startswith("[Implicit") or v.startswith("[Not clearly")
    )
    if len(fallacies) >= 3:
        return "invalid"
    if len(fallacies) >= 1 or missing >= 3:
        return "partially valid"
    if missing >= 1:
        return "partially valid"
    return "valid"


def _heuristic_analyze(argument: str) -> AnalyzeResponse:
    text = argument.strip()
    sentences = _sentences(text)
    fallacies = _detect_fallacies(text)

    thesis = "[Not clearly stated]"
    reason = "[Not clearly stated]"
    example = "[Not clearly stated]"
    application = "[Not clearly stated]"
    conclusion = "[Not clearly stated]"

    for sent in sentences:
        if BECAUSE_SPLIT.search(sent) and reason == "[Not clearly stated]":
            parts = BECAUSE_SPLIT.split(sent, maxsplit=1)
            if len(parts) == 2:
                claim, ground = parts[0].strip().rstrip(","), parts[1].strip().rstrip(".")
                if thesis == "[Not clearly stated]":
                    thesis = claim or sent
                reason = ground
        if EXAMPLE_MARKERS.search(sent) and example == "[Not clearly stated]":
            example = sent
        if THEREFORE_SPLIT.search(sent):
            parts = THEREFORE_SPLIT.split(sent, maxsplit=1)
            if len(parts) == 2:
                conclusion = parts[1].strip().lstrip(",").strip() or sent
            else:
                conclusion = sent.strip()

    if thesis == "[Not clearly stated]" and sentences:
        thesis = sentences[0]

    if conclusion == "[Not clearly stated]":
        if len(sentences) > 1:
            conclusion = sentences[-1]
        elif thesis != "[Not clearly stated]":
            conclusion = f"Therefore, {thesis.rstrip('.')}."

    if reason == "[Not clearly stated]" and len(sentences) > 1:
        mid = sentences[1:-1] if len(sentences) > 2 else [sentences[1]]
        reason = " ".join(s for s in mid if not EXAMPLE_MARKERS.search(s)) or "[Implicit — causal link assumed but unstated]"

    if example == "[Not clearly stated]":
        for sent in sentences:
            if EXAMPLE_MARKERS.search(sent):
                example = sent
                break
        if example == "[Not clearly stated]":
            example = "[Implicit — no illustrative instance (udāharaṇa) provided; vyāpti unestablished]"

    if application == "[Not clearly stated]":
        if example != "[Not clearly stated]" and not example.startswith("[Implicit"):
            application = (
                f"As in the stated example, the same invariable concomitance applies to the subject of the thesis: "
                f"'{thesis.rstrip('.')}'."
            )
        else:
            application = "[Implicit — upanaya (application) must link hetu to pratijñā via vyāpti]"

    steps = NyayaSteps(
        pratijna=thesis,
        hetu=reason,
        udaharana=example,
        upanaya=application,
        nigamana=conclusion,
    )

    return AnalyzeResponse(
        validity=_rate_validity(fallacies, steps),
        steps=steps,
        fallacies=fallacies,
        analyzer="heuristic",
    )


async def _openai_analyze(argument: str) -> AnalyzeResponse:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    response = await client.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": NYAYA_SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this argument:\n\n{argument}"},
        ],
        temperature=0.3,
    )
    raw = response.choices[0].message.content or "{}"
    data: dict[str, Any] = json.loads(raw)
    steps_data = data.get("steps", {})
    return AnalyzeResponse(
        validity=str(data.get("validity", "partially valid")),
        steps=NyayaSteps(
            pratijna=steps_data.get("pratijna", "[Unidentified]"),
            hetu=steps_data.get("hetu", "[Unidentified]"),
            udaharana=steps_data.get("udaharana", "[Unidentified]"),
            upanaya=steps_data.get("upanaya", "[Unidentified]"),
            nigamana=steps_data.get("nigamana", "[Unidentified]"),
        ),
        fallacies=list(data.get("fallacies", [])),
        analyzer="openai",
    )


async def analyze_argument(argument: str) -> AnalyzeResponse:
    """Analyze an argument using OpenAI if configured, else heuristic fallback."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if api_key:
        try:
            return await _openai_analyze(argument)
        except Exception:
            pass
    return _heuristic_analyze(argument)
