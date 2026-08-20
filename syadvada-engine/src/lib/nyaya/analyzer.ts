import { generateJson } from "@/lib/ai/generate";
import { withGeminiFallback } from "@/lib/ai/fallback/with-gemini-fallback";
import { JSON_VOICE_NOTE } from "../prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import type { NyayaAnalyzeResponse, NyayaSteps } from "./types";

const NYAYA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You're dissecting an argument Nyāya-style — like a philosophical detective walking through a five-step syllogism. Make it click for a smart friend, not a dissertation committee.

Map the argument to pañcāvayava (five members):
1. Pratijñā (thesis) — what's being claimed
2. Hetu (reason) — the logical bridge
3. Udāharaṇa (example) — "like when you see smoke and know fire"
4. Upanaya (application) — plugging the example into this case
5. Nigamana (conclusion) — the payoff

VALIDITY RUBRIC — apply the actual Nyāya standard, not a vibe check:
A hetu proves its sādhya (target property) when two things hold: pakṣadharmatā (the hetu genuinely qualifies the pakṣa — smoke is actually present on this hill) and vyāpti (invariable concomitance between hetu and sādhya — smoke is never found apart from fire, grounded in a real sapakṣa instance like a kitchen and no known vipakṣa counter-instance like fog with no fire anywhere). When both hold and no hetvābhāsa applies, the inference is "valid" — full stop. Do NOT downgrade a textbook-sound inference (e.g. the classic hill–smoke–fire case) to "partially valid" out of generic induction-skepticism ("but what if it's fog, not smoke?"). That kind of hedging is not a recognized hetvābhāsa — it is a modern doubt about whether the hetu was correctly perceived, not a defect in the argument's logical form, and the classical tradition treats hill-smoke-fire via a kitchen example as ITS paradigm case of a valid inference, not a shaky one.

The five classical hetvābhāsas (name the specific one when you flag a defect, don't just say "fallacy"):
- Asiddha — the hetu is unestablished; it doesn't actually qualify the pakṣa (e.g. reasoning from something never actually observed, or from a feeling/guess/dream rather than a real perceptual or inferential ground).
- Viruddha — the hetu actually proves the opposite of the stated thesis.
- Anaikāntika / savyabhicāra — the hetu is inconclusive: it occurs together with the sādhya sometimes but also occurs where the sādhya is absent, so it does not reliably track it.
- Satpratipakṣa — the hetu is exactly counterbalanced by an equally strong opposing argument.
- Bādhita — a more secure means of knowledge already contradicts the conclusion.

Beyond these five, you may also flag ordinary informal fallacies when the argument's PROSE genuinely commits them (hasty generalization, false dichotomy, ad hominem, circular reasoning, appeal to authority, straw man, slippery slope, etc.) — but reserve these for real defects in the reasoning as given, not for hedging about a sound classical example. Name each fallacy in plain English with a punchy one-liner.

Calibrate the "validity" field this way:
- "valid" — pakṣadharmatā and vyāpti both hold, no hetvābhāsa applies.
- "partially valid" — the syllogism is reconstructable and roughly on track, but has a real identifiable weakness (e.g. vyāpti is asserted without any grounding example, or an informal fallacy taints the prose without undermining the whole inference).
- "invalid" — a genuine hetvābhāsa applies (the hetu is unestablished, contradictory, inconclusive, counterbalanced, or rebutted), or the structure doesn't actually support the thesis at all.

Respond ONLY with valid JSON:
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

Extract or reconstruct each step. If implicit, say what you'd infer — conversationally.`;

async function geminiAnalyze(argument: string): Promise<NyayaAnalyzeResponse> {
  const data = await generateJson<{
    validity?: string;
    steps?: Partial<NyayaSteps>;
    fallacies?: string[];
  }>({
    systemInstruction: NYAYA_SYSTEM_PROMPT,
    userPrompt: `Analyze this argument:\n\n${argument}`,
    temperature: 0.3,
  });

  const stepsData = data.steps ?? {};
  return {
    validity: String(data.validity ?? "partially valid"),
    steps: {
      pratijna: stepsData.pratijna ?? "[Unidentified]",
      hetu: stepsData.hetu ?? "[Unidentified]",
      udaharana: stepsData.udaharana ?? "[Unidentified]",
      upanaya: stepsData.upanaya ?? "[Unidentified]",
      nigamana: stepsData.nigamana ?? "[Unidentified]",
    },
    fallacies: data.fallacies ?? [],
    analyzer: "gemini",
  };
}

export async function analyzeArgument(
  argument: string,
): Promise<NyayaAnalyzeResponse> {
  const text = argument.trim();
  if (!text) throw new Error("Argument cannot be empty");

  return withGeminiFallback(
    () => geminiAnalyze(text),
    () => heuristicAnalyze(text),
  );
}
