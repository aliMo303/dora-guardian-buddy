#!/usr/bin/env -S npx tsx
// Regression test for the sample-scenario dataset against the RTS 2024/1772
// rules engine (src/lib/dora-rules.ts). Each case asserts the full verdict —
// classification, gate, met criteria, and the specific reason — not just
// major/not-major, so a change to the engine that gets the right answer for
// the wrong reason still fails loudly.
//
// Run: npx tsx scripts/verify-classifications.ts

import { sampleScenarios } from "../src/lib/mock-data";
import { evaluate, type CriterionKey } from "../src/lib/dora-rules";

interface TestCase {
  id: string;
  expectMajor: boolean;
  expectGate: boolean;
  expectMetCount: number;
  expectMetCriteria: CriterionKey[];
  expectReasonIncludes: string;
}

const CASES: TestCase[] = [
  {
    id: "harbor-wealth-batch",
    expectMajor: true,
    expectGate: true,
    expectMetCount: 3,
    expectMetCriteria: ["clients", "geo", "economic"],
    expectReasonIncludes: "Art. 8(1)(b): 3 of 6",
  },
  {
    id: "north-payments-settlement",
    expectMajor: true,
    expectGate: true,
    expectMetCount: 4,
    expectMetCriteria: ["clients", "reputational", "duration", "economic"],
    expectReasonIncludes: "Art. 8(1)(b): 4 of 6",
  },
  {
    id: "alder-trust-intrusion",
    expectMajor: true,
    expectGate: true,
    expectMetCount: 1,
    expectMetCriteria: ["data"],
    expectReasonIncludes: "Art. 8(1)(a)",
  },
  {
    id: "solaris-markets-batch",
    expectMajor: true,
    expectGate: true,
    expectMetCount: 2,
    expectMetCriteria: ["data", "economic"],
    expectReasonIncludes: "Art. 8(1)(b): 2 of 6",
  },
  {
    id: "harbor-markets-failover",
    expectMajor: true,
    expectGate: true,
    expectMetCount: 2,
    expectMetCriteria: ["clients", "geo"],
    expectReasonIncludes: "Art. 8(1)(b): 2 of 6",
  },
  {
    id: "meridian-financial-config",
    expectMajor: false,
    expectGate: true,
    expectMetCount: 0,
    expectMetCriteria: [],
    expectReasonIncludes: "0 of 6 thresholds met",
  },
  {
    id: "veridian-bank-power",
    expectMajor: true,
    expectGate: true,
    expectMetCount: 2,
    expectMetCriteria: ["clients", "duration"],
    expectReasonIncludes: "Art. 8(1)(b): 2 of 6",
  },
  {
    id: "ferro-insurance-config",
    expectMajor: false,
    expectGate: true,
    expectMetCount: 1,
    expectMetCriteria: ["reputational"],
    expectReasonIncludes: "1 of 6 thresholds met",
  },
  {
    id: "harbor-markets-outage",
    expectMajor: false,
    expectGate: false,
    expectMetCount: 3,
    expectMetCriteria: ["clients", "duration", "geo"],
    expectReasonIncludes: "Gate not met",
  },
  {
    id: "solaris-capital-batch",
    expectMajor: false,
    expectGate: false,
    expectMetCount: 3,
    expectMetCriteria: ["clients", "duration", "economic"],
    expectReasonIncludes: "Gate not met",
  },
];

let failures = 0;

for (const tc of CASES) {
  const scenario = sampleScenarios.find((s) => s.id === tc.id);
  if (!scenario) {
    console.log(`FAIL ${tc.id.padEnd(28)} — scenario not found in mock-data.ts`);
    failures++;
    continue;
  }

  const ev = evaluate(scenario.facts);
  const metCriteria = (Object.keys(ev.metFlags) as CriterionKey[]).filter((k) => ev.metFlags[k]);
  const problems: string[] = [];

  if (ev.major !== tc.expectMajor) {
    problems.push(`major: expected ${tc.expectMajor}, got ${ev.major}`);
  }
  if (ev.gate !== tc.expectGate) {
    problems.push(`gate: expected ${tc.expectGate}, got ${ev.gate}`);
  }
  if (ev.metCount !== tc.expectMetCount) {
    problems.push(`metCount: expected ${tc.expectMetCount}, got ${ev.metCount}`);
  }
  const metSorted = [...metCriteria].sort();
  const expectSorted = [...tc.expectMetCriteria].sort();
  if (JSON.stringify(metSorted) !== JSON.stringify(expectSorted)) {
    problems.push(`met criteria: expected [${expectSorted}], got [${metSorted}]`);
  }
  if (!ev.reason.includes(tc.expectReasonIncludes)) {
    problems.push(`reason: expected to include "${tc.expectReasonIncludes}", got "${ev.reason}"`);
  }
  // Also confirm the scenario's own recorded ground truth agrees with the engine —
  // catches drift if mock-data.ts facts/classification are edited independently.
  const groundTruthMatches = (scenario.classification === "major") === ev.major;
  if (!groundTruthMatches) {
    problems.push(
      `mock-data ground truth (${scenario.classification}) disagrees with engine (${ev.major ? "major" : "not_major"})`,
    );
  }

  if (problems.length === 0) {
    console.log(`OK   ${tc.id.padEnd(28)} ${ev.major ? "MAJOR    " : "NOT MAJOR"}  metCount=${ev.metCount} gate=${ev.gate}`);
  } else {
    console.log(`FAIL ${tc.id.padEnd(28)}`);
    problems.forEach((p) => console.log(`       - ${p}`));
    failures++;
  }
}

console.log(`\n${CASES.length - failures}/${CASES.length} test cases passed`);
if (failures > 0) process.exit(1);
