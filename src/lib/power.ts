// Live NASA POWER climatology retrieval (public, no key, CORS-enabled).
export interface PowerData { solar: number; t2m: number; precip: number; retrieved: string }

const cache = new Map<string, PowerData>();

export async function fetchPower(lat: number, lon: number): Promise<PowerData> {
  const key = `${lat},${lon}`;
  if (cache.has(key)) return cache.get(key)!;
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M,PRECTOTCORR&community=RE&latitude=${lat}&longitude=${lon}&format=JSON`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`NASA POWER ${r.status}`);
  const j = await r.json();
  const p = j.properties.parameter;
  const d = { solar: p.ALLSKY_SFC_SW_DWN.ANN, t2m: p.T2M.ANN, precip: p.PRECTOTCORR.ANN, retrieved: new Date().toISOString() };
  cache.set(key, d);
  return d;
}
