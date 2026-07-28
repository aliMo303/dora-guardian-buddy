import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DORA Copilot" },
      { name: "description", content: "Privacy policy for DORA Copilot." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is maintained by DORA Copilot to answer common privacy questions about the
          product. It is not a certification or legal guarantee. Last updated: July 7, 2026.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Data we collect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DORA Copilot collects information needed to manage ICT incident assessments, regulatory
          notifications, and user accounts. This may include account identifiers, contact details,
          incident metadata, and any content you enter into assessment forms. We do not collect more
          than is necessary to operate the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">How we use data</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use the information we collect to authenticate users, maintain incident records,
          generate regulatory notifications, and improve the reliability of the platform. We do not
          sell personal data and we do not use it for unrelated advertising purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Subprocessors and integrations</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The application is hosted on Lovable's managed cloud platform. The DORA Copilot team is
          responsible for reviewing any third-party integrations and subprocessors connected to the
          app. Please contact us for the current subprocessor list.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Cookies and analytics</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DORA Copilot uses essential cookies and similar technologies to keep you signed in and to
          maintain your session. We use analytics only where you have provided consent or where it
          is necessary for service operations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Retention and deletion</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We retain account and incident data for as long as your account is active or as needed to
          meet legal and regulatory obligations. When you request deletion, DORA Copilot will remove
          or anonymise your data in line with its retention schedule, subject to lawful retention
          requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Privacy requests</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To exercise your privacy rights, ask questions about this policy, or request access,
          correction, or deletion of your data, please contact us at trust@doracopilot.io. We will
          respond in accordance with applicable law.
        </p>
      </section>
    </div>
  );
}
