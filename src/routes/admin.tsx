import { createFileRoute } from "@tanstack/react-router";
import { CRITERIA, LOCATIONS, MISSIONS, type MissionId } from "@/lib/data";
import { useApp } from "@/lib/store";
import { PageHead, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/admin")({
  head: () => meta("Administration", "Manage mission default weights and review the location catalogue."),
  component: Admin,
});

function Admin() {
  const { weights, setDefaultWeights, log } = useApp();
  return (
    <>
      <PageHead kicker="Administration" title="Model configuration" sub="Edit the stored weights for each mission (saved in this browser). Sign-in and shared storage are not enabled in this build." />
      <div className="grid gap-4 xl:grid-cols-3">
        {(Object.keys(MISSIONS) as MissionId[]).map((m) => (
          <Panel key={m} title={MISSIONS[m].name} action={<button className="text-xs text-primary" onClick={() => { setDefaultWeights(m, { ...MISSIONS[m].weights }); log(`Admin reset ${MISSIONS[m].short} weights`); }}>Restore</button>}>
            {CRITERIA.map((c) => (
              <label key={c.key} className="flex items-center justify-between border-t py-1.5 text-sm">
                {c.label}
                <input type="number" min={0} max={100} value={weights[m][c.key] ?? 0} onChange={(e) => setDefaultWeights(m, { ...weights[m], [c.key]: Math.max(0, +e.target.value) })} className="w-16 rounded border bg-secondary px-2 py-0.5 text-right font-mono" />
              </label>
            ))}
          </Panel>
        ))}
      </div>
      <Panel title={`Location catalogue (${LOCATIONS.length})`} className="mt-4">
        <table className="w-full text-sm"><thead className="label-caps text-left"><tr><th className="pb-2">ID</th><th>Name</th><th>Country</th><th>Coordinates</th><th>Missing fields</th></tr></thead>
          <tbody>{LOCATIONS.map((l) => <tr key={l.id} className="border-t"><td className="py-1.5 font-mono text-xs">{l.id}</td><td>{l.name}</td><td>{l.country}</td><td className="font-mono text-xs">{l.lat}, {l.lon}</td><td className="text-xs text-mars">{CRITERIA.filter((c) => l.scores[c.key] == null).map((c) => c.label).join(", ") || "—"}</td></tr>)}</tbody></table>
      </Panel>
    </>
  );
}
