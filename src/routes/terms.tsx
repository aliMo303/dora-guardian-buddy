import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — DORA Copilot" },
      { name: "description", content: "Terms of service for DORA Copilot." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is maintained by DORA Copilot to explain the rules for using the product. It is
          not a certification or legal guarantee. Last updated: July 7, 2026.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Acceptance</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By accessing or using DORA Copilot, you agree to these Terms of Service on behalf of
          yourself or the organisation you represent. If you do not agree, do not use the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Use of the service</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DORA Copilot is provided to support ICT incident classification, regulatory notification
          workflows, and related governance activities. You may use the service only for lawful
          purposes and in accordance with your organisation's policies and applicable regulations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Accounts and access</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You are responsible for keeping your account credentials secure and for all activity that
          occurs under your account. DORA Copilot may suspend or terminate access if these terms are
          violated or if required by law or regulation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Disclaimer</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DORA Copilot is a workflow aid, not a substitute for legal or regulatory advice. DORA
          Copilot does not guarantee that any output meets a specific regulatory standard or filing
          requirement. Users remain responsible for reviewing and approving submissions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Limitation of liability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To the extent permitted by law, DORA Copilot's liability is limited to the amount paid for
          the service in the preceding twelve months, or where no amount was paid, to the fullest
          extent permitted by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Governing law</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These terms are governed by the laws of the Federal Republic of Germany, without regard to
          conflict-of-law principles. Disputes will be resolved in the courts of Frankfurt am Main,
          Germany.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Changes to these terms</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DORA Copilot may update these terms from time to time. We will notify users of material
          changes by posting the updated terms in the application or by other reasonable means.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Questions about these terms can be sent to trust@doracopilot.io.
        </p>
      </section>
    </div>
  );
}
