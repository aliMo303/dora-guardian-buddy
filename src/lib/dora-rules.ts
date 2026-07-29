// Deterministic RTS 2024/1772 Art. 6/8/9 classification engine — ported 1:1
// from the scenario generator's evaluate() (same logic used to compute the
// ground truth for every sample scenario in mock-data.ts). This is what
// actually decides "major or not" in this app; nothing here is guessed.

export interface DoraFacts {
  entity: string;
  sector: string;
  rootCause: string;
  serviceCriticalOrImportant: boolean;
  serviceRequiresAuthorisation: boolean;
  maliciousUnauthorisedAccess: boolean;
  pctClientsAffected: number;
  numClientsAffected: number;
  pctCounterpartsAffected: number;
  pctTransactionsCountAffected: number;
  pctTransactionsValueAffected: number;
  relevantClientsAffected: boolean;
  mediaReflected: boolean;
  repetitiveComplaints: boolean;
  regulatoryRequirementsAtRisk: boolean;
  materialClientLossLikely: boolean;
  durationHours: number;
  downtimeHours: number;
  memberStatesAffected: number;
  adverseImpactDataIntegrityEtc: boolean;
  costsLossesEUR: number;
}

export type CriterionKey = "clients" | "reputational" | "duration" | "geo" | "data" | "economic";

export interface EvaluationResult {
  gate: boolean;
  major: boolean;
  reason: string;
  metCount: number;
  metFlags: Record<CriterionKey, boolean>;
  specialTrigger: boolean; // Art. 8(1)(a) — malicious access alone
}

export function evaluate(f: DoraFacts): EvaluationResult {
  const crit1 =
    f.pctClientsAffected > 10 ||
    f.numClientsAffected > 100_000 ||
    f.pctCounterpartsAffected > 30 ||
    f.pctTransactionsCountAffected > 10 ||
    f.pctTransactionsValueAffected > 10 ||
    f.relevantClientsAffected;
  const crit2 =
    f.mediaReflected ||
    f.repetitiveComplaints ||
    f.regulatoryRequirementsAtRisk ||
    f.materialClientLossLikely;
  const crit3 = f.durationHours > 24 || (f.serviceCriticalOrImportant && f.downtimeHours > 2);
  const crit4 = f.memberStatesAffected >= 2;
  const crit5b = f.maliciousUnauthorisedAccess;
  const crit5 = f.adverseImpactDataIntegrityEtc || crit5b;
  const crit6 = f.costsLossesEUR > 100_000;
  const gate = f.serviceCriticalOrImportant || f.serviceRequiresAuthorisation || f.maliciousUnauthorisedAccess;

  const metFlags: Record<CriterionKey, boolean> = {
    clients: crit1,
    reputational: crit2,
    duration: crit3,
    geo: crit4,
    data: crit5,
    economic: crit6,
  };
  const metCount = Object.values(metFlags).filter(Boolean).length;
  const twoOrMore = metCount >= 2;
  const major = gate && (crit5b || twoOrMore);

  let reason: string;
  if (!gate) {
    reason =
      "Gate not met (Art. 6): incident does not affect a critical/important function, an authorised/supervised service, or involve malicious access — not reportable regardless of other criteria.";
  } else if (crit5b) {
    reason = "Art. 8(1)(a): malicious unauthorised access alone is sufficient once the Art. 6 gate is met.";
  } else if (twoOrMore) {
    reason = `Art. 8(1)(b): ${metCount} of 6 materiality thresholds met (≥2 required).`;
  } else {
    reason = `Gate met, but only ${metCount} of 6 thresholds met (2 required, and no standalone trigger).`;
  }

  return { gate, major, reason, metCount, metFlags, specialTrigger: crit5b };
}

// --- UI-facing criteria breakdown -------------------------------------------------

export interface CriterionRow {
  key: string;
  title: string;
  citation: string;
  rating: string;
  confidence: number;
  reasoning: string;
  met: boolean;
}

// Confidence is a simplified proxy for "how far from the threshold boundary
// the underlying numbers sit" — not a model-calibrated score. Near a
// threshold reads as lower confidence; far from it (in either direction)
// reads as higher confidence.
function marginConfidence(ratio: number): number {
  const distance = Math.abs(ratio - 1);
  return Math.round(Math.min(97, 60 + distance * 55));
}

const eur = (n: number) => `€${Math.round(n).toLocaleString("en-US")}`;

export function buildCriteriaBreakdown(f: DoraFacts, ev: EvaluationResult): CriterionRow[] {
  const rows: CriterionRow[] = [];

  rows.push({
    key: "gate",
    title: "Criticality Gate",
    citation: "DORA Art. 6 · RTS Art. 3",
    met: ev.gate,
    rating: ev.gate
      ? f.maliciousUnauthorisedAccess
        ? "Malicious access gate"
        : f.serviceCriticalOrImportant
          ? "Critical/important function"
          : "Authorised/supervised service"
      : "No critical/important function, authorised service, or malicious access",
    confidence: ev.gate ? 92 : 88,
    reasoning: ev.gate
      ? `Affected service is treated as ${f.serviceCriticalOrImportant ? "a critical/important function" : "an authorised/supervised service"} per the entity's ICT function register${f.maliciousUnauthorisedAccess ? "; malicious unauthorised access independently satisfies the gate" : ""}. Article 6 gate is met, so materiality thresholds below are in scope.`
      : "Neither a critical/important function nor an authorised/supervised service is implicated, and no malicious access occurred. Article 6 gate is not met — not reportable as major regardless of downstream thresholds.",
  });

  const clientsRatio = Math.max(
    f.pctClientsAffected / 10,
    f.numClientsAffected / 100_000,
    f.pctCounterpartsAffected / 30,
    f.pctTransactionsCountAffected / 10,
    f.pctTransactionsValueAffected / 10,
    f.relevantClientsAffected ? 1.5 : 0,
  );
  rows.push({
    key: "clients",
    title: "Clients, Counterparts & Transactions",
    citation: "RTS Art. 9(1)",
    met: ev.metFlags.clients,
    rating: `${f.pctClientsAffected}% clients (~${f.numClientsAffected.toLocaleString()}) · ${f.pctTransactionsCountAffected}% txn count · ${f.pctTransactionsValueAffected}% txn value`,
    confidence: marginConfidence(clientsRatio),
    reasoning: `Threshold requires >10% of clients, >100,000 clients, >30% of counterparts, or >10% of transaction count/value. Observed: ${f.pctClientsAffected}% of clients (${f.numClientsAffected.toLocaleString()} accounts), ${f.pctCounterpartsAffected}% counterparts, ${f.pctTransactionsCountAffected}%/${f.pctTransactionsValueAffected}% of transaction count/value.${f.relevantClientsAffected ? " A specially-identified relevant client is also affected." : ""}`,
  });

  rows.push({
    key: "reputational",
    title: "Reputational Impact",
    citation: "RTS Art. 9(2) · Art. 2(a)–(d)",
    met: ev.metFlags.reputational,
    rating: ev.metFlags.reputational ? "One or more reputational flags raised" : "No reputational flags raised",
    confidence: 68,
    reasoning: `Media coverage: ${f.mediaReflected ? "yes" : "no"}. Repetitive complaints: ${f.repetitiveComplaints ? "yes" : "no"}. At risk of failing regulatory requirements: ${f.regulatoryRequirementsAtRisk ? "yes" : "no"}. Material client/counterpart loss likely: ${f.materialClientLossLikely ? "yes" : "no"}. Modeled as four flat, unweighted flags — a known simplification pending a graded expert rubric.`,
  });

  const durationRatio = Math.max(
    f.durationHours / 24,
    f.serviceCriticalOrImportant ? f.downtimeHours / 2 : 0,
  );
  rows.push({
    key: "duration",
    title: "Duration & Service Downtime",
    citation: "RTS Art. 9(3)",
    met: ev.metFlags.duration,
    rating: `${f.durationHours}h total · ${f.downtimeHours}h downtime`,
    confidence: marginConfidence(durationRatio),
    reasoning: `Threshold requires total duration >24h, or (for a critical/important function) service downtime >2h. Observed: ${f.durationHours}h total incident duration, ${f.downtimeHours}h of actual service downtime on a ${f.serviceCriticalOrImportant ? "critical/important" : "non-critical"} function.`,
  });

  rows.push({
    key: "geo",
    title: "Geographical Spread",
    citation: "RTS Art. 9(4)",
    met: ev.metFlags.geo,
    rating: `${f.memberStatesAffected} member state${f.memberStatesAffected === 1 ? "" : "s"}`,
    confidence: f.memberStatesAffected === 2 ? 70 : 90,
    reasoning: `Threshold requires significant impact in ≥2 EU member states. Observed impact in ${f.memberStatesAffected} member state${f.memberStatesAffected === 1 ? "" : "s"}.`,
  });

  rows.push({
    key: "data",
    title: "Data Losses",
    citation: "RTS Art. 9(5) · Art. 8(1)(a)",
    met: ev.metFlags.data,
    rating: ev.specialTrigger
      ? "Malicious unauthorised access confirmed"
      : f.adverseImpactDataIntegrityEtc
        ? "Adverse data impact confirmed"
        : "No adverse data impact",
    confidence: ev.specialTrigger ? 95 : 80,
    reasoning: ev.specialTrigger
      ? "Successful malicious unauthorised access occurred — this alone satisfies Art. 8(1)(a) once the Article 6 gate is met, independent of the 2-of-6 count."
      : `Adverse impact on data availability, authenticity, integrity, or confidentiality affecting business objectives or regulatory compliance: ${f.adverseImpactDataIntegrityEtc ? "yes" : "no"}.`,
  });

  const economicRatio = f.costsLossesEUR / 100_000;
  rows.push({
    key: "economic",
    title: "Economic Impact",
    citation: "RTS Art. 9(6)",
    met: ev.metFlags.economic,
    rating: eur(f.costsLossesEUR),
    confidence: marginConfidence(economicRatio),
    reasoning: `Threshold requires direct and indirect costs/losses >€100,000. Estimated costs and losses (remediation, business impact, goodwill): ${eur(f.costsLossesEUR)}.`,
  });

  return rows;
}

// --- Cross-regime overlap ----------------------------------------------------------
// Simplified illustrative heuristics for demo purposes — a real cross-regime
// mapping would need each regime's own materiality test applied independently,
// not derived from the DORA outcome. Not a substitute for legal analysis.

export interface OverlapRegime {
  key: string;
  name: string;
  authority: string;
  deadline: string;
  hours: number;
  triggered: boolean;
  note: string;
}

export function buildOverlapRegimes(f: DoraFacts, ev: EvaluationResult): OverlapRegime[] {
  const nis2Triggered = f.serviceCriticalOrImportant && (ev.major || f.durationHours > 24);
  const gdprTriggered = f.adverseImpactDataIntegrityEtc || f.maliciousUnauthorisedAccess;
  const psd2Triggered = ev.metFlags.clients && ev.major;

  return [
    {
      key: "dora",
      name: "DORA — Initial Notification",
      authority: "National competent authority (BaFin, DE)",
      deadline: "4 hours from classification",
      hours: 4,
      triggered: ev.major,
      note: ev.major
        ? "Clock starts on confirmation of major classification."
        : "Not classified as major — no DORA initial notification required.",
    },
    {
      key: "nis2",
      name: "NIS2 — Early Warning",
      authority: "National CSIRT / competent authority",
      deadline: "24 hours from awareness",
      hours: 24,
      triggered: nis2Triggered,
      note: nis2Triggered
        ? "Significant incident affecting a critical/important function — early warning likely required."
        : "Impact on a critical/important function not significant enough to independently trigger NIS2 — monitor.",
    },
    {
      key: "gdpr",
      name: "GDPR — Personal Data Breach",
      authority: "Data protection authority",
      deadline: "72 hours from detection",
      hours: 72,
      triggered: gdprTriggered,
      note: gdprTriggered
        ? "Adverse impact on data integrity/confidentiality or malicious access detected — Art. 33 assessment likely required."
        : "No adverse data impact or unauthorised access identified — GDPR notification unlikely to be required.",
    },
    {
      key: "psd2",
      name: "PSD2 — Major Operational Incident",
      authority: "National competent authority / EBA guidelines",
      deadline: "Immediate initial report",
      hours: 4,
      triggered: psd2Triggered,
      note: psd2Triggered
        ? "Client/transaction impact combined with a major DORA classification suggests the PSD2 major-incident threshold is also met."
        : "Client/transaction impact currently below what would independently trigger a PSD2 major-incident report. Monitor.",
    },
  ];
}

// --- Draft notification -------------------------------------------------------------

export function buildDraftNotification(
  f: DoraFacts,
  ev: EvaluationResult,
  refId: string,
): string {
  const now = "2026-07-01";
  return `${ev.major ? "INITIAL NOTIFICATION — MAJOR ICT-RELATED INCIDENT" : "INTERNAL CLASSIFICATION RECORD — INCIDENT ASSESSED NOT MAJOR"}
Regulation (EU) 2022/2554 (DORA)${ev.major ? ", Article 19(4)(a)" : ""}

1. Reporting entity
   Name:                ${f.entity}
   Sector:              ${f.sector}
   Competent authority: National competent authority (BaFin, DE)

2. Incident identification
   Internal reference:  ${refId}
   Date detected:       ${now}
   Root cause category: ${f.rootCause}

3. Classification summary (RTS 2024/1772, Art. 6/8/9)
   Criticality gate:                    ${ev.gate ? "MET" : "NOT MET"}
   Clients / counterparts / txns:       ${ev.metFlags.clients ? "MET" : "not met"} — ${f.pctClientsAffected}% clients, ${f.numClientsAffected.toLocaleString()} accounts
   Reputational impact:                 ${ev.metFlags.reputational ? "MET" : "not met"}
   Duration / service downtime:         ${ev.metFlags.duration ? "MET" : "not met"} — ${f.durationHours}h total, ${f.downtimeHours}h downtime
   Geographical spread:                 ${ev.metFlags.geo ? "MET" : "not met"} — ${f.memberStatesAffected} member state(s)
   Data losses:                         ${ev.metFlags.data ? "MET" : "not met"}${ev.specialTrigger ? " (malicious access — standalone trigger)" : ""}
   Economic impact:                     ${ev.metFlags.economic ? "MET" : "not met"} — ${eur(f.costsLossesEUR)}

4. Classification
   ${ev.major ? "MAJOR INCIDENT — reportable under DORA Art. 19" : "NOT MAJOR — no DORA initial notification required"}
   Reason: ${ev.reason}

5. Next steps
   ${ev.major
     ? "Reviewer sign-off required before the legal 4-hour clock starts. Cross-regime notifications (NIS2/GDPR/PSD2) evaluated in parallel."
     : "No further DORA notification required. Continue monitoring in case facts change materially."}

Prepared by: S. Ivanova, ICT Risk & Compliance (2nd line)`;
}
