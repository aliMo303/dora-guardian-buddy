import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlarmClock, ArrowUpRight, Activity, FileWarning, Gauge, ShieldCheck, Timer, TrendingDown, Search, X, Users, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { incidents, type IncidentStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Incident Dashboard — DORA Copilot" },
      { name: "description", content: "Live view of ICT incidents, active regulatory deadlines, and classification workload." },
    ],
  }),
  component: Dashboard,
});

function formatCountdown(ms: number) {
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const s = Math.floor((abs % 60_000) / 1000);
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Stable UTC formatter — avoids SSR/CSR locale mismatch
function formatDetectedAt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function useCountdown(initialMs: number | undefined) {
  const [ms, setMs] = useState(initialMs ?? 0);
  useEffect(() => {
    if (initialMs === undefined) return;
    const t = setInterval(() => setMs((v) => v - 1000), 1000);
    return () => clearInterval(t);
  }, [initialMs]);
  return ms;
}

const statusStyle: Record<IncidentStatus, string> = {
  Draft: "bg-muted text-muted-foreground ring-border",
  Evaluating: "bg-warning/15 text-warning ring-warning/30",
  "Major - Reportable": "bg-danger/15 text-danger ring-danger/30",
  "Non-Major": "bg-success/15 text-success ring-success/30",
};

function Dashboard() {
  const majorDeadline = incidents.find((i) => i.status === "Major - Reportable")?.deadlineMs;
  const clock = useCountdown(majorDeadline);
  const navigate = useNavigate();
  const [entityFilter, setEntityFilter] = useState<"all" | "neopay">("all");
  const [rangeFilter, setRangeFilter] = useState<"7d" | "24h" | "30d">("7d");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incidents.filter((i) => {
      if (q && !`${i.id} ${i.title} ${i.owner}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query]);

  return (
    <div>
      <div className="border-b border-border bg-[var(--surface-2)]/40 px-6 py-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Incident overview</div>
            <h1 className="mt-1 text-2xl font-semibold">ICT Incident Command</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Live view of ongoing assessments, cross-regime notification deadlines, and pending reviewer sign-offs.
            </p>
          </div>
          <Link
            to="/assessment/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <FileWarning className="h-4 w-4" />
            Start new assessment
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            label="Active assessments"
            value="7"
            hint="3 awaiting reviewer sign-off"
            trend="+2 vs last week"
          />
          <MetricCard
            icon={<FileWarning className="h-4 w-4" />}
            label="Pending notifications"
            value="2"
            hint="1 DORA · 1 NIS2 early warning"
            trend="Draft ready"
            trendTone="success"
          />
          <MetricCard
            icon={<Gauge className="h-4 w-4" />}
            label="Avg. classification time"
            value="6m 42s"
            hint="Narrative → defensible decision"
            trend="−41% vs Q1"
            trendTone="success"
          />
          <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-danger/10 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-danger font-medium">
                  <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                  4-Hour DORA window active
                </div>
                <div className="mt-2 font-mono text-3xl font-semibold text-danger tabular-nums">
                  {formatCountdown(clock)}
                </div>
                <div className="mt-1 text-[11px] text-danger/80">
                  INC-2041 · Notify BaFin before 14:45 CET
                </div>
              </div>
              <AlarmClock className="h-6 w-6 text-danger/70" />
            </div>
          </div>
        </div>

        {/* Regime deadlines row */}
        <div className="grid md:grid-cols-3 gap-4">
          <DeadlinePill regime="DORA" window="4h from classification" left="02h 14m" tone="danger" />
          <DeadlinePill regime="NIS2" window="24h early warning" left="18h 47m" tone="warning" />
          <DeadlinePill regime="GDPR" window="72h from detection" left="64h 12m" tone="muted" />
        </div>

        {/* Incidents table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">Active incidents</h2>
              <p className="text-xs text-muted-foreground">Sorted by regulatory urgency, then detection time.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-[var(--surface-2)] px-2 py-1">
                <Search className="h-3.5 w-3.5" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter incidents…"
                  className="w-40 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <FilterChip
                active={entityFilter === "all"}
                onClick={() => setEntityFilter(entityFilter === "all" ? "neopay" : "all")}
                label={entityFilter === "all" ? "All entities" : "Neopay Bank AG"}
              />
              <FilterChip
                active
                onClick={() =>
                  setRangeFilter(rangeFilter === "24h" ? "7d" : rangeFilter === "7d" ? "30d" : "24h")
                }
                label={rangeFilter === "24h" ? "Last 24 hours" : rangeFilter === "7d" ? "Last 7 days" : "Last 30 days"}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-[var(--surface-2)]/60">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Ref</th>
                  <th className="px-5 py-2.5 font-medium">Incident</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Owner</th>
                  <th className="px-5 py-2.5 font-medium">Detected</th>
                  <th className="px-5 py-2.5 font-medium text-right">Countdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-foreground">
                      No incidents match "{query}".
                    </td>
                  </tr>
                )}
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => navigate({ to: "/assessment/new" })}
                    className="hover:bg-accent/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{inc.id}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{inc.title}</div>
                      <div className="text-[11px] text-muted-foreground">{inc.entity}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[11px] font-medium ${statusStyle[inc.status]}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{inc.owner}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{formatDetectedAt(inc.detectedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      {inc.status === "Major - Reportable" && inc.deadlineMs ? (
                        <span className="font-mono text-danger tabular-nums">{formatCountdown(clock)}</span>
                      ) : inc.status === "Evaluating" ? (
                        <span className="font-mono text-warning">—</span>
                      ) : (
                        <span className="font-mono text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality strip */}
        <div className="grid md:grid-cols-3 gap-4">
          <QualityCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Defensibility score"
            value="94 / 100"
            body="All active classifications have a full RTS Art. 1–8 citation trail attached."
            tone="success"
          />
          <QualityCard
            icon={<Timer className="h-4 w-4" />}
            title="Deadline adherence"
            value="100%"
            body="Last 12 major notifications submitted within statutory windows."
            tone="success"
          />
          <QualityCard
            icon={<TrendingDown className="h-4 w-4" />}
            title="Manual rework"
            value="−63%"
            body="Time spent editing generated drafts before submission this quarter."
            tone="muted"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  trend,
  trendTone = "muted",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  trend?: string;
  trendTone?: "success" | "muted";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid place-items-center h-6 w-6 rounded-md bg-accent text-foreground">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold font-display tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      {trend && (
        <div className={`mt-2 text-[11px] font-medium ${trendTone === "success" ? "text-success" : "text-muted-foreground"}`}>
          {trend}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1 transition-colors ${
        active
          ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
          : "bg-accent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function DeadlinePill({ regime, window, left, tone }: { regime: string; window: string; left: string; tone: "danger" | "warning" | "muted" }) {
  const toneMap = {
    danger: "border-danger/40 bg-danger/10 text-danger",
    warning: "border-warning/40 bg-warning/10 text-warning",
    muted: "border-border bg-[var(--surface-2)] text-muted-foreground",
  } as const;
  return (
    <div className={`rounded-lg border p-4 flex items-center justify-between ${toneMap[tone]}`}>
      <div>
        <div className="text-xs uppercase tracking-wider font-mono">{regime}</div>
        <div className="text-sm mt-1 text-foreground">{window}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-lg tabular-nums">{left}</div>
        <div className="text-[10px] uppercase tracking-wider">Remaining</div>
      </div>
    </div>
  );
}

function QualityCard({
  icon,
  title,
  value,
  body,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  body: string;
  tone: "success" | "muted";
}) {
  const accent = tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`grid place-items-center h-6 w-6 rounded-md bg-accent ${accent}`}>{icon}</span>
        {title}
      </div>
      <div className={`mt-3 text-2xl font-semibold font-display tabular-nums ${accent}`}>{value}</div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}