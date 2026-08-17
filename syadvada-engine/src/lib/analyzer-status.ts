export function warnIfHeuristicFallback(analyzer?: string): void {
  if (analyzer === "heuristic") {
    console.warn("API Key missing: Running local heuristic fallback.");
  }
}
