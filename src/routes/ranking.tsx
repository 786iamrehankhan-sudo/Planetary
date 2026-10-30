import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { CRITERIA, MISSIONS, type CriterionKey } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useRanking } from "@/lib/useRanking";
import { normaliseWeights } from "@/lib/scoring";
import { Bar, DemoTag, PageHead, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/ranking")({
  head: () => meta("Smart Ranking Engine", "Transparent multi-criteria ranking of planetary analogue sites with adjustable weights."),
  component: Ranking,
});

const lbl = (k: string) => CRITERIA.find((c) => c.key === k)?.label ?? k;

function Ranking() {
  const { mission, weights, ranked, baseline } = useRanking();
  const { setWeight, resetWeights, saveConfig, saved, log } = useApp();
  const [name, setName] = useState("");
  const norm = normaliseWeights(weights);
  const first = ranked[0]!;
  const strong = [...first.contributions].sort((a, b) => b.contribution - a.contribution).slice(0, 3);
  const weak = [...first.contributions].sort((a, b) => a.score - b.score).slice(0, 2);
  const second = ranked[1]!;

  return (
    <>
      <PageHead kicker={`Ranking engine · ${MISSIONS[mission].name}`} title="Transparent site ranking" sub="Final Score = Σ(Criterion Score × Weight) ÷ Σ Weights. Weights are normalised proportionally to 100%. Missing measurements are excluded (never counted as zero) and lower the confidence." />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Panel title="Criterion weights" action={<button onClick={resetWeights} className="text-xs text-primary">Reset defaults</button>}>
          <div className="space-y-4">
            {CRITERIA.map((c) => {
              const raw = weights[c.key] ?? 0;
              return (
                <div key={c.key}>
                  <div className="flex justify-between text-sm"><span>{c.label}</span><span className="font-mono text-primary">{(norm[c.key] ?? 0).toFixed(1)}%</span></div>
                  <input type="range" min={0} max={100} value={raw} onChange={(e) => setWeight(c.key, +e.target.value)} onMouseUp={() => log(`Adjusted ${c.label} weight`)} className="w-full accent-[var(--color-primary)]" aria-label={c.label} />
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Config name" className="flex-1 rounded-md border bg-secondary/50 px-2 py-1.5 text-sm" />
            <button disabled={!name} onClick={() => { saveConfig(name); setName(""); }} className="rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">Save</button>
          </div>
          {saved.length > 0 && <ul className="mt-3 space-y-1 text-xs text-muted-foreground">{saved.map((s, i) => <li key={i}>{s.name} · {MISSIONS[s.mission].short}</li>)}</ul>}
        </Panel>

        <div className="space-y-4">
          <Panel title="Why this location ranked first" action={<DemoTag />}>
            <h2 className="text-2xl font-bold">{first.loc.name} <span className="font-mono text-primary">{first.score.toFixed(1)}</span></h2>
            <div className="mt-3 grid gap-4 text-sm md:grid-cols-3">
              <div><div className="label-caps mb-1">Strongest contributions</div>{strong.map((s) => <div key={s.key}>{lbl(s.key)} <span className="font-mono text-muted-foreground">+{s.contribution.toFixed(1)} pts</span></div>)}</div>
              <div><div className="label-caps mb-1">Weakest criteria</div>{weak.map((s) => <div key={s.key}>{lbl(s.key)} <span className="font-mono text-muted-foreground">{s.score}/100</span></div>)}</div>
              <div><div className="label-caps mb-1">Lead over #2</div>{second.loc.name}: <span className="font-mono">+{(first.score - second.score).toFixed(1)}</span><div className="text-xs text-muted-foreground">Confidence {(first.confidence * 100).toFixed(0)}% of weight backed by data</div></div>
            </div>
          </Panel>

          <Panel title="Ranking">
            <table className="w-full text-sm">
              <thead className="label-caps text-left"><tr><th className="pb-2">Rank</th><th>Move</th><th>Location</th><th className="w-1/3">Score</th><th>Confidence</th></tr></thead>
              <tbody>
                {ranked.map((r) => {
                  const prev = baseline.find((b) => b.loc.id === r.loc.id)!.rank;
                  const d = prev - r.rank;
                  return (
                    <tr key={r.loc.id} className="border-t">
                      <td className="py-2.5 font-mono text-primary">{r.rank}</td>
                      <td className="text-xs">{d > 0 ? <span className="flex items-center text-multi"><ArrowUp className="h-3 w-3" />{d}</span> : d < 0 ? <span className="flex items-center text-destructive"><ArrowDown className="h-3 w-3" />{-d}</span> : <Minus className="h-3 w-3 text-muted-foreground" />}</td>
                      <td><Link to="/location/$id" params={{ id: r.loc.id }} className="hover:text-primary">{r.loc.name}</Link>
                        {r.missing.length > 0 && <div className="text-xs text-mars">DATA NOT AVAILABLE: {r.missing.map(lbl).join(", ")} — excluded, weight renormalised</div>}</td>
                      <td><div className="flex items-center gap-2"><span className="w-10 font-mono">{r.score.toFixed(1)}</span><Bar value={r.score} /></div></td>
                      <td className="font-mono text-xs">{(r.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">Rank movement compares your current weights to the mission defaults.</p>
          </Panel>

          <Panel title={`Criterion evidence · ${first.loc.name}`}>
            <div className="grid gap-3 md:grid-cols-2">
              {CRITERIA.map((c) => {
                const v = first.loc.scores[c.key as CriterionKey];
                return (
                  <div key={c.key} className="rounded-lg border p-3 text-xs">
                    <div className="flex justify-between text-sm"><span className="font-medium">{c.label}</span><span className="font-mono">{v ?? "N/A"}</span></div>
                    <div className="mt-1 text-muted-foreground">Unit: {c.unit} · Reference: {c.reference}</div>
                    <div className="text-muted-foreground">Normalisation: {c.method}</div>
                    <div className="text-muted-foreground">Source: {c.source}</div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
