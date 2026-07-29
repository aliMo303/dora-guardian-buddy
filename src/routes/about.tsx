import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, ShieldCheck, Target, BookOpen, Clock, ArrowLeft, FileWarning } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — DORA Copilot" },
      { name: "description", content: "Why DORA Copilot exists: compressing hours of manual cross-regulatory incident work into minutes." },
      { property: "og:title", content: "About Us — DORA Copilot" },
      { property: "og:description", content: "Why DORA Copilot exists: compressing hours of manual cross-regulatory incident work into minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

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
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">About us</h1>
            <p className="text-xs text-muted-foreground">The team and mission behind DORA Copilot</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="grid md:grid-cols-[auto_1fr] gap-4">
            <span className="grid place-items-center h-10 w-10 rounded-md bg-accent text-foreground shrink-0">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">The moment it all starts</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Somewhere in a bank's operations centre, a system goes down. A payment processor stalls, a data leak surfaces, or a critical service flickers — and nobody yet knows how serious it is. But one thing is already certain: a clock has started. If this turns out to be a major incident under DORA, the institution has four hours from the moment of classification to notify the regulator. In Germany, that is BaFin. Missing the window costs more than a fine — it costs trust with the supervisor.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-[auto_1fr] gap-4">
            <span className="grid place-items-center h-10 w-10 rounded-md bg-accent text-foreground shrink-0">
              <FileWarning className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">The hard question</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                The honest answer is always: it depends. DORA blends arithmetic thresholds — customers affected, hours lost, financial impact — with judgment calls: public sensitivity, data criticality, and whether the service is truly material. At that moment, the second-line officer who was just thinking about a birthday gift must suddenly do spreadsheet math, reputational forecasting, and cross-regime mapping under a ticking clock, while NIS2, PSD2, and GDPR each demand their own notifications on their own timelines.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-[auto_1fr] gap-4">
            <span className="grid place-items-center h-10 w-10 rounded-md bg-accent text-foreground shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">What we do</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                DORA Copilot is built to compress those hours of manual cross-referencing into minutes, without pretending the judgment calls are simpler than they are. We turn the scattered regulatory maze into a single, defensible workflow so the officer facing that clock can focus on answering one sneaky, simple question: <span className="text-foreground font-medium">"Is this a major incident — yes or no?"</span>
              </p>
            </div>
          </section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
            <AboutPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Risk-led" />
            <AboutPill icon={<Target className="h-3.5 w-3.5" />} label="Deadline-driven" />
            <AboutPill icon={<Users className="h-3.5 w-3.5" />} label="Team-first" />
            <AboutPill icon={<BookOpen className="h-3.5 w-3.5" />} label="Evidence-based" />
          </div>
        </div>
      </div>
    </div>
  );
}
