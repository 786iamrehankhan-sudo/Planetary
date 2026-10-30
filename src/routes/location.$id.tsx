import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CRITERIA, LOCATIONS, MISSIONS } from "@/lib/data";
import { fetchPower, type PowerData } from "@/lib/power";
import { scoreLocation } from "@/lib/scoring";
import { Bar, CAT_LABEL, DemoTag, PageHead, Panel } from "@/components/Shell";

export const Route = createFileRoute("/location/$id")({
  loader: ({ params }) => { const l = LOCATIONS.find((x) => x.id === params.id); if (!l) throw notFound(); return l; },
  head: ({ loaderData }) => {
    const t = `${loaderData?.name ?? "Location"} · Planetary Analogue Explorer`;
    const d = `Analogue research profile for ${loaderData?.name}, ${loaderData?.country}.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: LocationPage,
});

function LocationPage() {
  const l = Route.useLoaderData();
  const [p, setP] = useState<PowerData | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { setP(null); setErr(false); fetchPower(l.lat, l.lon).then(setP).catch(() => setErr(true)); }, [l]);

  return (
    <>
      <Link to="/explorer" className="text-sm text-primary">← Back to explorer</Link>
      <PageHead kicker={`${CAT_LABEL[l.category]} · ${l.country}`} title={l.name} sub={l.relevance} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Geographic information">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Latitude</dt><dd className="font-mono">{l.lat}°</dd>
            <dt className="text-muted-foreground">Longitude</dt><dd className="font-mono">{l.lon}°</dd>
            <dt className="text-muted-foreground">Elevation</dt><dd className="font-mono">~{l.elevation} m</dd>
          </dl>
          <p className="mt-2 text-xs text-mars">Elevation is an approximate literature value; SRTM processing required.</p>
        </Panel>
        <Panel title="Solar & climate · NASA POWER (live)">
          {err ? <p className="text-sm text-destructive">NASA POWER could not be reached — DATA NOT AVAILABLE.</p> : !p ? <p className="text-sm text-muted-foreground">Retrieving from power.larc.nasa.gov…</p> : (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Solar (all-sky)</dt><dd className="font-mono">{p.solar.toFixed(2)} kWh/m²/day</dd>
              <dt className="text-muted-foreground">Air temp 2 m</dt><dd className="font-mono">{p.t2m.toFixed(1)} °C</dd>
              <dt className="text-muted-foreground">Precipitation</dt><dd className="font-mono">{p.precip.toFixed(2)} mm/day</dd>
              <dt className="col-span-2 text-xs text-muted-foreground">Annual climatology · retrieved {new Date(p.retrieved).toLocaleString()}</dt>
            </dl>
          )}
        </Panel>
        <Panel title="Mission suitability" action={<DemoTag />}>
          {(Object.keys(MISSIONS) as (keyof typeof MISSIONS)[]).map((m) => {
            const s = scoreLocation(l, MISSIONS[m].weights);
            return <div key={m} className="mb-3"><div className="flex justify-between text-sm"><span>{MISSIONS[m].name}</span><span className="font-mono">{s.score.toFixed(1)}</span></div><Bar value={s.score} tone={MISSIONS[m].color} /></div>;
          })}
        </Panel>
        {[["Terrain analysis", l.terrain], ["Geological analysis", l.geology], ["Environmental analysis", l.environment], ["Resource assessment", l.resources], ["Temperature analysis", "MODIS MOD11A2 day/night land surface temperature — Earthdata authentication required. Not directly comparable with Diviner or THEMIS values."], ["Scientific evidence", l.relevance]].map(([k, v]) => (
          <Panel key={k} title={k ?? ""}><p className="text-sm">{v}</p></Panel>
        ))}
        <Panel title="Advantages"><ul className="space-y-1 text-sm">{l.advantages.map((a) => <li key={a}>✓ {a}</li>)}</ul></Panel>
        <Panel title="Limitations"><ul className="space-y-1 text-sm">{l.limitations.map((a) => <li key={a}>– {a}</li>)}</ul></Panel>
        <Panel title="Data provenance">
          <ul className="space-y-1 text-xs text-muted-foreground">
            {CRITERIA.map((c) => <li key={c.key}><span className="text-foreground">{c.label}</span> ({l.scores[c.key] ?? "N/A"}): {c.source}</li>)}
          </ul>
        </Panel>
      </div>
    </>
  );
}
