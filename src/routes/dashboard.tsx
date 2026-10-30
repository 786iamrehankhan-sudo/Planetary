import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { LOCATIONS, MISSIONS, CRITERIA, type MissionId } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useRanking } from "@/lib/useRanking";
import { DemoTag, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

const Globe = lazy(() => import("@/components/Globe"));

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => meta("Mission Control", "Overview of Earth analogues for permanent Moon bases and Mars settlements."),
  component: Dashboard,
});

const label = (k: string) => CRITERIA.find((c) => c.key === k)?.label ?? k;

function Dashboard() {
  const { ranked, mission } = useRanking();
  const setMission = useApp((s) => s.setMission);
  const activity = useApp((s) => s.activity);
  const stats = [
    ["Analogue locations", LOCATIONS.length],
    ["Lunar candidates", LOCATIONS.filter((l) => l.category === "lunar" || l.category === "multi").length],
    ["Martian candidates", LOCATIONS.filter((l) => l.category === "mars" || l.category === "multi").length],
    ["Under evaluation", LOCATIONS.filter((l) => l.category === "pending").length],
    ["Leading candidate", ranked[0]!.loc.name.split(" (")[0]],
  ];
  return (
    <div className="space-y-8">
      <section className="relative -m-6 h-[78vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0"><Suspense fallback={null}><Globe locations={LOCATIONS} autoRotate showBodies /></Suspense></div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pointer-events-none relative z-10 flex h-full max-w-2xl flex-col justify-center px-10">
          <div className="label-caps text-primary">Earth is the testbed. Space is the frontier.</div>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-6xl"><span className="text-gradient">FIND EARTH'S NEXT FRONTIER.</span></h1>
          <p className="mt-5 text-lg text-muted-foreground">Discover Earth's closest scientific analogues to the Moon and Mars through NASA-powered planetary intelligence, geospatial analysis, and mission-driven site selection.</p>
          <div className="pointer-events-auto mt-8 flex gap-3">
            <Link to="/explorer" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground glow transition hover:opacity-90">EXPLORE ANALOGUES</Link>
            <Link to="/missions" className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-secondary">SELECT MISSION</Link>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="glass p-4"><div className="label-caps">{k}</div><div className="mt-2 font-display text-2xl font-bold">{v}</div></div>
        ))}
      </div>
      <p className="-mt-4 text-xs text-muted-foreground">Counts are computed from the stored catalogue of {LOCATIONS.length} curated sites; criterion scores are demonstration inputs.</p>

      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(MISSIONS) as MissionId[]).map((id) => {
          const m = MISSIONS[id];
          const top = Object.entries(m.weights).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)).slice(0, 3);
          return (
            <motion.div whileHover={{ y: -4 }} key={id} className={`glass p-6 ${mission === id ? "ring-1 ring-primary" : ""}`}>
              <div className="mb-4 h-14 w-14 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, var(--color-${m.color}), transparent 75%)` }} />
              <h3 className="text-lg font-bold uppercase">{m.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.objective}</p>
              <ul className="mt-4 space-y-1 text-sm">{top.map(([k, w]) => <li key={k} className="flex justify-between"><span>{label(k)}</span><span className="font-mono text-muted-foreground">{w}%</span></li>)}</ul>
              <Link to="/ranking" onClick={() => setMission(id)} className="mt-5 inline-block text-sm font-semibold text-primary">Explore mission →</Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={`Top-ranked · ${MISSIONS[mission].name}`} className="lg:col-span-2" action={<DemoTag />}>
          <table className="w-full text-sm">
            <thead className="label-caps text-left"><tr><th className="pb-2">#</th><th>Location</th><th>Score</th><th>Main strength</th><th>Main limitation</th></tr></thead>
            <tbody>
              {ranked.slice(0, 5).map((r) => {
                const sorted = [...r.contributions].sort((a, b) => b.score - a.score);
                return (
                  <tr key={r.loc.id} className="border-t">
                    <td className="py-3 font-mono text-primary">{r.rank}</td>
                    <td><Link to="/location/$id" params={{ id: r.loc.id }} className="font-medium hover:text-primary">{r.loc.name}</Link><div className="text-xs text-muted-foreground">{r.loc.country}</div></td>
                    <td className="font-mono text-lg">{r.score.toFixed(1)}</td>
                    <td className="text-xs">{label(sorted[0]?.key ?? "")}</td>
                    <td className="text-xs text-muted-foreground">{label(sorted.at(-1)?.key ?? "")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <Panel title="Recent analysis">
          {activity.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet. Change a mission, adjust weights or retrieve NASA data and it will appear here.</p> : (
            <ul className="space-y-3 text-sm">{activity.slice(0, 8).map((a) => <li key={a.t}><div>{a.text}</div><div className="font-mono text-xs text-muted-foreground">{new Date(a.t).toLocaleString()}</div></li>)}</ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
