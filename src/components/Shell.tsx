import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Database, FileText, FlaskConical, Globe2, LayoutDashboard, Menu, Rocket, Scale, Settings, Search, User } from "lucide-react";
import { useApp } from "@/lib/store";
import { LOCATIONS, MISSIONS } from "@/lib/data";

const NAV = [
  { to: "/dashboard", label: "Mission Control", icon: LayoutDashboard },
  { to: "/explorer", label: "3D Explorer", icon: Globe2 },
  { to: "/missions", label: "Mission Scenarios", icon: Rocket },
  { to: "/ranking", label: "Ranking Engine", icon: BarChart3 },
  { to: "/compare", label: "Compare", icon: Scale },
  { to: "/science", label: "Science Centre", icon: FlaskConical },
  { to: "/nasa-data", label: "NASA Data", icon: Database },
  { to: "/reports", label: "Mission Reports", icon: FileText },
  { to: "/admin", label: "Administration", icon: Settings },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState("");
  const mission = useApp((s) => s.mission);
  const nav = useNavigate();
  useEffect(() => { useApp.persist.rehydrate(); }, []);
  const hits = q ? LOCATIONS.filter((l) => (l.name + l.country).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 h-screen shrink-0 border-r bg-panel/80 backdrop-blur transition-all ${open ? "w-60" : "w-16"}`}>
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-primary via-accent to-mars glow" />
          {open && <div className="leading-tight"><div className="font-display text-sm font-bold">PLANETARY</div><div className="label-caps !text-[0.6rem]">Analogue Explorer</div></div>}
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "!bg-secondary !text-primary" }}>
              <Icon className="h-4 w-4 shrink-0" />{open && label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/70 px-4 backdrop-blur">
          <button aria-label="Toggle sidebar" onClick={() => setOpen(!open)} className="rounded-md p-2 hover:bg-secondary"><Menu className="h-4 w-4" /></button>
          <Link to="/missions" className="hidden rounded-full border px-3 py-1 text-xs md:block">
            <span className="label-caps mr-2">Mission</span><span className="text-primary">{MISSIONS[mission].name}</span>
          </Link>
          <div className="relative ml-auto w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search locations…" className="w-full rounded-full border bg-secondary/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
            {hits.length > 0 && (
              <div className="glass absolute mt-2 w-full overflow-hidden !bg-popover">
                {hits.map((h) => (
                  <button key={h.id} onClick={() => { setQ(""); nav({ to: "/location/$id", params: { id: h.id } }); }} className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary">
                    {h.name} <span className="text-muted-foreground">· {h.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex" title="NASA POWER is retrieved live; other datasets show their real processing status on the NASA Data page">
            <span className="h-2 w-2 animate-pulse rounded-full bg-multi" />NASA POWER live
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><User className="h-4 w-4" /></div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export function Panel({ title, children, className = "", action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`glass p-5 ${className}`}>
      {title && <div className="mb-4 flex items-center justify-between"><h3 className="label-caps">{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

export function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <div className="label-caps text-primary">{kicker}</div>
      <h1 className="mt-1 text-3xl font-bold">{title}</h1>
      {sub && <p className="mt-2 max-w-3xl text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function DemoTag() {
  return <span className="rounded border border-mars/40 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-mars">Demo data</span>;
}

export function Bar({ value, tone = "primary" }: { value: number; tone?: string }) {
  return <div className="h-1.5 w-full rounded-full bg-secondary"><div className="h-full rounded-full" style={{ background: `var(--color-${tone})`, width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export const CAT_LABEL: Record<string, string> = { lunar: "Lunar analogue", mars: "Martian analogue", multi: "Multi-mission", pending: "Under evaluation" };
