import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel } from "@/components/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/science")({
  head: () => meta("Scientific Intelligence Centre", "Methodology, comparison rules and limitations behind the analogue scoring model."),
  component: Science,
});

const REF = [
  ["Gravity", "9.81 m/s²", "1.62 m/s²", "3.71 m/s²"],
  ["Surface pressure", "101.3 kPa", "~3×10⁻¹⁵ kPa", "~0.6 kPa"],
  ["Mean surface temp.", "~15 °C", "−173 to +127 °C (equator, Diviner)", "~−63 °C"],
  ["Solar constant", "1361 W/m²", "~1361 W/m²", "~586 W/m²"],
  ["Day length", "24 h", "~29.5 Earth days", "24.6 h"],
  ["Atmosphere", "N₂/O₂", "Exosphere", "95% CO₂"],
];

function Science() {
  return (
    <>
      <PageHead kicker="Scientific intelligence centre" title="How the comparison works" sub="NASA is the data provider. This platform performs the Earth-to-planet comparison and calculates suitability scores." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Reference bodies (NASA fact sheets)">
          <table className="w-full text-sm"><thead className="label-caps text-left"><tr><th className="pb-2">Property</th><th>Earth</th><th>Moon</th><th>Mars</th></tr></thead>
            <tbody>{REF.map((r) => <tr key={r[0]} className="border-t">{r.map((c, i) => <td key={i} className={`py-2 ${i ? "font-mono text-xs" : ""}`}>{c}</td>)}</tr>)}</tbody></table>
          <a className="mt-3 block text-xs text-primary" href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noreferrer">Source: NASA NSSDCA Planetary Fact Sheets ↗</a>
        </Panel>
        <Panel title="Comparison pipeline">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {["Convert compatible measurements into common units", "Document spatial resolution (e.g. SRTM 30 m vs MOLA ~463 m)", "Check measurement quality flags", "Document temporal coverage", "Normalise each criterion to 0–100 against a stated reference", "Flag missing observations — never substitute zero", "Estimate confidence from data-backed weight share", "State the limitations of each comparison"].map((s) => <li key={s}>{s}</li>)}
          </ol>
        </Panel>
        <Panel title="What we never compare directly">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Earth land surface temperature (MODIS) is not equivalent to lunar (Diviner) or Martian (THEMIS) surface temperature — atmosphere, thermal inertia and day length differ.</li>
            <li>• NDVI describes vegetation, not geology. It is used only to measure how "barren" a site is.</li>
            <li>• Elevation values from different instruments are compared as distributions (slope, roughness), not absolute heights.</li>
            <li>• Gravity, radiation and atmosphere cannot be reproduced by any Earth site; analogues are partial by definition.</li>
          </ul>
        </Panel>
        <Panel title="Data honesty">
          <p className="text-sm text-muted-foreground">Criterion scores in this build are <span className="text-mars">demonstration inputs</span> informed by published analogue literature (e.g. Haughton-Mars Project, NASA ARADS, ESA PANGAEA). Live NASA POWER climatology is retrieved per site. Planetary archives (LOLA, MOLA, CRISM…) are shown with their true status: they require download and scientific processing before they can feed the scores.</p>
        </Panel>
      </div>
    </>
  );
}
