import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MISSIONS, type MissionId, type Weights } from "./data";

interface Activity { t: number; text: string }
interface State {
  mission: MissionId;
  weights: Record<MissionId, Weights>;
  saved: { name: string; mission: MissionId; weights: Weights }[];
  compare: string[];
  activity: Activity[];
  setMission: (m: MissionId) => void;
  setWeight: (k: string, v: number) => void;
  resetWeights: () => void;
  setDefaultWeights: (m: MissionId, w: Weights) => void;
  saveConfig: (name: string) => void;
  toggleCompare: (id: string) => void;
  log: (text: string) => void;
}

const defaults = () => ({
  lunar: { ...MISSIONS.lunar.weights }, mars: { ...MISSIONS.mars.weights }, emergency: { ...MISSIONS.emergency.weights },
});

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      mission: "lunar",
      weights: defaults(),
      saved: [],
      compare: ["atacama", "devon"],
      activity: [],
      setMission: (m) => { set({ mission: m }); get().log(`Mission switched to ${MISSIONS[m].name}`); },
      setWeight: (k, v) => set((s) => ({ weights: { ...s.weights, [s.mission]: { ...s.weights[s.mission], [k]: v } } })),
      resetWeights: () => set((s) => ({ weights: { ...s.weights, [s.mission]: { ...MISSIONS[s.mission].weights } } })),
      setDefaultWeights: (m, w) => set((s) => ({ weights: { ...s.weights, [m]: w } })),
      saveConfig: (name) => { set((s) => ({ saved: [{ name, mission: s.mission, weights: s.weights[s.mission] }, ...s.saved].slice(0, 10) })); get().log(`Saved weight configuration “${name}”`); },
      toggleCompare: (id) => set((s) => ({ compare: s.compare.includes(id) ? s.compare.filter((x) => x !== id) : [...s.compare, id].slice(-4) })),
      log: (text) => set((s) => ({ activity: [{ t: Date.now(), text }, ...s.activity].slice(0, 30) })),
    }),
    { name: "pae-state", skipHydration: true },
  ),
);
