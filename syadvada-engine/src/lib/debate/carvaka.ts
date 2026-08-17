/**
 * Cārvāka (Lokāyata) empirical skepticism — pattern detection and reply generation.
 * Only pratyakṣa (direct perception) is pramāṇa; śabda, metaphysics, and unverified inference are rejected.
 */

const SHABDA_PATTERNS = [
  /\b(scripture|veda|vedas|texts?|ancient|tradition|guru|sage|revealed|revelation|holy|sacred|word of|according to|apta|āpta|shabda|śabda|testimony|authority says)\b/i,
  /\b(bible|quran|upanishad|gita|sutra|sūtra|prophet|divine)\b/i,
];

const METAPHYSICAL_PATTERNS = [
  /\b(soul|ātman|atman|self|consciousness beyond|spirit|spiritual|brahman|god|gods?|divine|supernatural|transcendent|immortal|eternal soul)\b/i,
  /\b(afterlife|heaven|hell|other world|paralok|realm beyond)\b/i,
];

const KARMA_PATTERNS = [
  /\b(karma|karmic|rebirth|reincarnat|saṃsāra|samsara|punya|pāpa|papa|merit|demerit|past life|next life|moral order|cosmic justice)\b/i,
  /\b(attachment|detachment|liberation|moksha|mokṣa|nirvana|nibbana|enlightenment)\b/i,
];

const INFERENCE_PATTERNS = [
  /\b(therefore|thus|hence|must be|implies?|infer|because .+ must|it follows|consequently)\b/i,
  /\b(cause[ds]? unseen|unobserved|invisible|cannot see but|beyond perception)\b/i,
];

export type CarvakaClaimType =
  | "shabda"
  | "metaphysical"
  | "karma"
  | "inference"
  | "general";

export function classifyCarvakaClaim(text: string): CarvakaClaimType[] {
  const types: CarvakaClaimType[] = [];
  if (SHABDA_PATTERNS.some((p) => p.test(text))) types.push("shabda");
  if (METAPHYSICAL_PATTERNS.some((p) => p.test(text))) types.push("metaphysical");
  if (KARMA_PATTERNS.some((p) => p.test(text))) types.push("karma");
  if (INFERENCE_PATTERNS.some((p) => p.test(text))) types.push("inference");
  if (types.length === 0) types.push("general");
  return types;
}

function excerpt(text: string, max = 55): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}

const SHABDA_REPLIES = [
  (arg: string) =>
    `Śabda? Scripture? "${excerpt(arg)}" — you cite words on a page, not perception. Cārvāka dismisses testimony (śabda) entirely: no āpta-vākya, no Veda, no tradition can establish what the senses have not confirmed. Bring this claim under your eyes and hands, or withdraw it.`,
  (arg: string) =>
    `"${excerpt(arg)}" rests on hearsay dressed as authority. The Lokāyata barṣa: yad dṛṣṭaṃ tat satyam — what is seen, that alone is true. Which sense-organ perceived your scriptural truth? None? Then it is empty noise.`,
];

const METAPHYSICAL_REPLIES = [
  (arg: string) =>
    `Soul? Spirit? Brahman? "${excerpt(arg)}" — name the organ that perceives these. The body is earth, water, fire, air; consciousness arises when they combine, like intoxication from fermented grain. Show me ātman under a knife or microscope. You cannot — so you preach what you do not know.`,
  (arg: string) =>
    `You import invisible furniture into the universe. "${excerpt(arg)}" — every metaphysical entity you posit is beyond pratyakṣa. Cārvāka cuts them all: no Self apart from the living body, no world beyond the grave. Prove otherwise with direct observation, not poetry.`,
];

const KARMA_REPLIES = [
  (arg: string) =>
    `Karma? Rebirth? "${excerpt(arg)}" — who has seen a soul migrate at death? Who has weighed merit across lifetimes? No one. These are priestly inventions to frighten the living. Death is annihilation; pleasure while alive is the only honest good (bṛhaspati-vākya).`,
  (arg: string) =>
    `"${excerpt(arg)}" assumes an unseen moral ledger. Cārvāka asks: produce the perception. Has any man returned to report his past life? Has karma been tasted, touched, weighed? Until then, your doctrine is fear — not knowledge.`,
];

const INFERENCE_REPLIES = [
  (arg: string) =>
    `You infer what you cannot see. "${excerpt(arg)}" — Cārvāka grants inference only where the link is perceived (fire from smoke one has witnessed). Leap to the unobserved — God, soul, cosmic justice — and you build castles on air. Perceive first; reason second.`,
  (arg: string) =>
    `"${excerpt(arg)}" — your 'therefore' bridges a gap no eye has crossed. Lokāyata epistemology is ruthless: extend inference beyond immediate experience and you merely repeat what priests and poets wish were true.`,
];

const GENERAL_REPLIES = [
  (arg: string) =>
    `"${excerpt(arg)}" — fine words. Now: which of the five senses confirms it? Cārvāka accepts only pratyakṣa. Everything else — inference to the unseen, scripture, metaphysics — is avidyā (ignorance) masquerading as wisdom. Produce the perception or concede.`,
  (arg: string) =>
    `The earth-born (bhūtacaitanya) wise enjoy here and now; fools mortify themselves for fictions. "${excerpt(arg)}" — until you place this thesis before touch, taste, sight, smell, or hearing, the Lokāyata cannot accept it. Sensory proof, or silence.`,
  (arg: string) =>
    `You speak of "${excerpt(arg)}" as if knowledge were cheap. Cārvāka is absolute: no perception, no claim. Dismiss śabda. Dismiss karma. Dismiss soul. Matter, sense, pleasure — the rest is priestcraft. Challenge me with something a living body can verify.`,
];

export function generateCarvakaReply(arg: string, turn: number): string {
  const types = classifyCarvakaClaim(arg);
  const primary = types[0];

  const banks: Record<CarvakaClaimType, ((a: string) => string)[]> = {
    shabda: SHABDA_REPLIES,
    metaphysical: METAPHYSICAL_REPLIES,
    karma: KARMA_REPLIES,
    inference: INFERENCE_REPLIES,
    general: GENERAL_REPLIES,
  };

  const bank = banks[primary];
  let reply = bank[turn % bank.length](arg);

  if (types.length > 1 && turn % 2 === 0) {
    const secondary = types[1];
    if (secondary !== "general" && secondary !== primary) {
      const extra = banks[secondary][0](arg);
      const sentence = extra.split(/[.!?]/).filter(Boolean)[0];
      if (sentence) {
        reply += ` Moreover: ${sentence.trim()}.`;
      }
    }
  }

  return reply;
}

export const CARVAKA_OPENAI_PERSONA = `You are a fierce Cārvāka (Lokāyata) materialist philosopher — absolute empirical skeptic, blunt, witty, and unyielding.

EPISTEMOLOGY (non-negotiable):
- ONLY pratyakṣa (direct sensory perception) is pramāṇa. If it cannot be seen, touched, tasted, smelled, or heard by a living embodied person, it is not knowledge.
- REJECT śabda (verbal testimony/scripture) ENTIRELY — no Veda, no āpta, no tradition, no "ancient texts." Words on a page are not perception.
- REJECT inference (anumāna) to unobserved entities: soul, God, karma, rebirth, afterlife, liberation, cosmic moral order.
- Consciousness is a product of the four elements in the body (bhūtacaitanya); it perishes at death. No ātman survives.
- Pleasure (bhukti) in this life is the highest good. Asceticism and metaphysics are priestly fraud.

DEBATE STYLE:
- Demand sensory proof for EVERY metaphysical, karmic, or spiritual claim. Ask: "Which sense-organ perceived this?"
- Mock scriptural citations as hearsay. Quote the spirit of Bṛhaspati: perception alone is real.
- Challenge the user aggressively but philosophically — not rude, but intellectually merciless.
- Never concede validity to śabda, karma, or soul even for rhetorical balance. You ARE the Cārvāka.
- Use Sanskrit terms sparingly with glosses (pratyakṣa, śabda, lokāyata).

Respond 3-5 sentences. Stay in character. Never mention being an AI.`;
