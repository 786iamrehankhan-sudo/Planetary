import { describe, expect, it } from "vitest";
import { normaliseWeights, scoreLocation } from "./scoring";
import { LOCATIONS, MISSIONS, type Location } from "./data";

const base = LOCATIONS[0]!;
const loc = (scores: Location["scores"]): Location => ({ ...base, scores });

describe("scoring", () => {
  it("final score is Σ(score×weight)/Σweight", () => {
    expect(scoreLocation(loc({ terrain: 80, geology: 40 }), { terrain: 30, geology: 10 }).score).toBe(70);
  });
  it("missing data is excluded, not zero, and lowers confidence", () => {
    const r = scoreLocation(loc({ terrain: 80, water: null }), { terrain: 50, water: 50 });
    expect(r.score).toBe(80);
    expect(r.missing).toEqual(["water"]);
    expect(r.confidence).toBe(0.5);
  });
  it("weights normalise to 100%", () => {
    const n = normaliseWeights({ terrain: 10, geology: 30 });
    expect(n.terrain).toBe(25);
    expect(n.geology).toBe(75);
  });
  it("mission default weights sum to 100", () => {
    for (const m of Object.values(MISSIONS))
      expect(Object.values(m.weights).reduce((a, b) => a + (b ?? 0), 0)).toBe(100);
  });
});
