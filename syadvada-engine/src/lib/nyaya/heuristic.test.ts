import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { heuristicAnalyze } from "./heuristic";

/**
 * Golden regression tests for Nyāya validity classification.
 *
 * Bug: the classic hill-smoke-fire inference — the paradigm VALID example in
 * every Nyāya primer (pakṣadharmatā holds: smoke is present on the hill;
 * vyāpti holds: smoke and fire are invariably concomitant, grounded in a
 * kitchen-hearth sapakṣa; no hetvābhāsa applies) — was rated "partially
 * valid." Two independent causes, both fixed in heuristic.ts:
 *
 *  1. rateValidity() counted the system's own reconstruction of an implicit
 *     udāharaṇa/upanaya as "missing," even though supplying the unstated
 *     universal generalization is what pañcāvayava reconstruction IS, not
 *     evidence of a defective argument. Fixed: only pratijñā/hetu (which must
 *     come from the challenger's own text) count toward that penalty.
 *  2. detectFallacies() flagged any single sentence under 40 characters as
 *     "underdeveloped," regardless of whether it actually stated a thesis and
 *     a reason. Fixed: only flags a short sentence with no reason clause at
 *     all.
 *
 * These tests pin the fix and prove genuine defects (asiddha, a vacuous/
 * question-begging hetu, an unpromoted informal fallacy) still do not pass.
 */

describe("Nyāya validity: classic and equivalent smoke-fire inferences", () => {
  it("rates the classic one-line hill-smoke-fire inference as valid", () => {
    const result = heuristicAnalyze("The hill has fire because it has smoke.");
    assert.equal(result.validity, "valid");
    assert.deepEqual(result.fallacies, []);
    assert.equal(result.steps.pratijna.startsWith("[Implicit"), false);
    assert.equal(result.steps.hetu.startsWith("[Implicit"), false);
  });

  it("rates a fuller natural-language equivalent (explicit kitchen example) as valid", () => {
    const result = heuristicAnalyze(
      "There must be fire on that hill because smoke is rising from it. " +
        "This works just like a kitchen hearth, where smoke reliably means fire. " +
        "Given the same pattern here, the hill's smoke points to fire beneath it.",
    );
    assert.equal(result.validity, "valid");
    assert.deepEqual(result.fallacies, []);
  });

  it("does not penalize a reconstructed (unstated) udāharaṇa/upanaya on their own", () => {
    // Terse but logically complete: no explicit "like a kitchen" clause, so the
    // example and application are reconstructed by the system — that alone
    // must not lower validity.
    const result = heuristicAnalyze("The hill has fire because it has smoke.");
    assert.equal(result.steps.udaharana.startsWith("[Implicit"), true);
    assert.equal(result.steps.upanaya.startsWith("[Implicit"), true);
    assert.equal(result.validity, "valid");
  });
});

describe("Nyāya validity: genuine defects still fail", () => {
  it("flags a vacuous, question-begging hetu as invalid (siddhasādhanā)", () => {
    const result = heuristicAnalyze(
      "The hill has fire because everyone knows hills like that have fire.",
    );
    assert.equal(result.validity, "invalid");
    assert.ok(result.fallacies.some((f) => f.includes("siddhasādhanā")));
  });

  it("flags a hetu grounded in a dream/feeling as invalid (asiddha)", () => {
    const result = heuristicAnalyze("The hill has fire because I dreamt it did.");
    assert.equal(result.validity, "invalid");
    assert.ok(result.fallacies.some((f) => f.includes("asiddha")));
  });

  it("does not auto-pass a structurally complete syllogism that commits a real fallacy", () => {
    // All five members are explicit in the text (no reconstruction needed),
    // but the argument commits a false dichotomy — structural completeness
    // must not be enough for "valid".
    const result = heuristicAnalyze(
      "The city must either ban all cars or accept endless pollution, since those are the only two options. " +
        "This is like choosing between two roads at a fork. " +
        "Applying that here, therefore the city must ban all cars.",
    );
    assert.equal(result.steps.udaharana.startsWith("[Implicit"), false);
    assert.equal(result.steps.upanaya.startsWith("[Implicit"), false);
    assert.notEqual(result.validity, "valid");
    assert.ok(result.fallacies.some((f) => f.includes("dvaya-doṣa")));
  });

  it("still flags a bare claim with no reason clause as underdeveloped", () => {
    const result = heuristicAnalyze("Cats are cool.");
    assert.notEqual(result.validity, "valid");
    assert.ok(result.fallacies.some((f) => f.includes("underdeveloped")));
  });

  it("still classifies invalid for an argument riddled with fallacies", () => {
    const result = heuristicAnalyze(
      "Everyone knows this is true because experts say so, and if we allow doubt then chaos will happen.",
    );
    assert.equal(result.validity, "invalid");
  });
});
