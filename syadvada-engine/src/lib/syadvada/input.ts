export type InputKind = "concept" | "phrase" | "claim";

export interface InputAnalysis {
  raw: string;
  subject: string;
  kind: InputKind;
  isConcrete: boolean;
  wordCount: number;
}

const VERB_PATTERN =
  /\b(is|are|was|were|am|be|been|being|has|have|had|do|does|did|will|would|can|could|should|must|may|might|shall|ought|need|seem|become|makes?|means?|causes?|leads?|proves?|shows?|implies?|suggests?|replaces?|destroys?|creates?|exists?)\b/i;

const ABSTRACT_CONCEPTS = new Set([
  "justice",
  "truth",
  "freedom",
  "love",
  "beauty",
  "karma",
  "dharma",
  "consciousness",
  "god",
  "soul",
  "time",
  "infinity",
  "happiness",
  "evil",
  "good",
  "morality",
  "meaning",
  "reality",
  "identity",
  "self",
]);

function cleanSubject(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function stripWrappingQuotes(text: string): string {
  return text.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
}

export function parseInput(statement: string): InputAnalysis {
  const raw = cleanSubject(statement);
  const stripped = stripWrappingQuotes(raw);
  const words = stripped.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = stripped.toLowerCase();
  const subject = stripped;

  const hasVerb = VERB_PATTERN.test(stripped);
  const endsWithQuestion = /\?$/.test(stripped);
  const looksLikeClaim =
    hasVerb || endsWithQuestion || wordCount >= 6 || /\b(that|because|therefore|if|then)\b/i.test(stripped);

  let kind: InputKind;
  if (looksLikeClaim) {
    kind = "claim";
  } else if (wordCount <= 4) {
    kind = "concept";
  } else {
    kind = "phrase";
  }

  const headWord = words[0]?.toLowerCase() ?? lower;
  const isConcrete =
    kind === "concept" &&
    !ABSTRACT_CONCEPTS.has(lower) &&
    !ABSTRACT_CONCEPTS.has(headWord) &&
    wordCount <= 2;

  return { raw, subject, kind, isConcrete, wordCount };
}

export function quoteInput(subject: string): string {
  return `“${subject}”`;
}
