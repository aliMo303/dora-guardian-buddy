import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlarmClock,
  ArrowUpRight,
  Activity,
  FileWarning,
  Gauge,
  ShieldCheck,
  Timer,
  TrendingDown,
  Search,
  X,
  Network,
  Lock,
  CreditCard,
  Lightbulb,
  FileText,
  ClipboardCheck,
  GitMerge,
} from "lucide-react";
import { useMemo, useState } from "react";
import { incidents, type Incident, type IncidentStatus } from "@/lib/mock-data";
import { formatCountdown, useCountdown } from "@/lib/countdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Incident Dashboard — DORA Copilot" },
      {
        name: "description",
        content:
          "Live view of ICT incidents, active regulatory deadlines, and classification workload.",
      },
    ],
  }),
  component: Dashboard,
});

// Stable UTC formatter — avoids SSR/CSR locale mismatch
function formatDetectedAt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

const statusStyle: Record<IncidentStatus, string> = {
  Draft: "bg-muted text-muted-foreground ring-border",
  Evaluating: "bg-warning/15 text-warning ring-warning/30",
  "Major - Reportable": "bg-danger/15 text-danger ring-danger/30",
  "Non-Major": "bg-success/15 text-success ring-success/30",
};

const RANGE_MS: Record<"24h" | "7d" | "30d", number> = {
  "24h": 24 * 3_600_000,
  "7d": 7 * 24 * 3_600_000,
  "30d": 30 * 24 * 3_600_000,
};

function Dashboard() {
  const majorDeadline = incidents.find((i) => i.status === "Major - Reportable")?.deadlineMs;
  const clock = useCountdown(majorDeadline);
  const navigate = useNavigate();
  const [entityFilter, setEntityFilter] = useState<"all" | "neopay">("all");
  const [rangeFilter, setRangeFilter] = useState<"7d" | "24h" | "30d">("30d");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Incident | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return incidents.filter((i) => {
      if (q && !`${i.id} ${i.title} ${i.owner}`.toLowerCase().includes(q)) return false;
      if (entityFilter === "neopay" && i.entity !== "Neopay Bank AG") return false;
      if (now - new Date(i.detectedAt).getTime() > RANGE_MS[rangeFilter]) return false;
      return true;
    });
  }, [query, entityFilter, rangeFilter]);

  return (
    <div>
      <div className="border-b border-border bg-[var(--surface-2)]/40 px-6 py-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
              Incident overview
            </div>
            <h1 className="mt-1 text-2xl font-semibold">ICT Incident Command</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Live view of ongoing assessments, cross-regime notification deadlines, and pending
              reviewer sign-offs.
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
          <DeadlinePill
            regime="DORA"
            window="4h from classification"
            left="02h 14m"
            tone="danger"
          />
          <DeadlinePill regime="NIS2" window="24h early warning" left="18h 47m" tone="warning" />
          <DeadlinePill regime="GDPR" window="72h from detection" left="64h 12m" tone="muted" />
        </div>

        {/* Incidents table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">Active incidents</h2>
              <p className="text-xs text-muted-foreground">
                Sorted by regulatory urgency, then detection time.
              </p>
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
                  <button
                    onClick={() => setQuery("")}
                    className="text-muted-foreground hover:text-foreground"
                  >
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
                  setRangeFilter(
                    rangeFilter === "24h" ? "7d" : rangeFilter === "7d" ? "30d" : "24h",
                  )
                }
                label={
                  rangeFilter === "24h"
                    ? "Last 24 hours"
                    : rangeFilter === "7d"
                      ? "Last 7 days"
                      : "Last 30 days"
                }
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
                      {query
                        ? `No incidents match "${query}".`
                        : `No incidents in the ${rangeFilter === "24h" ? "last 24 hours" : rangeFilter === "7d" ? "last 7 days" : "last 30 days"}.`}
                    </td>
                  </tr>
                )}
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelected(inc)}
                    className="hover:bg-accent/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">
                      {inc.id}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{inc.title}</div>
                      <div className="text-[11px] text-muted-foreground">{inc.entity}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[11px] font-medium ${statusStyle[inc.status]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{inc.owner}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs font-mono">
                      {formatDetectedAt(inc.detectedAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {inc.status === "Major - Reportable" && inc.deadlineMs ? (
                        <span className="font-mono text-danger tabular-nums">
                          {formatCountdown(clock)}
                        </span>
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

        {/* How it works */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="grid place-items-center h-6 w-6 rounded-md bg-accent text-foreground">
              <Lightbulb className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold">How it works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <StepCard
              number="01"
              icon={<FileText className="h-4 w-4" />}
              title="Capture the narrative"
              body="Describe what happened in plain language — system, impact, and timing. The copilot keeps the original story attached as the audit backbone."
            />
            <StepCard
              number="02"
              icon={<Gauge className="h-4 w-4" />}
              title="Classify under DORA"
              body="AI evaluates each RTS Art. 18 criterion: materiality, service criticality, data sensitivity, duration, and financial impact. Confidence scores and citations are shown side by side."
            />
            <StepCard
              number="03"
              icon={<GitMerge className="h-4 w-4" />}
              title="Check cross-regime overlap"
              body="Parallel checks for NIS2, GDPR, and PSD2 obligations surface additional notifications, deadlines, and authorities without duplicating work."
            />
            <StepCard
              number="04"
              icon={<ClipboardCheck className="h-4 w-4" />}
              title="Generate the draft notification"
              body="A structured, regulator-ready notification is produced with a full reasoning trail. Save, copy, export, or escalate to the reviewer for sign-off."
            />
          </div>
        </section>

        {/* Regulatory coverage */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-6 w-6 rounded-md bg-accent text-foreground">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Regulatory coverage</h2>
                <p className="text-xs text-muted-foreground">
                  Every incident is checked against four EU regimes simultaneously.
                </p>
              </div>
            </div>
            <Link
              to="/about"
              className="text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              About DORA Copilot
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {REGIMES.map((r) => (
              <RegimeChip key={r.code} {...r} />
            ))}
          </div>
        </section>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  {selected.id}
                </div>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.entity}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[11px] font-medium ${statusStyle[selected.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {selected.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span>{selected.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Detected</span>
                  <span className="font-mono text-xs">{formatDetectedAt(selected.detectedAt)}</span>
                </div>
                {selected.classifiedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Classified</span>
                    <span className="font-mono text-xs">
                      {formatDetectedAt(selected.classifiedAt)}
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                {selected.status === "Non-Major" ? (
                  <span className="text-xs text-muted-foreground self-center">
                    Classified non-major — no further notification required.
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSelected(null);
                      navigate({ to: "/assessment/new" });
                    }}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Continue assessment
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
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
        <span className="grid place-items-center h-6 w-6 rounded-md bg-accent text-foreground">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold font-display tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      {trend && (
        <div
          className={`mt-2 text-[11px] font-medium ${trendTone === "success" ? "text-success" : "text-muted-foreground"}`}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
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

function DeadlinePill({
  regime,
  window,
  left,
  tone,
}: {
  regime: string;
  window: string;
  left: string;
  tone: "danger" | "warning" | "muted";
}) {
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
        <span className={`grid place-items-center h-6 w-6 rounded-md bg-accent ${accent}`}>
          {icon}
        </span>
        {title}
      </div>
      <div className={`mt-3 text-2xl font-semibold font-display tabular-nums ${accent}`}>
        {value}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

const REGIMES: Array<{
  code: string;
  icon: React.ReactNode;
  scope: string;
  tone: "danger" | "warning" | "muted" | "primary";
}> = [
  { code: "DORA", icon: <ShieldCheck className="h-3.5 w-3.5" />, scope: "ICT incidents · BaFin", tone: "danger" },
  { code: "NIS2", icon: <Network className="h-3.5 w-3.5" />, scope: "Network security · CSIRT", tone: "warning" },
  { code: "GDPR", icon: <Lock className="h-3.5 w-3.5" />, scope: "Data breaches · DPA", tone: "muted" },
  { code: "PSD2", icon: <CreditCard className="h-3.5 w-3.5" />, scope: "Payment incidents", tone: "primary" },
];

function RegimeChip({
  code,
  icon,
  scope,
  tone,
}: {
  code: string;
  icon: React.ReactNode;
  scope: string;
  tone: "danger" | "warning" | "muted" | "primary";
}) {
  const toneMap = {
    danger: "border-danger/40 bg-danger/10 text-danger",
    warning: "border-warning/40 bg-warning/10 text-warning",
    muted: "border-border bg-[var(--surface-2)] text-muted-foreground",
    primary: "border-primary/40 bg-primary/10 text-primary",
  } as const;
  return (
    <div className={`rounded-md border px-3 py-2 ${toneMap[tone]}`}>
      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
        {icon}
        {code}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{scope}</div>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-[var(--surface-2)]/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2">
          <span className="grid place-items-center h-8 w-8 rounded-md bg-accent text-foreground shrink-0">
            {icon}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">{number}</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
