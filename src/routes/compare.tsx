import { createFileRoute, Link } from "@tanstack/react-router";
import { CRITERIA, LOCATIONS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useRanking } from "@/lib/useRanking";
import { DemoTag, PageHead, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/compare")({
  head: () => meta("Compare Locations", "Side-by-side criterion comparison of up to four analogue sites."),
  component: Compare,
});

const COLORS = ["primary", "mars", "multi", "violet"];

function Compare() {
  const { compare, toggleCompare } = useApp();
  const { ranked } = useRanking();
  const sel = compare.map((id) => LOCATIONS.find((l) => l.id === id)!).filter(Boolean);
  const N = CRITERIA.length, R = 120, C = 150;
  const pt = (i: number, v: number) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; return [C + Math.cos(a) * R * v / 100, C + Math.sin(a) * R * v / 100]; };

  return (
    <>
      <PageHead kicker="Location comparison" title="Side by side" sub="Pick up to four sites. Missing values are shown as N/A and are not plotted as zero." />
      <div className="mb-4 flex flex-wrap gap-2">
        {LOCATIONS.map((l) => <button key={l.id} onClick={() => toggleCompare(l.id)} className={`rounded-full border px-3 py-1 text-xs ${compare.includes(l.id) ? "border-primary bg-primary/15 text-primary" : ""}`}>{l.name}</button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Panel title="Criterion profile" action={<DemoTag />}>
          <svg viewBox="0 0 300 300" className="w-full">
            {[25, 50, 75, 100].map((r) => <polygon key={r} points={CRITERIA.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="var(--color-border)" />)}
            {sel.map((l, j) => (
              <polygon key={l.id} points={CRITERIA.map((c, i) => pt(i, l.scores[c.key] ?? 0).join(",")).join(" ")} fill={`var(--color-${COLORS[j]})`} fillOpacity={0.12} stroke={`var(--color-${COLORS[j]})`} strokeWidth={1.5} />
            ))}
            {CRITERIA.map((c, i) => { const [x, y] = pt(i, 118); return <text key={c.key} x={x} y={y} fontSize="8" textAnchor="middle" fill="var(--color-muted-foreground)">{c.label.split(" ")[0]}</text>; })}
          </svg>
        </Panel>
        <Panel title="Values">
          {sel.length === 0 ? <p className="text-sm text-muted-foreground">Select sites above.</p> : (
            <table className="w-full text-sm">
              <thead><tr><th className="label-caps pb-2 text-left">Criterion</th>{sel.map((l, j) => <th key={l.id} className="text-left"><Link to="/location/$id" params={{ id: l.id }} style={{ color: `var(--color-${COLORS[j]})` }}>{l.name}</Link></th>)}</tr></thead>
              <tbody>
                {CRITERIA.map((c) => <tr key={c.key} className="border-t"><td className="py-2">{c.label}</td>{sel.map((l) => <td key={l.id} className="font-mono">{l.scores[c.key] ?? <span className="text-mars">N/A</span>}</td>)}</tr>)}
                <tr className="border-t font-semibold"><td className="py-2">Mission score</td>{sel.map((l) => <td key={l.id} className="font-mono text-primary">{ranked.find((r) => r.loc.id === l.id)!.score.toFixed(1)}</td>)}</tr>
                <tr className="border-t"><td className="py-2">Rank</td>{sel.map((l) => <td key={l.id} className="font-mono">#{ranked.find((r) => r.loc.id === l.id)!.rank}</td>)}</tr>
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </>
  );
}
