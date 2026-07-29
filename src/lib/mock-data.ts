import type { DoraFacts } from "@/lib/dora-rules";

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

export type SampleScenario = {
  id: string;
  label: string;
  entity: string;
  sector: string;
  classification: "major" | "not_major";
  bucket: "clearly_major" | "boundary" | "clearly_not_major";
  // Full structured facts as computed by the generator — lets the app's
  // rules engine (src/lib/dora-rules.ts) classify this scenario for real
  // instead of showing a static mock result.
  facts: DoraFacts;
  narrative: string;
};

// Drawn from a 989-scenario evaluation set generated against RTS 2024/1772
// Art. 6/8/9 (deterministic rules engine) with gap-aware coverage sampling
// across sector, root cause, threshold distance, and narrative style. Ground
// truth (classification, bucket) was computed from structured facts before
// the narrative was written, so grading one never contaminates the other.
export const sampleScenarios: SampleScenario[] = [
  {
    id: "harbor-wealth-batch",
    label: "Payments batch reconciliation error",
    entity: "Harbor Wealth",
    sector: "Credit institution",
    classification: "major",
    bucket: "clearly_major",
    facts: {
      entity: "Harbor Wealth",
      sector: "Credit institution (bank)",
      rootCause: "Human/process error",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 16.0,
      numClientsAffected: 17543,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 14.5,
      downtimeHours: 1.3,
      memberStatesAffected: 4,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 160000,
    },
    narrative: `Quick note on the payments batch issue from yesterday for Harbor Wealth — flagging for the file before I forget details. Started around 06:40, wasn't fully resolved until roughly 21:15, so call it 14-15 hours end to end, though the actual service outage itself was much shorter, about 1h20m mid-morning while the overnight reconciliation job was rerun manually after someone applied the wrong config to the batch scheduler (looks like a step got skipped during a routine release, ops picked it up when queue depths looked off).
Impact-wise, around 16% of the client base, roughly 17,500 accounts, saw delayed or duplicate-looking transaction postings, mostly retail. Transaction volumes affected were modest, about 3% of the daily count and value. No counterparties impacted. Four member states saw meaningful client impact, mainly DE, FR, NL, and IE. No signs of unauthorised access, no data integrity issues, nothing flagged to press, no complaint pattern yet. Rough cost estimate, including remediation and client goodwill credits, sits around EUR 160k. No relevant client is involved.`,
  },
  {
    id: "north-payments-settlement",
    label: "Settlement queue cascade after bad config push",
    entity: "North Payments",
    sector: "E-money institution",
    classification: "major",
    bucket: "clearly_major",
    facts: {
      entity: "North Payments",
      sector: "E-money institution",
      rootCause: "Human/process error",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 16.0,
      numClientsAffected: 21077,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: true,
      regulatoryRequirementsAtRisk: true,
      materialClientLossLikely: false,
      durationHours: 38.4,
      downtimeHours: 3.3,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 160000,
    },
    narrative: `Quick note on the payments processing hiccup from Tuesday night into Wednesday — still piecing together the finer details but wanted to get something down. Looks like a config change during the routine batch job on Monday evening went out without proper validation, and it cascaded into the settlement queue overnight. Service was properly down for somewhere around three-ish hours early Wednesday morning, but the whole mess dragged on for closer to a day and a half before things were fully reconciled and stable again. A decent chunk of our client base got hit — we think somewhere in the range of 15-17%, tens of thousands of accounts, mostly unable to see accurate balances or complete transfers for a stretch. Transaction volumes affected were relatively small, low single digits percentage-wise on both count and value. No counterpart institutions seem to have been impacted. We've had a steady trickle of complaints since, nothing to the press thankfully. No signs of any unauthorized access. Cost estimate is still being confirmed, but an early guess lands somewhere near 150-160k all in.`,
  },
  {
    id: "alder-trust-intrusion",
    label: "Credential-abuse intrusion on payments platform",
    entity: "Alder Trust",
    sector: "Credit institution",
    classification: "major",
    bucket: "clearly_major",
    facts: {
      entity: "Alder Trust",
      sector: "Credit institution (bank)",
      rootCause: "Cyberattack (ransomware/intrusion)",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: true,
      pctClientsAffected: 2.8,
      numClientsAffected: 1775,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 7.6,
      downtimeHours: 0.9,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 85000,
    },
    narrative: `Quick note for the file on the Alder Trust event from Tuesday — flagging while it's fresh. Security picked up unusual lateral movement on one of the payment processing servers around 6:40 a.m., and it looked like credential abuse rather than anything external-facing at first. Turned out to be an intrusion attempt that briefly locked out access controls on the retail payments platform, which is core to daily processing. Full resolution took about 7.6 hours end-to-end, though actual service downtime was much shorter, under an hour (roughly 0.9h) once failover kicked in. Roughly 1,775 clients (~2.8% of the base) had delayed or failed transactions — call volume to the helpdesk was mildly elevated but nothing sustained; no repeat complainants were logged. About 3% of the daily transaction count/value is affected. No counterparties were impacted; no data confidentiality/integrity issues were confirmed after forensics. Only one member state is in scope. No press interest so far. Cost estimate from ops + remediation is landing around EUR 85k. IT security is still finishing the root cause write-up; will circulate once done.`,
  },
  {
    id: "solaris-markets-batch",
    label: "Batch deploy corrupts transaction records",
    entity: "Solaris Markets",
    sector: "Credit institution",
    classification: "major",
    bucket: "boundary",
    facts: {
      entity: "Solaris Markets",
      sector: "Credit institution (bank)",
      rootCause: "Internal system/software failure",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 4.9,
      numClientsAffected: 9140,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 2.0,
      downtimeHours: 1.1,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: true,
      costsLossesEUR: 115000,
    },
    narrative: `Quick note on yesterday's payments outage for the file — Solaris Markets, retail/business banking side. Started around 09:40, engineering flagged it about 10:15 once queue backlogs started tripping alerts on the payments processing service. Looks like a batch job update pushed overnight introduced a config mismatch that corrupted some transaction records mid-processing — nothing pointing to any outside access, just a bad deploy interacting badly with the reconciliation layer. Service was effectively down for about an hour before the rollback took hold, with full resolution roughly two hours after the onset.
Rough numbers so far: around 9,100 clients touched, call it 5% of the base, all domestic (single member state). No counterparties are affected that we can see. Transaction volumes impacted look like ~3% of both daily count and value — some records had integrity issues, so data quality is part of this too, not just availability. No relevant/designated clients are caught up in it. Cost estimate from ops is hovering near €115k, including remediation hours. No press interest, no complaint pattern yet, legal thinks no regulatory exposure. Will update once the recon team finishes checking the affected batch files.`,
  },
  {
    id: "harbor-markets-failover",
    label: "Overnight batch failure, multi-country impact",
    entity: "Harbor Markets",
    sector: "Credit institution",
    classification: "major",
    bucket: "boundary",
    facts: {
      entity: "Harbor Markets",
      sector: "Credit institution (bank)",
      rootCause: "Internal system/software failure",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 16.0,
      numClientsAffected: 15694,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 12.4,
      downtimeHours: 1.2,
      memberStatesAffected: 3,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 6978,
    },
    narrative: `Quick note on yesterday's disruption for the file before I forget details. Started around 06:50 and dragged on until roughly 19:10, so call it 12-13 hours end to end, though the actual service outage itself was much shorter — about an hour and change, roughly 1.2 hours, before failover kicked in. Root cause traced back to an internal batch job that choked during an overnight update, nothing external, no sign of anyone poking around from outside. Payments processing (retail + SME) was the critical function hit, and it's not one requiring separate authorisation itself, just underlying infra. Roughly 15,700 clients are affected, so around 16% of the book, mostly noticing failed or delayed transfers. No counterparties really touched, maybe a rounding error's worth. Transaction volumes affected were small, ~3% of both the daily count and value. Impact was felt across three member states. No data integrity issues, no complaints pattern yet, no press interest so far. Costs are looking to land near €7k once IT overtime is tallied.`,
  },
  {
    id: "meridian-financial-config",
    label: "Stale config delays order-matching confirmations",
    entity: "Meridian Financial",
    sector: "Crypto-asset service provider",
    classification: "not_major",
    bucket: "boundary",
    facts: {
      entity: "Meridian Financial",
      sector: "Crypto-asset service provider",
      rootCause: "Human/process error",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 1.2,
      numClientsAffected: 525,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 13.9,
      downtimeHours: 0.9,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 85000,
    },
    narrative: `Quick note on yesterday's issue for the file before I forget the details. Overnight batch config push for the client order-matching service got applied with a stale parameter set — looks like whoever ran the deployment grabbed last month's config file instead of the updated one, so no bad actors involved, just a mix-up in the release process. Impact started around 22:10 and wasn't fully resolved until roughly noon today, so call it just under 14 hours end-to-end, though actual service downtime was short, under an hour (~55 mins) while we rolled back and restarted matching. Around 525 clients (~1.2% of the base) saw delayed or failed order confirmations; roughly 3% of the daily transaction count and value were touched. No counterparties are affected that we can see; no VIP/relevant clients in the impacted set. No data integrity or confidentiality concerns; nothing leaked or altered. No press interest, no complaint pattern yet. Only Ireland shows a meaningful impact. Rough cost estimate incl. remediation and staff time is ~EUR 85k. Don't think this trips any reporting threshold, but flagging for review anyway.`,
  },
  {
    id: "veridian-bank-power",
    label: "Data centre power flicker, prolonged failover",
    entity: "Veridian Bank",
    sector: "Credit institution",
    classification: "major",
    bucket: "boundary",
    facts: {
      entity: "Veridian Bank",
      sector: "Credit institution (bank)",
      rootCause: "Natural or infrastructure event (power, network)",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 16.0,
      numClientsAffected: 24169,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 38.4,
      downtimeHours: 3.8,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 63620,
    },
    narrative: `Quick note for the file before I forget the details. We had a brief blip in one of the regional data centre feeds Tuesday night — it looked like a power flicker at the primary site, which knocked out redundancy to one of the network segments feeding the payments front-end. The initial call from ops was that it was minor, quickly resolved once the backup circuit kicked in, and everyone went home. Turns out the failover didn't fully stabilise until well into Wednesday afternoon, so actual service downtime came to around 3.8 hours, spread oddly across two windows, with the whole mess not closing out until roughly 38 hours after it started. Card and transfer processing was affected for about 3% of daily volume and value, and we're seeing around 24,169 retail clients, call it 16% of the base, who had failed logins or delayed payment confirmations. No counterparties involved, no sign of any data exposure. Facilities is still chasing the generator vendor. Cost estimate so far: EUR 63,620.`,
  },
  {
    id: "ferro-insurance-config",
    label: "Payment rails config rollback issue",
    entity: "Ferro Insurance",
    sector: "E-money institution",
    classification: "not_major",
    bucket: "clearly_not_major",
    facts: {
      entity: "Ferro Insurance",
      sector: "E-money institution",
      rootCause: "Human/process error",
      serviceCriticalOrImportant: true,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 3.2,
      numClientsAffected: 6907,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: true,
      repetitiveComplaints: true,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 1.6,
      downtimeHours: 0.7,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 41727,
    },
    narrative: `Quick note for the file on yesterday's payment processing hiccup before I forget the details. Started around 2:40 pm, ran roughly an hour and a half all told, though the actual outage where the payment rails were down was shorter, maybe 40-45 mins tops. Turned out someone pushed a config change during the maintenance window that wasn't fully rolled back correctly - still confirming exact sequence with the platform team, but it looks like a straightforward process slip rather than anything nastier, no signs of anyone poking around who shouldn't be.
Impacted a decent slice of the client base, low single digits percent-wise, somewhere in the low thousands of accounts, we think, transactions affected similarly small percentage-wise, but obviously still noticeable given our volumes. No counterparty exposure to speak of. We've already had a handful of complaints trickling in through the call centre, and one customer posted something on Twitter that's getting a bit of traction, so heads up, comms may want to watch that. No data integrity concerns. Cost estimate is still being firmed up, but is landing somewhere around the 40k mark.`,
  },
  {
    id: "harbor-markets-outage",
    label: "Regional power blip cascades to network",
    entity: "Harbor Markets",
    sector: "Credit institution",
    classification: "not_major",
    bucket: "clearly_not_major",
    facts: {
      entity: "Harbor Markets",
      sector: "Credit institution (bank)",
      rootCause: "Natural or infrastructure event (power, network)",
      serviceCriticalOrImportant: false,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 16.0,
      numClientsAffected: 18535,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 38.4,
      downtimeHours: 3.6,
      memberStatesAffected: 3,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 10822,
    },
    narrative: `Quick note on the outage from yesterday for the file. Started early Tuesday, roughly 38 hours total before everything was fully back to normal, though actual customer-facing downtime was much shorter, about 3.5-4 hours. Root cause traced back to a regional power blip at one of the datacentre providers that cascaded into some network flapping - not something on our side config-wise, just bad luck with timing (apparently there was storm activity in the area, which didn't help). No signs of anyone getting in where they shouldn't - this wasn't a security thing. Impact-wise, around 16% of our client base felt something, call it 18.5k customers give or take, mostly login/payment delays. The counterparty side was basically untouched. Transaction volumes affected were low, roughly 3% of the daily count and value, so nothing major on the balance sheet - looks like total cost lands around 10.8k EUR once we tally support hours and minor reimbursements. Three member states saw a noticeable impact. No press interest so far, no repeat complaints logged, no data integrity concerns. Will update if anything changes.`,
  },
  {
    id: "solaris-capital-batch",
    label: "Overnight batch glitch, gate not met",
    entity: "Solaris Capital",
    sector: "Credit institution",
    classification: "not_major",
    bucket: "clearly_not_major",
    facts: {
      entity: "Solaris Capital",
      sector: "Credit institution (bank)",
      rootCause: "Internal system/software failure",
      serviceCriticalOrImportant: false,
      serviceRequiresAuthorisation: false,
      maliciousUnauthorisedAccess: false,
      pctClientsAffected: 16.0,
      numClientsAffected: 14499,
      pctCounterpartsAffected: 0,
      pctTransactionsCountAffected: 3,
      pctTransactionsValueAffected: 3,
      relevantClientsAffected: false,
      mediaReflected: false,
      repetitiveComplaints: false,
      regulatoryRequirementsAtRisk: false,
      materialClientLossLikely: false,
      durationHours: 38.4,
      downtimeHours: 3.3,
      memberStatesAffected: 1,
      adverseImpactDataIntegrityEtc: false,
      costsLossesEUR: 160000,
    },
    narrative: `Quick note for the file before I forget the details — this is the Solaris Capital thing from Tuesday night into Wednesday. Started around 11pm-ish with some kind of glitch in one of the internal batch jobs that feeds the retail platform; nobody flagged it until the morning shift noticed odd account displays. Actual service was down for a few hours, call it somewhere around 3-ish, but the whole mess dragged on for closer to a day and a half before things were fully confirmed stable again. IT swears there was no external tampering involved, just an internal process choking on itself. Client impact was noticeable — a decent chunk, maybe fifteen-sixteen percent of the base, give or take, saw something odd, though most probably didn't even notice or complain about it afterward. Counterparties basically untouched. A small slice of daily transactions, low single digits, got delayed or miscounted, still being reconciled honestly. No data integrity concerns were raised. Costs are still rough, but we're pencilling in somewhere near 150-160k for now. Only affected our home market, as far as we can tell.`,
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