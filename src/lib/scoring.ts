import type { CriterionKey, Location, Weights } from "./data";

export interface ScoreResult {
  score: number;
  usedWeight: number;
  totalWeight: number;
  missing: CriterionKey[];
  confidence: number; // 0..1 share of weight backed by data
  contributions: { key: CriterionKey; score: number; weight: number; contribution: number }[];
}

/** Normalise weights to percentages summing to 100 (proportional rule). */
export function normaliseWeights(w: Weights): Weights {
  const total = Object.values(w).reduce((a, b) => a + (b ?? 0), 0);
  if (total <= 0) return {};
  const out: Weights = {};
  for (const [k, v] of Object.entries(w)) out[k as CriterionKey] = ((v ?? 0) / total) * 100;
  return out;
}

/**
 * Final = Σ(score × weight) / Σ weight, over criteria with data.
 * Missing criteria are excluded (transparent renormalisation), never treated as zero.
 */
export function scoreLocation(loc: Location, weights: Weights): ScoreResult {
  let num = 0, used = 0, total = 0;
  const missing: CriterionKey[] = [];
  const contributions: ScoreResult["contributions"] = [];
  for (const [k, w] of Object.entries(weights) as [CriterionKey, number][]) {
    if (!w) continue;
    total += w;
    const s = loc.scores[k];
    if (s === null || s === undefined) { missing.push(k); continue; }
    num += s * w; used += w;
    contributions.push({ key: k, score: s, weight: w, contribution: s * w });
  }
  const score = used > 0 ? num / used : 0;
  for (const c of contributions) c.contribution = c.contribution / (used || 1);
  return { score, usedWeight: used, totalWeight: total, missing, confidence: total ? used / total : 0, contributions };
}

export function rankLocations(locs: Location[], weights: Weights) {
  return locs
    .map((l) => ({ loc: l, ...scoreLocation(l, weights) }))
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
