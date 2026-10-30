import { useMemo } from "react";
import { LOCATIONS, MISSIONS } from "./data";
import { rankLocations } from "./scoring";
import { useApp } from "./store";

export function useRanking() {
  const mission = useApp((s) => s.mission);
  const weights = useApp((s) => s.weights[s.mission]);
  const ranked = useMemo(() => rankLocations(LOCATIONS, weights), [weights]);
  const baseline = useMemo(() => rankLocations(LOCATIONS, MISSIONS[mission].weights), [mission]);
  return { mission, weights, ranked, baseline };
}
