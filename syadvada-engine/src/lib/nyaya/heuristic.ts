import type { NyayaAnalyzeResponse, NyayaSteps } from "./types";

const FALLACY_PATTERNS: Array<[RegExp, string]> = [
  [/\b(always|never|everyone|no one|all .+ are)\b/i, "hasty generalization (sāmānya-doṣa)"],
  [/\b(either .+ or|only two (choices|options))\b/i, "false dichotomy (dvaya-doṣa)"],
  [
    /\b(because I said|trust me|experts say|studies show)\b/i,
    "appeal to authority (śabda-doṣa, unexamined)",
  ],
  [/\b(you are|you're) (stupid|ignorant|biased|liar)\b/i, "ad hominem (puruṣa-doṣa)"],
  [/\b(if we allow .+ then .+ will happen)\b/i, "slippery slope (anavasthā-doṣa)"],
  [
    /\b(clearly|obviously|everyone knows)\b/i,
    "begging the question / unproved assertion (siddhasādhanā)",
  ],
  [
    /\b(they say|some people claim).{0,80}(but really|actually)\b/i,
    "straw man (pratibandha-doṣa)",
  ],
  [/\b(the same thing|that's just|it's the same as)\b/i, "false equivalence (sāmāna-doṣa)"],
  [/\b(because .+ because)\b/i, "circular reasoning (āvṛtti-doṣa)"],
  [
    /\b(correlation|linked to|associated with).{0,40}(therefore|so|proves)\b/i,
    "post hoc / false cause (kālātīta)",
  ],
];

const SENTENCE_SPLIT = /(?<=[.!?])\s+|\n+/;
const BECAUSE_SPLIT = /\b(?:because|since|given that)\b/i;
const THEREFORE_SPLIT = /\b(?:therefore|thus|hence|consequently|it follows that)\b/i;
const EXAMPLE_MARKERS = /\b(?:for example|for instance|such as|like|consider|e\.g\.)\b/i;

function sentences(text: string): string[] {
  const parts = text.trim().split(SENTENCE_SPLIT);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function detectFallacies(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const [pattern, name] of FALLACY_PATTERNS) {
    if (pattern.test(lower)) found.push(name);
  }
  if (!sentences(text).length) {
    found.push("empty or incoherent argument (śabda-doṣa)");
  }
  if (sentences(text).length === 1 && text.length < 40) {
    found.push("underdeveloped syllogism — insufficient avayavas (members)");
  }
  return [...new Set(found)];
}

function rateValidity(fallacies: string[], steps: NyayaSteps): string {
  const missing = [
    steps.pratijna,
    steps.hetu,
    steps.udaharana,
    steps.upanaya,
    steps.nigamana,
  ].filter(
    (v) => v.startsWith("[Implicit") || v.startsWith("[Not clearly"),
  ).length;

  if (fallacies.length >= 3) return "invalid";
  if (fallacies.length >= 1 || missing >= 3) return "partially valid";
  if (missing >= 1) return "partially valid";
  return "valid";
}

export function heuristicAnalyze(argument: string): NyayaAnalyzeResponse {
  const text = argument.trim();
  const sents = sentences(text);
  const fallacies = detectFallacies(text);

  let thesis = "[Not clearly stated]";
  let reason = "[Not clearly stated]";
  let example = "[Not clearly stated]";
  let application = "[Not clearly stated]";
  let conclusion = "[Not clearly stated]";

  for (const sent of sents) {
    if (BECAUSE_SPLIT.test(sent) && reason === "[Not clearly stated]") {
      const parts = sent.split(BECAUSE_SPLIT);
      if (parts.length >= 2) {
        const claim = parts[0].trim().replace(/,$/, "");
        const ground = parts.slice(1).join(" ").trim().replace(/\.$/, "");
        if (thesis === "[Not clearly stated]") thesis = claim || sent;
        reason = ground;
      }
    }
    if (EXAMPLE_MARKERS.test(sent) && example === "[Not clearly stated]") {
      example = sent;
    }
    if (THEREFORE_SPLIT.test(sent)) {
      const parts = sent.split(THEREFORE_SPLIT);
      if (parts.length >= 2) {
        conclusion =
          parts.slice(1).join(" ").trim().replace(/^,/, "").trim() || sent;
      } else {
        conclusion = sent.trim();
      }
    }
  }

  if (thesis === "[Not clearly stated]" && sents.length) thesis = sents[0];

  if (conclusion === "[Not clearly stated]") {
    if (sents.length > 1) conclusion = sents[sents.length - 1];
    else if (thesis !== "[Not clearly stated]")
      conclusion = `Therefore, ${thesis.replace(/\.$/, "")}.`;
  }

  if (reason === "[Not clearly stated]" && sents.length > 1) {
    const mid =
      sents.length > 2 ? sents.slice(1, -1) : [sents[1]];
    reason =
      mid.filter((s) => !EXAMPLE_MARKERS.test(s)).join(" ") ||
      "[Implicit — causal link assumed but unstated]";
  }

  if (example === "[Not clearly stated]") {
    for (const sent of sents) {
      if (EXAMPLE_MARKERS.test(sent)) {
        example = sent;
        break;
      }
    }
    if (example === "[Not clearly stated]") {
      example =
        "[Implicit — no illustrative instance (udāharaṇa) provided; vyāpti unestablished]";
    }
  }

  if (application === "[Not clearly stated]") {
    if (example !== "[Not clearly stated]" && !example.startsWith("[Implicit")) {
      application = `As in the stated example, the same invariable concomitance applies to the subject of the thesis: '${thesis.replace(/\.$/, "")}'.`;
    } else {
      application =
        "[Implicit — upanaya (application) must link hetu to pratijñā via vyāpti]";
    }
  }

  const steps: NyayaSteps = {
    pratijna: thesis,
    hetu: reason,
    udaharana: example,
    upanaya: application,
    nigamana: conclusion,
  };

  return {
    validity: rateValidity(fallacies, steps),
    steps,
    fallacies,
    analyzer: "heuristic",
  };
}
