import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — DORA Copilot" },
      { name: "description", content: "Security information for DORA Copilot." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is maintained by [Legal Entity] to answer common security questions about DORA Copilot. It describes current practices and enabled platform capabilities, not certifications or guarantees. Last updated: July 7, 2026.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Platform and hosting</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DORA Copilot is built on the Lovable platform, which provides managed authentication, database, and storage infrastructure. The platform handles the underlying hosting environment, while [Legal Entity] is responsible for application-level access controls, data handling practices, and user account management.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Access and authentication</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Users sign in through the platform's authentication service. We recommend using strong, unique credentials and enabling any multi-factor authentication options offered by your organisation. Access is limited to authorised users within your organisation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Data handling</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Incident and assessment data is stored in the platform-managed database. [Legal Entity] applies internal policies to decide who can view, edit, or export data. Please contact us for details of our current data classification and handling procedures.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Incident and security contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you suspect a security issue involving DORA Copilot, please contact [Email Address] with a clear description of the concern. [Legal Entity] will investigate and respond according to its incident response process.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Vulnerability reporting</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We welcome responsible disclosure of security vulnerabilities. Please send reports to [Email Address] with enough detail for us to reproduce and address the issue. Do not exploit vulnerabilities or access data that does not belong to you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Shared responsibility</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Security is a shared responsibility. The Lovable platform provides the managed infrastructure, while [Legal Entity] configures the application, manages users, and sets internal policies. End users are responsible for safeguarding their credentials and following their organisation's security practices.
        </p>
      </section>
    </div>
  );
}
