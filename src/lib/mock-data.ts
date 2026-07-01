export type IncidentStatus = "Draft" | "Evaluating" | "Major - Reportable" | "Non-Major";

export interface Incident {
  id: string;
  title: string;
  entity: string;
  status: IncidentStatus;
  detectedAt: string;
  classifiedAt?: string;
  deadlineMs?: number; // ms remaining from now
  owner: string;
}

export const incidents: Incident[] = [
  {
    id: "INC-2041",
    title: "Ransomware detected on core ledger cluster",
    entity: "Neopay Bank AG",
    status: "Major - Reportable",
    detectedAt: "2026-07-01T09:12:00Z",
    classifiedAt: "2026-07-01T10:45:00Z",
    deadlineMs: 2 * 60 * 60 * 1000 + 14 * 60 * 1000,
    owner: "M. Keller",
  },
  {
    id: "INC-2039",
    title: "Third-party cloud outage affecting payment routing",
    entity: "Neopay Bank AG",
    status: "Evaluating",
    detectedAt: "2026-07-01T08:02:00Z",
    owner: "S. Ivanova",
  },
  {
    id: "INC-2036",
    title: "Elevated auth failures on customer portal",
    entity: "Neopay Bank AG",
    status: "Non-Major",
    detectedAt: "2026-06-30T21:44:00Z",
    classifiedAt: "2026-06-30T22:30:00Z",
    owner: "M. Keller",
  },
  {
    id: "INC-2033",
    title: "Suspicious lateral movement in internal VPN",
    entity: "Neopay Bank AG",
    status: "Draft",
    detectedAt: "2026-06-30T14:11:00Z",
    owner: "J. Al-Farsi",
  },
];

export const sampleScenarios: { id: string; label: string; narrative: string }[] = [
  {
    id: "ransomware",
    label: "Ransomware on core ledger",
    narrative: `08:42 CET — On-call SRE paged: ledger-primary-eu-west-1 unreachable. #incident-sev1 flooded with alerts.
09:04 — EDR flags encryption activity on 3 database VMs. Files renamed with .lckd extension. Ransom note dropped in /var/opt/ledger/README_RESTORE.txt.
09:11 — Payments team confirms SEPA batch processing halted. Card auth still up (separate VPC) but degraded (~40% latency spike).
09:20 — CISO invokes IR playbook. Backup restore ETA "several hours, possibly EOD".
09:35 — ~180k retail customers cannot see balances in mobile app. Call center overwhelmed. Two journalists already emailing press office.
Suspected initial vector: compromised MSP jump host (third-party admin), still under investigation.`,
  },
  {
    id: "cloud-outage",
    label: "Third-party cloud outage",
    narrative: `Our primary cloud provider (eu-central-1) reports a control-plane incident since 07:12. Our payment routing service depends on their managed Kafka. All card authorizations are failing over to the secondary region but with ~8s p95 latency (normally 120ms). Merchants complaining. About 60% of transactions succeed after retry. No data loss suspected. Provider ETA for restoration unknown. Affects ~220k end users across DE/AT/NL.`,
  },
  {
    id: "phish",
    label: "Credential phishing wave",
    narrative: `Detected ~1,400 phishing emails delivered to staff overnight impersonating BaFin. 12 users entered credentials on cloned portal. MFA blocked login for 10; 2 accounts confirmed compromised (SSO tokens revoked). No evidence of customer data access yet. GDPR team notified. No service degradation.`,
  },
];

export const classificationCriteria = [
  {
    key: "criticality",
    title: "Criticality of Affected Functions",
    citation: "DORA Art. 18(1)(a) · RTS Art. 3",
    rating: "High",
    confidence: 92,
    reasoning:
      "Core ledger and SEPA batch processing are identified as critical or important functions per the entity's ICT function register. Extended unavailability directly impedes settlement obligations.",
  },
  {
    key: "users",
    title: "Clients & Financial Counterparts Affected",
    citation: "RTS Art. 1",
    rating: "~180,000 retail clients",
    confidence: 88,
    reasoning:
      "Mobile app balance retrieval unavailable for the full retail customer base connected to the affected cluster. Threshold of 10% of clients materially exceeded.",
  },
  {
    key: "reputational",
    title: "Reputational Impact",
    citation: "RTS Art. 6",
    rating: "Elevated",
    confidence: 74,
    reasoning:
      "Press inquiries already received within 90 minutes of detection. Public-facing service degradation is visible on downdetector-style trackers. Likely media coverage within 24h.",
  },
  {
    key: "duration",
    title: "Duration & Service Downtime",
    citation: "RTS Art. 4",
    rating: "> 2h (ongoing)",
    confidence: 96,
    reasoning:
      "Service disruption started 09:12 CET and is ongoing at time of assessment. Estimated MTTR exceeds the 2-hour threshold for critical services.",
  },
  {
    key: "geo",
    title: "Geographical Spread",
    citation: "RTS Art. 5",
    rating: "Single Member State",
    confidence: 90,
    reasoning:
      "Impact contained to DE customer base. No cross-border payment corridors materially affected at this stage.",
  },
  {
    key: "data",
    title: "Data Losses",
    citation: "RTS Art. 7",
    rating: "Suspected — under review",
    confidence: 55,
    reasoning:
      "Encryption of database volumes suggests possible integrity loss. Confidentiality impact unclear pending forensic triage. GDPR Art. 33 assessment recommended in parallel.",
  },
  {
    key: "economic",
    title: "Economic Impact",
    citation: "RTS Art. 8",
    rating: "Above threshold (est.)",
    confidence: 68,
    reasoning:
      "Combined direct cost (incident response, backup restoration, potential ransom decision) and foregone SEPA fee revenue projected to exceed 0.1% of last-year turnover.",
  },
];

export const overlapRegimes = [
  {
    key: "dora",
    name: "DORA — Initial Notification",
    authority: "BaFin (competent authority)",
    deadline: "4 hours from classification as major",
    hours: 4,
    triggered: true,
    note: "Clock starts on confirmation of major classification.",
  },
  {
    key: "nis2",
    name: "NIS2 — Early Warning",
    authority: "BSI (CSIRT)",
    deadline: "24 hours from awareness",
    hours: 24,
    triggered: true,
    note: "Significant incident affecting essential entity — early warning required.",
  },
  {
    key: "gdpr",
    name: "GDPR — Personal Data Breach",
    authority: "BfDI / State DPA",
    deadline: "72 hours from detection",
    hours: 72,
    triggered: true,
    note: "Suspected integrity/confidentiality impact on personal data — Art. 33 notification likely required.",
  },
  {
    key: "psd2",
    name: "PSD2 — Major Operational Incident",
    authority: "BaFin / EBA guidelines",
    deadline: "4 hours from classification",
    hours: 4,
    triggered: false,
    note: "Card authorization impact currently below PSD2 major-incident threshold. Monitor.",
  },
];

export const draftNotification = `INITIAL NOTIFICATION — MAJOR ICT-RELATED INCIDENT
Regulation (EU) 2022/2554 (DORA), Article 19(4)(a)

1. Reporting entity
   Name:                Neopay Bank AG
   LEI:                 5299001XXXXXXXXXXXXX
   Competent authority: Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)

2. Incident identification
   Internal reference:  INC-2041
   Date/time detected:  2026-07-01 09:12 CET
   Date/time classified as major: 2026-07-01 10:45 CET
   Nature:              Malicious — ransomware affecting core ledger cluster

3. Classification summary
   Criticality of affected functions:  HIGH (core ledger, SEPA batch)
   Clients affected:                   ~180,000 retail clients (mobile balance retrieval)
   Duration:                           Ongoing, > 2 hours at time of notification
   Reputational impact:                Elevated (press enquiries received)
   Data losses:                        Suspected integrity impact — forensic review in progress
   Geographical spread:                Germany (single Member State)
   Economic impact:                    Estimated above 0.1% of prior-year turnover

4. Immediate actions taken
   - Isolation of affected database VMs and jump-host segment
   - Activation of incident response playbook IR-RANSOM-01
   - Engagement of external DFIR retainer (Mandiant)
   - Backup restoration initiated from last verified snapshot (2026-06-30 23:00 CET)
   - Customer communication issued via mobile app banner and status page

5. Preliminary root cause
   Under investigation. Working hypothesis: compromised MSP jump-host credentials
   used for lateral movement to database tier.

6. Cross-regime notifications in progress
   - NIS2 early warning to BSI CSIRT (due within 24h of awareness)
   - GDPR Art. 33 assessment (due within 72h of detection if confirmed)

Contact: incident-response@neopay.example — +49 30 000 000
Prepared by: M. Keller, ICT Risk & Compliance`;

export const auditTrail = [
  { at: "10:41:02", event: "Narrative ingested (1,284 chars)" },
  { at: "10:41:04", event: "Entity-function register cross-checked (ledger, SEPA batch → critical)" },
  { at: "10:41:06", event: "RTS Art. 1–8 criteria evaluated" },
  { at: "10:41:07", event: "Cross-regime timeline map generated (DORA/NIS2/GDPR/PSD2)" },
  { at: "10:41:08", event: "Draft notification composed against BaFin template v3.2" },
];