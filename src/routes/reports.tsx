import { createFileRoute } from "@tanstack/react-router";
import { CRITERIA, MISSIONS } from "@/lib/data";
import { useRanking } from "@/lib/useRanking";
import { normaliseWeights } from "@/lib/scoring";
import { useApp } from "@/lib/store";
import { DemoTag, PageHead, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/reports")({
  head: () => meta("Mission Reports", "Generate and export a site-selection report for the active mission."),
  component: Reports,
});

function Reports() {
  const { mission, weights, ranked } = useRanking();
  const log = useApp((s) => s.log);
  const norm = normaliseWeights(weights);
  const csv = () => {
    const rows = [["rank", "location", "country", "score", "confidence", ...CRITERIA.map((c) => c.key)], ...ranked.map((r) => [r.rank, r.loc.name, r.loc.country, r.score.toFixed(2), r.confidence.toFixed(2), ...CRITERIA.map((c) => r.loc.scores[c.key] ?? "NA")])];
    const blob = new Blob([rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `analogue-report-${mission}.csv`; a.click();
    log(`Exported ${MISSIONS[mission].name} report (CSV)`);
  };
  return (
    <>
      <PageHead kicker="Mission reports" title={`${MISSIONS[mission].name} — site selection report`} />
      <div className="mb-4 flex gap-2 print:hidden">
        <button onClick={() => { log("Printed mission report"); window.print(); }} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Print / Save PDF</button>
        <button onClick={csv} className="rounded-full border px-4 py-2 text-sm">Export CSV</button>
      </div>
      <Panel title="Summary" action={<DemoTag />}>
        <p className="text-sm">{MISSIONS[mission].objective} Using the weights below, <b>{ranked[0]!.loc.name}</b> ranks first with a score of <b>{ranked[0]!.score.toFixed(1)}</b>, ahead of {ranked[1]!.loc.name} ({ranked[1]!.score.toFixed(1)}) and {ranked[2]!.loc.name} ({ranked[2]!.score.toFixed(1)}).</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">{Object.entries(norm).filter(([, v]) => v).map(([k, v]) => <span key={k} className="rounded-full border px-2 py-1">{CRITERIA.find((c) => c.key === k)?.label}: {v!.toFixed(1)}%</span>)}</div>
      </Panel>
      <Panel title="Full ranking" className="mt-4">
        <table className="w-full text-sm"><thead className="label-caps text-left"><tr><th className="pb-2">#</th><th>Location</th><th>Score</th><th>Confidence</th><th>Key limitation</th></tr></thead>
          <tbody>{ranked.map((r) => <tr key={r.loc.id} className="border-t"><td className="py-2 font-mono">{r.rank}</td><td>{r.loc.name}, {r.loc.country}</td><td className="font-mono">{r.score.toFixed(1)}</td><td className="font-mono">{(r.confidence * 100).toFixed(0)}%</td><td className="text-xs text-muted-foreground">{r.loc.limitations[0]}</td></tr>)}</tbody></table>
      </Panel>
    </>
  );
}
