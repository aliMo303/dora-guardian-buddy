import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  ShieldCheck,
  Target,
  BookOpen,
  ArrowLeft,
  Landmark,
  Network,
  Lock,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — DORA Copilot" },
      { name: "description", content: "RegTech for ICT incident classification and cross-regime reporting across DORA, NIS2, GDPR, and PSD2." },
      { property: "og:title", content: "About Us — DORA Copilot" },
      { property: "og:description", content: "RegTech for ICT incident classification and cross-regime reporting across DORA, NIS2, GDPR, and PSD2." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

type Tone = "danger" | "warning" | "muted" | "primary";

const TONE_CLASSES: Record<Tone, { border: string; bg: string; text: string }> = {
  danger: { border: "border-danger/40", bg: "bg-danger/10", text: "text-danger" },
  warning: { border: "border-warning/40", bg: "bg-warning/10", text: "text-warning" },
  muted: { border: "border-border", bg: "bg-[var(--surface-2)]", text: "text-muted-foreground" },
  primary: { border: "border-primary/40", bg: "bg-primary/10", text: "text-primary" },
};

const FRAMEWORKS: Array<{
  code: string;
  name: string;
  icon: React.ReactNode;
  scope: string;
  deadline: string;
  authority: string;
  tone: Tone;
}> = [
  {
    code: "DORA",
    name: "Digital Operational Resilience Act (EU 2022/2554)",
    icon: <ShieldCheck className="h-4 w-4" />,
    scope: "ICT incident classification and major-incident reporting",
    deadline: "4h from classification",
    authority: "National competent authority (BaFin, DE)",
    tone: "danger",
  },
  {
    code: "NIS2",
    name: "Network and Information Security Directive (EU 2022/2555)",
    icon: <Network className="h-4 w-4" />,
    scope: "Significant incident early warning and impact reporting",
    deadline: "24h from awareness",
    authority: "National CSIRT / competent authority",
    tone: "warning",
  },
  {
    code: "GDPR",
    name: "General Data Protection Regulation (EU 2016/679)",
    icon: <Lock className="h-4 w-4" />,
    scope: "Personal data breach notification",
    deadline: "72h from detection",
    authority: "Data protection authority",
    tone: "muted",
  },
  {
    code: "PSD2",
    name: "Revised Payment Services Directive (EU 2015/2366)",
    icon: <CreditCard className="h-4 w-4" />,
    scope: "Major payment service incident reporting",
    deadline: "Immediate initial report",
    authority: "National competent authority",
    tone: "primary",
  },
];

function FrameworkCard({ f }: { f: (typeof FRAMEWORKS)[number] }) {
  const tone = TONE_CLASSES[f.tone];
  return (
    <div className={`rounded-lg border p-4 ${tone.border} ${tone.bg}`}>
      <div className="flex items-center gap-2">
        <span className={tone.text}>{f.icon}</span>
        <span className={`text-xs uppercase tracking-wider font-mono ${tone.text}`}>{f.code}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{f.name}</p>
      <p className="mt-2 text-sm text-foreground leading-snug">{f.scope}</p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2">
        <span className="font-mono">{f.deadline}</span>
        <span>{f.authority}</span>
      </div>
    </div>
  );
}

function AboutPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-[var(--surface-2)] px-3 py-2 text-xs text-muted-foreground">
      <span className="text-foreground">{icon}</span>
      {label}
    </div>
  );
}

function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="grid place-items-center h-10 w-10 rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
            <Landmark className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">About DORA Copilot</h1>
            <p className="text-xs text-muted-foreground">
              Regulatory technology for ICT incident compliance in financial services
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold">Our mission</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              DORA Copilot helps EU financial entities meet their ICT incident reporting obligations under the
              Digital Operational Resilience Act. We convert an unstructured incident narrative into a
              criterion-by-criterion classification, a cross-regime obligation map, and a regulator-ready draft
              notification — turning a multi-hour manual process into minutes, with a full audit trail for
              reviewer sign-off.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Our sector</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We operate in RegTech for financial services, at the intersection of ICT risk management and
              multi-regime compliance. A single incident can trigger simultaneous obligations across four EU
              frameworks, each with its own criteria, timeline, and supervisory authority:
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {FRAMEWORKS.map((f) => (
                <FrameworkCard key={f.code} f={f} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Who we serve</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Second-line risk and compliance functions, CISOs, and incident responders at banks, payment
              institutions, insurers, and other entities in scope of DORA — anyone who must reach a defensible
              classification decision before the clock runs out.
            </p>
          </section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
            <AboutPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Risk-led" />
            <AboutPill icon={<Target className="h-3.5 w-3.5" />} label="Deadline-driven" />
            <AboutPill icon={<BookOpen className="h-3.5 w-3.5" />} label="Evidence-based" />
            <AboutPill icon={<Users className="h-3.5 w-3.5" />} label="Audit-ready" />
          </div>
        </div>
      </div>
    </div>
  );
}
