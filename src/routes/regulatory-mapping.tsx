import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/regulatory-mapping")({
  head: () => ({
    meta: [
      { title: "Regulatory Mapping — DORA Copilot" },
      { name: "description", content: "Cross-regime map of ICT incident notification duties across DORA, NIS2, GDPR and PSD2." },
    ],
  }),
  component: RegulatoryMapping,
});

const regimes = [
  { key: "detect", label: "Detection", dora: true, nis2: true, gdpr: true, psd2: true },
  { key: "class", label: "Classification as major/significant", dora: true, nis2: true, gdpr: false, psd2: true },
  { key: "early", label: "Early warning / initial notification", dora: "4h", nis2: "24h", gdpr: "—", psd2: "4h" },
  { key: "interim", label: "Intermediate report", dora: "72h", nis2: "72h", gdpr: "—", psd2: "3d" },
  { key: "final", label: "Final report", dora: "1 month", nis2: "1 month", gdpr: "—", psd2: "2 weeks" },
  { key: "data", label: "Personal data breach notification", dora: false, nis2: false, gdpr: "72h", psd2: false },
  { key: "subject", label: "Data-subject communication", dora: false, nis2: false, gdpr: "without undue delay", psd2: false },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <CheckCircle2 className="h-4 w-4 text-success mx-auto" />;
  if (v === false) return <Circle className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  if (v === "—") return <span className="text-muted-foreground">—</span>;
  return <span className="font-mono text-sm">{v}</span>;
}

function RegulatoryMapping() {
  return (
    <div>
      <div className="border-b border-border bg-[var(--surface-2)]/40 px-6 py-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Cross-regime map</div>
        <h1 className="mt-1 text-2xl font-semibold">Regulatory Mapping</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Understand at a glance which reporting duties fire together when a single ICT incident hits.
          Deadlines are computed against the applicable trigger event.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-2)]/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Obligation</th>
                <th className="px-5 py-3 font-medium text-center">DORA</th>
                <th className="px-5 py-3 font-medium text-center">NIS2</th>
                <th className="px-5 py-3 font-medium text-center">GDPR</th>
                <th className="px-5 py-3 font-medium text-center">PSD2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {regimes.map((r) => (
                <tr key={r.key} className="hover:bg-accent/40">
                  <td className="px-5 py-3 font-medium">{r.label}</td>
                  <td className="px-5 py-3 text-center"><Cell v={r.dora} /></td>
                  <td className="px-5 py-3 text-center"><Cell v={r.nis2} /></td>
                  <td className="px-5 py-3 text-center"><Cell v={r.gdpr} /></td>
                  <td className="px-5 py-3 text-center"><Cell v={r.psd2} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { title: "DORA", body: "Regulation (EU) 2022/2554. Competent authority: BaFin. Focus: ICT operational resilience.", color: "text-primary" },
            { title: "NIS2", body: "Directive (EU) 2022/2555. CSIRT: BSI. Focus: cybersecurity of essential/important entities.", color: "text-warning" },
            { title: "GDPR", body: "Regulation (EU) 2016/679. DPA: BfDI or state. Focus: personal data breaches.", color: "text-success" },
            { title: "PSD2", body: "Directive (EU) 2015/2366. Authority: BaFin. Focus: major operational or security payment incidents.", color: "text-muted-foreground" },
          ].map((r) => (
            <div key={r.title} className="rounded-xl border border-border bg-card p-4">
              <div className={`text-xs font-mono uppercase tracking-wider ${r.color}`}>{r.title}</div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}