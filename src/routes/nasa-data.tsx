import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DATASETS, LOCATIONS } from "@/lib/data";
import { fetchPower, type PowerData } from "@/lib/power";
import { useApp } from "@/lib/store";
import { PageHead, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/nasa-data")({
  head: () => meta("NASA Data Centre", "Status and provenance of every NASA Earth, Moon and Mars dataset used."),
  component: NasaData,
});

const TONE: Record<string, string> = { CONNECTED: "multi", AVAILABLE: "lunar", "AUTHENTICATION REQUIRED": "violet", "PROCESSING REQUIRED": "mars", UNAVAILABLE: "destructive", LIVE: "primary" };

function NasaData() {
  const log = useApp((s) => s.log);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [obs, setObs] = useState<{ id: string; d: PowerData }[]>([]);
  const [err, setErr] = useState("");
  const retrieve = async () => {
    setState("loading"); setErr("");
    try {
      const out = [];
      for (const l of LOCATIONS.slice(0, 6)) out.push({ id: l.id, d: await fetchPower(l.lat, l.lon) });
      setObs(out); setState("ok"); log("Retrieved NASA POWER climatology for 6 sites");
    } catch (e) { setState("err"); setErr(String(e)); }
  };
  const status = (s: string) => (s === "LIVE" ? (state === "ok" ? "CONNECTED" : state === "err" ? "UNAVAILABLE" : "AVAILABLE") : s);

  return (
    <>
      <PageHead kicker="NASA data centre" title="Data provenance" sub="CONNECTED is shown only after a successful retrieval in this session. Archive products show their honest processing status." />
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(TONE).filter(([k]) => k !== "LIVE").map(([k, t]) => <span key={k} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: `var(--color-${t})` }} />{k}</span>)}
      </div>
      {(["Earth", "Moon", "Mars"] as const).map((g) => (
        <div key={g} className="mb-6">
          <h2 className="label-caps mb-3">{g === "Earth" ? "Earth observation data" : `Planetary data · ${g}`}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {DATASETS.filter((d) => d.group === g).map((d) => {
              const s = status(d.status);
              return (
                <div key={d.name} className="glass p-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="font-display font-bold">{d.name}</div><div className="text-xs text-muted-foreground">{d.mission} · {d.instrument}</div></div>
                    <span className="rounded px-1.5 py-0.5 font-mono text-[0.6rem]" style={{ color: `var(--color-${TONE[s]})`, border: `1px solid var(--color-${TONE[s]})` }}>{s}</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{d.desc}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <dt className="text-muted-foreground">Product</dt><dd className="font-mono">{d.id}</dd>
                    <dt className="text-muted-foreground">Archive</dt><dd>{d.archive}</dd>
                    <dt className="text-muted-foreground">Resolution</dt><dd>{d.res}</dd>
                    <dt className="text-muted-foreground">Period</dt><dd>{d.period}</dd>
                    <dt className="text-muted-foreground">Last retrieval</dt><dd>{d.status === "LIVE" && state === "ok" ? new Date(obs[0]!.d.retrieved).toLocaleTimeString() : "—"}</dd>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <a href={d.url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1 hover:bg-secondary">View original dataset ↗</a>
                    {d.status === "LIVE" && <button onClick={retrieve} disabled={state === "loading"} className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground">{state === "loading" ? "Retrieving…" : "Retrieve data"}</button>}
                  </div>
                  {d.status === "LIVE" && err && <div className="mt-2 text-xs text-destructive">{err}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {obs.length > 0 && (
        <Panel title="Observations · NASA POWER climatology (annual mean, live)">
          <table className="w-full text-sm"><thead className="label-caps text-left"><tr><th className="pb-2">Site</th><th>Solar (kWh/m²/day)</th><th>Air temp 2 m (°C)</th><th>Precip (mm/day)</th></tr></thead>
            <tbody>{obs.map((o) => <tr key={o.id} className="border-t"><td className="py-2">{LOCATIONS.find((l) => l.id === o.id)!.name}</td><td className="font-mono">{o.d.solar.toFixed(2)}</td><td className="font-mono">{o.d.t2m.toFixed(1)}</td><td className="font-mono">{o.d.precip.toFixed(2)}</td></tr>)}</tbody></table>
        </Panel>
      )}
    </>
  );
}
