import { createFileRoute, Link } from "@tanstack/react-router";
import { CRITERIA, MISSIONS, type MissionId } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Bar, PageHead } from "@/components/Shell";
import { rankLocations } from "@/lib/scoring";
import { LOCATIONS } from "@/lib/data";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/missions")({
  head: () => meta("Mission Scenarios", "Choose a Lunar, Martian or Emergency mission to re-rank every analogue site."),
  component: Missions,
});

function Missions() {
  const { mission, setMission } = useApp();
  return (
    <>
      <PageHead kicker="Mission scenario selector" title="What are we preparing for?" sub="Selecting a scenario changes the weights used everywhere in the app. These are initial model weights, not official NASA standards — administrators can change them." />
      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(MISSIONS) as MissionId[]).map((id) => {
          const m = MISSIONS[id];
          const top = rankLocations(LOCATIONS, m.weights)[0]!;
          return (
            <div key={id} className={`glass flex flex-col p-6 ${mission === id ? "ring-2 ring-primary" : ""}`}>
              <div className="label-caps" style={{ color: `var(--color-${m.color})` }}>Scenario {id === "lunar" ? "A" : id === "mars" ? "B" : "C"}</div>
              <h2 className="mt-1 text-xl font-bold">{m.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{m.objective}</p>
              <div className="mt-5 space-y-2">
                {Object.entries(m.weights).map(([k, w]) => (
                  <div key={k}><div className="flex justify-between text-xs"><span>{CRITERIA.find((c) => c.key === k)?.label}</span><span className="font-mono">{w}%</span></div><Bar value={(w ?? 0) * 4} tone={m.color} /></div>
                ))}
              </div>
              <div className="mt-5 text-sm">Leading site: <span className="text-primary">{top.loc.name}</span> <span className="font-mono">({top.score.toFixed(1)})</span></div>
              <div className="mt-auto flex gap-2 pt-6">
                <button onClick={() => setMission(id)} className={`flex-1 rounded-full py-2 text-sm font-semibold ${mission === id ? "bg-primary text-primary-foreground" : "border"}`}>{mission === id ? "Active" : "Activate"}</button>
                <Link to="/ranking" onClick={() => setMission(id)} className="flex-1 rounded-full border py-2 text-center text-sm">View ranking</Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
