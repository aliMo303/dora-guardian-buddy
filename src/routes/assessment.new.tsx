import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  FileText,
  Gavel,
  Loader2,
  Play,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import {
  auditTrail,
  classificationCriteria,
  draftNotification,
  overlapRegimes,
  sampleScenarios,
} from "@/lib/mock-data";

export const Route = createFileRoute("/assessment/new")({
  head: () => ({
    meta: [
      { title: "New Assessment — DORA Copilot" },
      { name: "description", content: "AI-assisted DORA incident classification wizard: narrative → criteria → cross-regime map → draft notification." },
    ],
  }),
  component: NewAssessment,
});

type Step = 1 | 2 | 3 | 4;

const DRAFT_STORAGE_KEY = "dora-copilot:assessment-draft:INC-2042";

interface SavedDraft {
  narrative: string;
  step: Step;
  analyzed: boolean;
  strategy: "strict" | "comparative";
  clockStarted: boolean;
  savedAt: string;
}

function loadDraft(): SavedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedDraft;
  } catch {
    return null;
  }
}

const steps: { id: Step; label: string; hint: string }[] = [
  { id: 1, label: "Narrative", hint: "Paste raw incident context" },
  { id: 2, label: "AI Judgment", hint: "Criterion-by-criterion breakdown" },
  { id: 3, label: "Multi-regime Overlap", hint: "DORA · NIS2 · GDPR · PSD2" },
  { id: 4, label: "Draft & File", hint: "Regulator-ready notification" },
];

const loadingStages = [
  "Parsing narrative and normalising timestamps…",
  "Mapping to entity function register…",
  "Evaluating RTS Art. 1–8 qualitative criteria…",
  "Checking cross-regime timelines (NIS2, GDPR, PSD2)…",
  "Composing defensible draft against BaFin template…",
];

function NewAssessment() {
  const [step, setStep] = useState<Step>(1);
  const [narrative, setNarrative] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [strategy, setStrategy] = useState<"strict" | "comparative">("strict");
  const [clockStarted, setClockStarted] = useState(false);
  const [resumedAt, setResumedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [autoStatus, setAutoStatus] = useState<"idle" | "pending" | "saving" | "saved">("idle");
  const hydratedRef = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage after mount (SSR-safe).
  useEffect(() => {
    const draft = loadDraft();
    hydratedRef.current = true;
    if (!draft) return;
    setNarrative(draft.narrative);
    setStep(draft.step);
    setAnalyzed(draft.analyzed);
    setStrategy(draft.strategy);
    setClockStarted(draft.clockStarted);
    setResumedAt(draft.savedAt);
    setLastSavedAt(draft.savedAt);
  }, []);

  // Autosave: debounce writes ~1.2s after any tracked state change.
  useEffect(() => {
    if (!hydratedRef.current) return;
    // Nothing worth persisting yet.
    if (!narrative.trim() && !analyzed && !clockStarted && step === 1) return;

    setAutoStatus("pending");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setAutoStatus("saving");
      const savedAt = new Date().toISOString();
      const draft: SavedDraft = { narrative, step, analyzed, strategy, clockStarted, savedAt };
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setLastSavedAt(savedAt);
        setAutoStatus("saved");
        if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
        savedFlashTimer.current = setTimeout(() => setAutoStatus("idle"), 1600);
      } catch {
        setAutoStatus("idle");
      }
    }, 1200);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [narrative, step, analyzed, strategy, clockStarted]);

  const saveDraft = () => {
    if (saving) return;
    setSaving(true);
    const savedAt = new Date().toISOString();
    const draft: SavedDraft = { narrative, step, analyzed, strategy, clockStarted, savedAt };
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setLastSavedAt(savedAt);
      toast.success("Draft saved", {
        description: "Narrative, generated outputs and clock state preserved for this browser.",
      });
    } catch {
      toast.error("Could not save draft — storage unavailable");
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  };

  const discardDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
    setNarrative("");
    setStep(1);
    setAnalyzed(false);
    setStrategy("strict");
    setClockStarted(false);
    setResumedAt(null);
    setLastSavedAt(null);
    setAutoStatus("idle");
    toast("Draft discarded — started fresh assessment");
  };

  const runAnalysis = () => {
    if (!narrative.trim()) return;
    setAnalyzing(true);
    setStageIdx(0);
    setAnalyzed(false);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i >= loadingStages.length) {
        setAnalyzing(false);
        setAnalyzed(true);
        setStep(2);
        return;
      }
      setStageIdx(i);
      setTimeout(tick, 650);
    };
    setTimeout(tick, 650);
  };

  const wordCount = useMemo(() => narrative.trim().split(/\s+/).filter(Boolean).length, [narrative]);

  return (
    <div>
      <div className="border-b border-border bg-[var(--surface-2)]/40 px-6 py-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-wider">
          Assessment · Draft
        </div>
        <div className="mt-1 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">New Incident Assessment</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Turn a messy, unstructured incident narrative into a defensible, criterion-by-criterion DORA
              classification and a regulator-ready draft notification.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reference</div>
              <div className="font-mono text-sm">INC-2042</div>
            </div>
            <AutosaveIndicator status={autoStatus} lastSavedAt={lastSavedAt} />
            <button
              onClick={saveDraft}
              disabled={saving || (!narrative.trim() && !analyzed && !clockStarted)}
              aria-busy={saving}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save draft"}
            </button>
          </div>
        </div>

        {(resumedAt || lastSavedAt) && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <RotateCcw className="h-3.5 w-3.5 text-primary" />
              <span>
                {resumedAt ? "Resumed from saved draft" : "Draft saved locally"} ·{" "}
                <span className="font-mono text-muted-foreground">
                  {formatSavedAt(lastSavedAt ?? resumedAt!)}
                </span>
                {" · "}
                <span className="text-muted-foreground">
                  step {step}/4{clockStarted ? " · clock armed" : ""}
                </span>
              </span>
            </div>
            <button
              onClick={discardDraft}
              className="text-[11px] text-muted-foreground hover:text-danger underline underline-offset-2"
            >
              Discard & start over
            </button>
          </div>
        )}

        <ol className="mt-5 flex items-center gap-2 overflow-x-auto">
          {steps.map((s, idx) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => (analyzed || s.id === 1) && setStep(s.id)}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors ${
                    active
                      ? "bg-primary/15 ring-1 ring-primary/40 text-foreground"
                      : done
                      ? "bg-success/10 ring-1 ring-success/30 text-foreground"
                      : "bg-[var(--surface-2)] text-muted-foreground"
                  }`}
                >
                  <span
                    className={`grid place-items-center h-6 w-6 rounded-full text-[11px] font-semibold font-mono ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                        ? "bg-success text-success-foreground"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                  </span>
                  <div className="leading-tight">
                    <div className="text-[13px] font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.hint}</div>
                  </div>
                </button>
                {idx < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="p-6">
        {step === 1 && (
          <StepOne
            narrative={narrative}
            setNarrative={setNarrative}
            analyzing={analyzing}
            stageIdx={stageIdx}
            runAnalysis={runAnalysis}
            wordCount={wordCount}
          />
        )}
        {step === 2 && (
          <StepTwo
            narrative={narrative}
            strategy={strategy}
            setStrategy={setStrategy}
            goNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepThree goNext={() => setStep(4)} clockStarted={clockStarted} setClockStarted={setClockStarted} />
        )}
        {step === 4 && <StepFour clockStarted={clockStarted} />}
      </div>
    </div>
  );
}

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
  } catch {
    return iso;
  }
}

function AutosaveIndicator({
  status,
  lastSavedAt,
}: {
  status: "idle" | "pending" | "saving" | "saved";
  lastSavedAt: string | null;
}) {
  let label: string;
  let icon: React.ReactNode;
  let tone: string;
  switch (status) {
    case "pending":
      label = "Unsaved changes…";
      icon = <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />;
      tone = "text-muted-foreground";
      break;
    case "saving":
      label = "Saving…";
      icon = <Loader2 className="h-3 w-3 animate-spin" />;
      tone = "text-muted-foreground";
      break;
    case "saved":
      label = "Saved";
      icon = <CheckCircle2 className="h-3 w-3 text-success" />;
      tone = "text-success";
      break;
    default:
      if (!lastSavedAt) return null;
      label = `Saved · ${formatSavedAt(lastSavedAt)}`;
      icon = <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      tone = "text-muted-foreground";
  }
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-card/50 px-2.5 py-2 text-[11px] font-mono ${tone}`}
      aria-live="polite"
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StepOne({
  narrative,
  setNarrative,
  analyzing,
  stageIdx,
  runAnalysis,
  wordCount,
}: {
  narrative: string;
  setNarrative: (s: string) => void;
  analyzing: boolean;
  stageIdx: number;
  runAnalysis: () => void;
  wordCount: number;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Incident narrative</h2>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">{wordCount} words</div>
        </div>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder={`Paste the raw incident context here — Slack transcripts, EDR alerts, SRE timelines, vendor status pages. No formatting required.\n\nExample: "08:42 CET — On-call SRE paged: ledger-primary-eu-west-1 unreachable…"`}
          className="w-full min-h-[420px] resize-none bg-transparent px-5 py-4 text-sm leading-relaxed font-mono placeholder:text-muted-foreground focus:outline-none"
          disabled={analyzing}
        />
        <div className="flex items-center justify-between border-t border-border bg-[var(--surface-2)]/60 px-5 py-3">
          <div className="text-[11px] text-muted-foreground">
            Narratives never leave your tenant. Model context isolated per assessment.
          </div>
          <button
            disabled={!narrative.trim() || analyzing}
            onClick={runAnalysis}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analyzing…" : "Analyze narrative"}
          </button>
        </div>

        {analyzing && (
          <div className="border-t border-border bg-background/60 px-5 py-4 space-y-2">
            {loadingStages.map((stage, i) => {
              const done = i < stageIdx;
              const active = i === stageIdx;
              const pending = i > stageIdx;
              return (
                <div key={stage} className="flex items-center gap-2.5 text-xs">
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span className={pending ? "text-muted-foreground" : "text-foreground"}>{stage}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Play className="h-3.5 w-3.5" />
            Load sample scenario
          </div>
          <div className="mt-3 space-y-2">
            {sampleScenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setNarrative(s.narrative)}
                className="w-full text-left rounded-md border border-border bg-[var(--surface-2)] p-3 text-sm hover:border-primary/40 transition-colors"
              >
                <div className="font-medium">{s.label}</div>
                <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{s.narrative}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            What happens next
          </div>
          <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary font-mono">→</span> Criterion-by-criterion RTS evaluation</li>
            <li className="flex gap-2"><span className="text-primary font-mono">→</span> Timelines mapped across DORA/NIS2/GDPR/PSD2</li>
            <li className="flex gap-2"><span className="text-primary font-mono">→</span> Draft notification composed against BaFin template</li>
            <li className="flex gap-2"><span className="text-primary font-mono">→</span> Full auditor trail preserved for reviewer sign-off</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function StepTwo({
  narrative,
  strategy,
  setStrategy,
  goNext,
}: {
  narrative: string;
  strategy: "strict" | "comparative";
  setStrategy: (s: "strict" | "comparative") => void;
  goNext: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Source narrative</h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">Read-only</span>
        </div>
        <pre className="flex-1 overflow-auto whitespace-pre-wrap px-5 py-4 text-[12.5px] leading-relaxed font-mono text-muted-foreground">
{narrative || "(no narrative)"}
        </pre>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">AI judgment layer</h2>
            </div>
            <div className="flex rounded-md border border-border overflow-hidden text-[11px]">
              <button
                onClick={() => setStrategy("strict")}
                className={`px-2.5 py-1 ${strategy === "strict" ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
              >
                Strict RTS
              </button>
              <button
                onClick={() => setStrategy("comparative")}
                className={`px-2.5 py-1 border-l border-border ${strategy === "comparative" ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
              >
                Compare strategies
              </button>
            </div>
          </div>
          <div className="divide-y divide-border max-h-[520px] overflow-auto">
            {classificationCriteria.map((c) => (
              <div key={c.key} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{c.citation}</div>
                  </div>
                  <ConfidenceBadge value={c.confidence} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium">{c.rating}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{c.reasoning}</p>
                {strategy === "comparative" && (
                  <div className="mt-2 rounded-md border border-dashed border-border bg-[var(--surface-2)] p-2 text-[11px] text-muted-foreground">
                    <span className="font-mono text-warning">alt-prompt:</span> Conservative reviewer rating —{" "}
                    {c.confidence > 80 ? "unchanged" : "downgrade by one band pending human confirmation."}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Gavel className="h-3.5 w-3.5" /> Preliminary determination
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-md bg-danger/15 text-danger ring-1 ring-danger/40 px-2 py-1 text-xs font-semibold">
              MAJOR INCIDENT — reportable under DORA Art. 19
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            5 of 7 RTS criteria meet or exceed the qualifying threshold. Reviewer sign-off required before the
            legal clock starts.
          </p>
        </div>

        <details className="rounded-xl border border-border bg-card">
          <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              Auditor trail
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">{auditTrail.length} events</span>
          </summary>
          <div className="px-5 pb-4 space-y-1.5">
            {auditTrail.map((a) => (
              <div key={a.at} className="flex gap-3 text-[11.5px] font-mono">
                <span className="text-muted-foreground">{a.at}</span>
                <span>{a.event}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="flex justify-end">
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Review cross-regime overlap
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const tone = value >= 85 ? "success" : value >= 65 ? "warning" : "danger";
  const cls = {
    success: "bg-success/15 text-success ring-success/30",
    warning: "bg-warning/15 text-warning ring-warning/30",
    danger: "bg-danger/15 text-danger ring-danger/30",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[10.5px] font-medium font-mono ${cls}`}>
      conf {value}%
    </span>
  );
}

function StepThree({
  goNext,
  clockStarted,
  setClockStarted,
}: {
  goNext: () => void;
  clockStarted: boolean;
  setClockStarted: (b: boolean) => void;
}) {
  const [arming, setArming] = useState(false);
  const confirmClassification = () => {
    if (arming || clockStarted) return;
    setArming(true);
    toast.loading("Recording reviewer confirmation…", { id: "arm-clock" });
    setTimeout(() => {
      setArming(false);
      setClockStarted(true);
      toast.success("Legal clock armed — DORA 4h window active", {
        id: "arm-clock",
        description: "BaFin notification due by 14:45 CET.",
      });
    }, 1100);
  };
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Multi-regime overlap analysis</h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            A single ICT incident can trigger simultaneous notifications across regimes.
          </span>
        </div>
        <div className="divide-y divide-border">
          {overlapRegimes.map((r) => (
            <div key={r.key} className="grid md:grid-cols-[24px_1fr_180px_220px] gap-3 items-start px-5 py-4">
              <div className="pt-1">
                <span
                  className={`inline-block h-4 w-4 rounded-sm border ${
                    r.triggered ? "bg-primary border-primary" : "border-border bg-transparent"
                  }`}
                />
              </div>
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{r.authority}</div>
                <div className="text-xs text-muted-foreground mt-1.5">{r.note}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deadline</div>
                <div className="text-sm font-mono">{r.deadline}</div>
              </div>
              <div>
                {r.triggered ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 bg-warning/15 text-warning ring-warning/30">
                    <AlertTriangle className="h-3 w-3" />
                    Notification required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 bg-muted text-muted-foreground ring-border">
                    Monitor — not triggered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${clockStarted ? "border-danger/40 bg-danger/10" : "border-warning/40 bg-warning/10"}`}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlarmClockIcon started={clockStarted} />
              {clockStarted ? "Legal clock started — 4h DORA window active" : "Confirm classification to start the legal clock"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
              {clockStarted
                ? "Notification to BaFin must be submitted by 14:45 CET. NIS2 early warning and GDPR breach assessment are running in parallel."
                : "Once you confirm the major-incident classification, the DORA Article 19(4)(a) 4-hour countdown starts. Reviewer approval is recorded in the auditor trail."}
            </p>
          </div>
          <div className="flex gap-2">
            {!clockStarted ? (
              <button
                onClick={confirmClassification}
                disabled={arming}
                aria-busy={arming}
                className="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-medium text-danger-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {arming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                {arming ? "Arming legal clock…" : "Confirm major incident classification"}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Proceed to draft notification
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlarmClockIcon({ started }: { started: boolean }) {
  return (
    <span
      className={`grid place-items-center h-6 w-6 rounded-full ${
        started ? "bg-danger/25 text-danger" : "bg-warning/25 text-warning"
      }`}
    >
      <Timer className="h-3.5 w-3.5" />
    </span>
  );
}

function StepFour({ clockStarted }: { clockStarted: boolean }) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const copy = async () => {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(draftNotification);
      setCopied(true);
      toast.success("Draft copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Clipboard blocked — select text manually");
    } finally {
      setCopying(false);
    }
  };

  const exportPdf = () => {
    if (exporting) return;
    setExporting(true);
    toast.loading("Composing defensible PDF (incl. auditor trail)…", { id: "export-pdf" });
    setTimeout(() => {
      try {
        const blob = new Blob([draftNotification], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "INC-2041_DORA_initial_notification.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setExported(true);
        toast.success("Defensible export ready", {
          id: "export-pdf",
          description: "INC-2041_DORA_initial_notification.txt downloaded.",
        });
        setTimeout(() => setExported(false), 2200);
      } catch (e) {
        toast.error("Export failed", { id: "export-pdf" });
      } finally {
        setExporting(false);
      }
    }, 1400);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Draft initial notification — BaFin</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              disabled={copying}
              aria-busy={copying}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {copying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : copied ? (
                <Clipboard className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copying ? "Copying…" : copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={exportPdf}
              disabled={exporting}
              aria-busy={exporting}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : exported ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {exporting ? "Exporting…" : exported ? "Downloaded" : "Export defensible PDF"}
            </button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap px-5 py-4 text-[12.5px] leading-relaxed font-mono">{draftNotification}</pre>
      </div>

      <aside className="space-y-4">
        <div className={`rounded-xl border p-4 ${clockStarted ? "border-danger/40 bg-danger/10" : "border-border bg-card"}`}>
          <div className={`text-xs font-medium ${clockStarted ? "text-danger" : "text-muted-foreground"}`}>
            {clockStarted ? "DORA 4h window" : "Clock not started"}
          </div>
          <div className={`mt-2 font-mono text-2xl tabular-nums ${clockStarted ? "text-danger" : "text-foreground"}`}>
            {clockStarted ? "03:41:22" : "—:—:—"}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {clockStarted ? "Submit before 14:45 CET" : "Confirm classification in Step 3 to arm the timer."}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Parallel filings</div>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex items-center justify-between">
              <span>NIS2 early warning · BSI</span>
              <span className="font-mono text-warning">18h 47m</span>
            </li>
            <li className="flex items-center justify-between">
              <span>GDPR Art. 33 · BfDI</span>
              <span className="font-mono text-muted-foreground">64h 12m</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Internal risk committee</span>
              <span className="font-mono text-muted-foreground">Next 24h</span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Reviewer sign-off</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/25 grid place-items-center text-xs font-semibold text-primary">SI</div>
            <div className="text-xs leading-tight">
              <div className="font-medium">S. Ivanova</div>
              <div className="text-muted-foreground">Head of ICT Risk (2nd line)</div>
            </div>
          </div>
          <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-[var(--surface-2)] px-3 py-2 text-xs font-medium hover:border-primary/40">
            Request sign-off
          </button>
        </div>
      </aside>
    </div>
  );
}