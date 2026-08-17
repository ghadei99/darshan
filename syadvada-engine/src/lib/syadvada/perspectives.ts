import type { PerspectiveId } from "../types";
import type { InputAnalysis } from "./input";
import { quoteInput } from "./input";

type PerspectiveCopy = { classical: string; stakeholder: string };

function q(subject: string): string {
  return quoteInput(subject);
}

function conceptClassical(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `Look — ${s} is undeniably real in the perceptual frame: you can point to its shape, trace its parts (whole vs trunk vs skin), and locate it in space and time. As a named thing in language and culture, it also “is” as a sign people share — even before you touch the physical instance.`,
    "syat-nasti": `Here's the twist with ${s}: it is not one fixed essence. The word is not the thing; a picture is not the living instance; dismantle the parts and “${a.subject}” no longer holds in the same respect. In another context — legal fiction, metaphor, absence — ${s} simply is not.`,
    "syat-asti-nasti": `${s} exists as a whole organism or unified idea and simultaneously does not — depending on whether you analyze parts (where “${a.subject}” as a single substance dissolves) or gestalt (where the collection clearly is). Dravya vs guṇa, map vs territory: both readings are live.`,
    "syat-avaktavya": `The full reality of ${s} outruns speech — the texture of encounter, the relational field it creates, the pre-conceptual grasp before the label lands. You can gesture toward ${a.subject}; you cannot exhaust it in a sentence without leaving something out.`,
    "syat-asti-avaktavya": `${s} is present — in sensation, memory, or record — yet what it IS in its inner standpoint (if it has one) stays partly opaque. We affirm its being while admitting our description captures only a slice of ${a.subject}.`,
    "syat-nasti-avaktavya": `Negation bites for ${s} in some frames (no such thing in the void; no stable self in the parts), but that very “is not” is hard to nail verbally — absence, illusion, and conceptual slippage resist clean predication about ${a.subject}.`,
    "syat-asti-nasti-avaktavya": `For ${s}, affirmation, denial, and ineffability arrive together: it is (in experience), is not (under analysis), and eludes final capture (in language). The seven-fold knot tightens here — no single verdict on ${a.subject} closes the case.`,
  };
  return map[id];
}

function abstractClassical(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `${s} functions as a real orienting idea — people organize law, ritual, and daily choices around it. In ethical or metaphysical discourse, it “is” as a working concept with discernible criteria (even if disputed).`,
    "syat-nasti": `In another respect, ${s} fails to denote anything uniform: cultures define it differently, skeptics treat it as empty shorthand, and in strict empiricist frames it may not “be” at all — only opinions about it are.`,
    "syat-asti-nasti": `${s} is simultaneously binding (for those inside a tradition or institution) and contested (for outsiders or revisionists). It exists as social force and does not exist as a single natural kind — both at once.`,
    "syat-avaktavya": `${s} strains language because it names an edge — value, ultimacy, inwardness — that resists complete definition. We circle ${a.subject} with parables and negations (neti neti) precisely because direct description breaks.`,
    "syat-asti-avaktavya": `Lived commitment to ${s} is real (martyrs, saints, reformers testify), yet what ${a.subject} fully is remains partly beyond articulation — like pointing at the moon while arguing about the finger.`,
    "syat-nasti-avaktavya": `Denying or dissolving ${s} (as illusion, ideology, or category mistake) has traction in some philosophies, but the negation itself is slippery — what exactly are we saying is “not” when we negate ${a.subject}?`,
    "syat-asti-nasti-avaktavya": `All three modes converge on ${s}: it moves history (asti), fractures under analysis (nāsti), and withdraws from final definition (avaktavya). That triad is the honest report on ${a.subject}, not evasion.`,
  };
  return map[id];
}

function phraseClassical(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `Literally or idiomatically, ${s} picks out something real — a referent, a situation, or a shared cultural reading. In the frame where the phrase is used sincerely, it is true: the words do work in that context.`,
    "syat-nasti": `Switch the frame and ${s} fails: taken only literally when meant figuratively (or vice versa), applied to the wrong domain, or uttered where the situation does not obtain — in that respect it is not.`,
    "syat-asti-nasti": `${s} is both apt and misleading — a metaphor that reveals and conceals. It is true as rhetorical compression and false as exhaustive description; Syādvāda holds both without forcing a single reading.`,
    "syat-avaktavya": `The felt sense behind ${s} — irony, pain, humor, taboo — often exceeds what the words alone carry. Listeners “get it” without full propositional capture; ${a.subject} is partly ineffable.`,
    "syat-asti-avaktavya": `${s} names a situation you recognize in the body before you can defend it in argument — it is, yet the full why of its aptness resists tidy analysis.`,
    "syat-nasti-avaktavya": `Rejecting ${s} as cliché or wrong still leaves a shadow — what the phrase was trying to name remains uncomfortably present but hard to say without the original wording.`,
    "syat-asti-nasti-avaktavya": `${s} sits at the intersection: meaningful (asti), inadequate (nāsti), and resistant to final paraphrase (avaktavya). That is the phrase’s native habitat.`,
  };
  return map[id];
}

function claimClassical(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `In a defensible context — specific evidence, bounded scope, favorable assumptions — ${s} holds. Name the respect: which population, timeframe, or criterion makes the claim true when it is true.`,
    "syat-nasti": `Under other conditions ${s} breaks: counterexamples, edge cases, hidden premises, or a shift in scale/time. Where exactly does the claim stop applying? That limit is the nāsti respect.`,
    "syat-asti-nasti": `${s} is partially true and partially false at once — true for subgroup A, false for B; true short-term, false long-term; true rhetorically, false literally. Multiplicity is not contradiction if respects are named.`,
    "syat-avaktavya": `${s} may sit on concepts (justice, consciousness, “all jobs”) that lack sharp boundaries — the claim’s key terms are themselves contested, so full verification or falsification escapes clean speech.`,
    "syat-asti-avaktavya": `Something in ${s} matches experience or data (asti), but the mechanism, magnitude, or moral weight remains under-described — we affirm the direction while admitting the model is incomplete.`,
    "syat-nasti-avaktavya": `The failure mode of ${s} is felt (harm, absurdity, mismatch with lived reality) before it is proven — negation has weight even when the refutation is hard to formalize.`,
    "syat-asti-nasti-avaktavya": `${s} draws a crowd of yes, no, and “it depends” — plus a residue of what the claim meant emotionally before logic pinned it down. All seven modes are honest responses to polarizing theses.`,
  };
  return map[id];
}

function conceptStakeholder(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `Zoologists, keepers, and communities who live alongside ${a.subject} stake their expertise on its reality — conservation budgets, safety protocols, and sacred symbolism all treat ${s} as undeniably present in their world.`,
    "syat-nasti": `Animal-rights critics, eliminative materialists, or supply-chain reformers push back: ${s} as property, as spectacle, or as folk category “is not” the same being they defend — the label hides harms or false unity.`,
    "syat-asti-nasti": `Indigenous guardians and urban developers may both invoke ${a.subject} — one as kin/ecosystem anchor, one as obstacle or asset — same word, incompatible operational truths coexisting.`,
    "syat-avaktavya": `Visitors who wept at seeing ${a.subject} struggle to translate that awe into policy language — the stakeholder testimony is real, the vocabulary is not.`,
    "syat-asti-avaktavya": `Tourism boards count ${a.subject} as revenue (asti) while ethicists admit they cannot fully model its welfare in human economic terms (avaktavya).`,
    "syat-nasti-avaktavya": `Workers who never see ${a.subject} yet suffer its supply chain’s costs sense its “not” without clear metrics — harm without a clean ledger line.`,
    "syat-asti-nasti-avaktavya": `Public hearings on ${a.subject} split scientists, poets, and regulators — each stakeholder slice affirms, denies, or throws up hands at what cannot yet be said.`,
  };
  return map[id];
}

function abstractStakeholder(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `Judges, priests, activists, and therapists operationalize ${s} daily — for them ${a.subject} is not abstract décor but a criterion that decides cases, rites, and interventions.`,
    "syat-nasti": `Skeptics, cynics, and harmed parties say ${s} is a mask — power dressed as principle — and in their lived experience ${a.subject} “is not” what elites claim.`,
    "syat-asti-nasti": `Reformers insist ${s} is real but currently betrayed; traditionalists insist it is real and already embodied — same term, opposite diagnoses, both socially operative.`,
    "syat-avaktavya": `Mystics and artists report ${a.subject} in ways committees cannot agenda — stakeholder truth arrives as song, silence, or protest sign without full manifesto.`,
    "syat-asti-avaktavya": `Donors fund ${s} (asti) while beneficiaries say the funded programs miss the lived texture of ${a.subject} (avaktavya).`,
    "syat-nasti-avaktavya": `Those excluded by ${s}-talk feel its absence viscerally — the concept fails them — yet naming that failure feels inadequate to the wound.`,
    "syat-asti-nasti-avaktavya": `Town halls on ${a.subject} mirror the seven-fold split: believers, deniers, and people who say the question itself is broken.`,
  };
  return map[id];
}

function phraseStakeholder(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `In the room where ${s} is uttered, insiders nod — the phrase names a shared pain, joke, or strategy they already feel; for that coalition it lands as true.`,
    "syat-nasti": `Outsiders or literalists hear ${s} and say “that is not what is happening” — different discourse community, different truth value for the same words.`,
    "syat-asti-nasti": `PR teams and whistleblowers may use identical wording about ${a.subject} — one to pacify, one to alarm — both deploying ${s}, neither owning the whole story.`,
    "syat-avaktavya": `HR and therapists hear ${s} and know something serious was signaled that the phrase alone cannot document for compliance.`,
    "syat-asti-avaktavya": `Leadership cites ${s} as vision (asti) while frontline staff feel the reality behind it without language that would survive a board deck.`,
    "syat-nasti-avaktavya": `Calling out ${s} as empty talk still leaves staff carrying the unnamed weight the phrase was pointing at.`,
    "syat-asti-nasti-avaktavya": `Slack threads about ${s} oscillate between “exactly,” “not really,” and “I can’t explain it but you know” — stakeholder pluralism in miniature.`,
  };
  return map[id];
}

function claimStakeholder(id: PerspectiveId, a: InputAnalysis): string {
  const s = q(a.subject);
  const map: Record<PerspectiveId, string> = {
    "syat-asti": `Advocates of ${s} bring datasets, case studies, and testimony showing where the claim delivers — for their constituency, in their timeframe, it is.`,
    "syat-nasti": `Opposing stakeholders document where ${s} fails them — layoffs, ecological damage, broken promises — and for that group the claim is not.`,
    "syat-asti-nasti": `Board members may believe ${s} for shareholders and reject it for workers in the same quarter — split incentives make asti and nāsti simultaneous inside one org.`,
    "syat-avaktavya": `Regulators pause on ${s} because key terms lack agreed measurement — policy cannot yet describe what would count as proof or refutation.`,
    "syat-asti-avaktavya": `Early adopters report wins from ${s} while downstream communities face impacts no one can fully model yet.`,
    "syat-nasti-avaktavya": `Frontline harm from ${s} shows up in burnout and attrition before it appears in the metrics that would officially falsify the claim.`,
    "syat-asti-nasti-avaktavya": `Public debate on ${s} stacks experts, victims, and agnostics — civic discourse itself becomes a live Saptabhaṅgī tableau.`,
  };
  return map[id];
}

export function buildPerspectiveCopy(
  id: PerspectiveId,
  analysis: InputAnalysis,
): PerspectiveCopy {
  const { kind, isConcrete } = analysis;

  let classical: string;
  if (kind === "claim") classical = claimClassical(id, analysis);
  else if (kind === "phrase") classical = phraseClassical(id, analysis);
  else if (isConcrete) classical = conceptClassical(id, analysis);
  else classical = abstractClassical(id, analysis);

  let stakeholder: string;
  if (kind === "claim") stakeholder = claimStakeholder(id, analysis);
  else if (kind === "phrase") stakeholder = phraseStakeholder(id, analysis);
  else if (isConcrete) stakeholder = conceptStakeholder(id, analysis);
  else stakeholder = abstractStakeholder(id, analysis);

  return { classical, stakeholder };
}
