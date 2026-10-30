import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { LOCATIONS, type Category } from "@/lib/data";
import { useRanking } from "@/lib/useRanking";
import { useApp } from "@/lib/store";
import { CAT_LABEL, DemoTag, Panel, Bar } from "@/components/Shell";
import { scoreLocation } from "@/lib/scoring";
import { MISSIONS } from "@/lib/data";
import { meta } from "@/lib/meta";

const Globe = lazy(() => import("@/components/Globe"));

export const Route = createFileRoute("/explorer")({
  ssr: false,
  head: () => meta("3D Analogue Explorer", "Interactive 3D globe of Earth's best Moon and Mars analogue sites."),
  component: Explorer,
});

function Explorer() {
  const [sel, setSel] = useState<string | null>(null);
  const [cat, setCat] = useState<Category | "all">("all");
  const [country, setCountry] = useState("all");
  const [view, setView] = useState<"3d" | "2d">("3d");
  const [q, setQ] = useState("");
  const { ranked } = useRanking();
  const { compare, toggleCompare } = useApp();
  const countries = [...new Set(LOCATIONS.map((l) => l.country))].sort();
  const list = useMemo(() => LOCATIONS.filter((l) => (cat === "all" || l.category === cat) && (country === "all" || l.country === country) && (l.name + l.geology + l.terrain).toLowerCase().includes(q.toLowerCase())), [cat, country, q]);
  const loc = LOCATIONS.find((l) => l.id === sel);
  const rank = ranked.find((r) => r.loc.id === sel);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr_340px]">
      <Panel title="Filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, rock, terrain…" className="mb-3 w-full rounded-md border bg-secondary/50 px-3 py-2 text-sm" />
        <div className="label-caps mb-1">Suitability</div>
        <select value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className="mb-3 w-full rounded-md border bg-secondary px-2 py-2 text-sm">
          <option value="all">All</option>{Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="label-caps mb-1">Country</div>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="mb-4 w-full rounded-md border bg-secondary px-2 py-2 text-sm">
          <option value="all">All</option>{countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="max-h-[50vh] space-y-1 overflow-auto">
          {list.map((l) => (
            <button key={l.id} onClick={() => setSel(l.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary ${sel === l.id ? "bg-secondary text-primary" : ""}`}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: `var(--color-${l.category})` }} />{l.name}
            </button>
          ))}
        </div>
      </Panel>

      <div className="glass relative h-[75vh] overflow-hidden">
        <div className="absolute right-3 top-3 z-10 flex rounded-full border bg-background/70 p-1 text-xs">
          {(["3d", "2d"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1 ${view === v ? "bg-primary text-primary-foreground" : ""}`}>{v.toUpperCase()}</button>)}
        </div>
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-3 text-xs">
          {Object.entries(CAT_LABEL).map(([k, v]) => <span key={k} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: `var(--color-${k})` }} />{v}</span>)}
        </div>
        {view === "3d" ? (
          <Suspense fallback={<div className="grid h-full place-items-center text-muted-foreground">Loading globe…</div>}>
            <Globe locations={list} selected={sel} onSelect={setSel} autoRotate={!sel} />
          </Suspense>
        ) : (
          <div className="relative h-full w-full bg-[url(https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg)] bg-contain bg-center bg-no-repeat">
            <div className="absolute left-1/2 top-1/2 aspect-[2/1] w-full max-h-full -translate-x-1/2 -translate-y-1/2">
              {list.map((l) => (
                <button key={l.id} title={l.name} onClick={() => setSel(l.id)} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
                  style={{ left: `${((l.lon + 180) / 360) * 100}%`, top: `${((90 - l.lat) / 180) * 100}%`, background: `var(--color-${l.category})` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Panel title="Location intelligence" action={loc ? <DemoTag /> : null}>
        {!loc ? <p className="text-sm text-muted-foreground">Select a marker on the globe or a site from the list.</p> : (
          <div className="space-y-4 text-sm">
            <div>
              <h2 className="text-xl font-bold">{loc.name}</h2>
              <div className="text-muted-foreground">{loc.country} · {CAT_LABEL[loc.category]}</div>
              <div className="mt-1 font-mono text-xs">{loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}° · ~{loc.elevation} m <span className="text-muted-foreground">(approx., SRTM processing required)</span></div>
            </div>
            {[["Terrain", loc.terrain], ["Geology", loc.geology], ["Environment", loc.environment], ["Resources", loc.resources], ["Scientific relevance", loc.relevance]].map(([k, v]) => (
              <div key={k}><div className="label-caps">{k}</div><div>{v}</div></div>
            ))}
            <div className="space-y-2">
              {(Object.keys(MISSIONS) as (keyof typeof MISSIONS)[]).map((m) => {
                const s = scoreLocation(loc, MISSIONS[m].weights).score;
                return <div key={m}><div className="flex justify-between text-xs"><span>{MISSIONS[m].short} suitability</span><span className="font-mono">{s.toFixed(1)}</span></div><Bar value={s} tone={MISSIONS[m].color} /></div>;
              })}
            </div>
            {rank && <div className="text-xs text-muted-foreground">Rank #{rank.rank} for current mission.</div>}
            <div className="flex gap-2">
              <Link to="/location/$id" params={{ id: loc.id }} className="flex-1 rounded-full bg-primary py-2 text-center text-xs font-semibold text-primary-foreground">Full report</Link>
              <button onClick={() => toggleCompare(loc.id)} className="flex-1 rounded-full border py-2 text-xs">{compare.includes(loc.id) ? "Remove from compare" : "Add to compare"}</button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
