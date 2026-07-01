import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/framework-explorer")({
  head: () => ({
    meta: [
      { title: "Framework Explorer — DORA Copilot" },
      { name: "description", content: "Browse DORA articles and RTS clauses cross-referenced with entity-level controls." },
    ],
  }),
  component: FrameworkExplorer,
});

const articles = [
  { ref: "DORA Art. 17", title: "ICT-related incident management process", tags: ["Process", "Level 1"] },
  { ref: "DORA Art. 18", title: "Classification of ICT-related incidents & cyber threats", tags: ["Classification", "Core"] },
  { ref: "DORA Art. 19", title: "Reporting of major ICT-related incidents", tags: ["Reporting", "Deadlines"] },
  { ref: "DORA Art. 20", title: "Harmonisation of reporting content and templates", tags: ["Templates"] },
  { ref: "RTS Art. 1", title: "Clients, financial counterparts & transactions affected", tags: ["Quantitative"] },
  { ref: "RTS Art. 3", title: "Criticality of services affected", tags: ["Qualitative"] },
  { ref: "RTS Art. 6", title: "Reputational impact", tags: ["Qualitative"] },
  { ref: "RTS Art. 8", title: "Economic impact", tags: ["Quantitative"] },
];

function FrameworkExplorer() {
  return (
    <div>
      <div className="border-b border-border bg-[var(--surface-2)]/40 px-6 py-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Reference library</div>
        <h1 className="mt-1 text-2xl font-semibold">Framework Explorer</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Every AI decision in DORA Copilot links back to a specific article and RTS clause here.
          Browse the source of truth for reviewer sign-off and audit defence.
        </p>
      </div>
      <div className="p-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {articles.map((a) => (
          <div key={a.ref} className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-primary">{a.ref}</div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="mt-2 text-sm font-medium">{a.title}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.tags.map((t) => (
                <span key={t} className="rounded-full bg-accent text-muted-foreground text-[10.5px] px-2 py-0.5">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              Linked to 3 active assessments
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}