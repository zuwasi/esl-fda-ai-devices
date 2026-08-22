import type { EvidenceRequirement, RiskClassification } from './types';

export function getEvidenceRequirements(
  riskClass: RiskClassification,
  regulatoryPathway: string
): EvidenceRequirement[] {
  const cls = riskClass.iec62304Class;
  const isCyber = riskClass.cyberDevice;

  const requirements: EvidenceRequirement[] = [
    {
      standard: 'IEC 62304 \u00a75.1',
      requirement: 'Software Development Plan',
      applicable: true,
      eslCapability: 'ESL scopes the plan and identifies the minimum complete evidence package.',
      status: 'required',
    },
    {
      standard: 'IEC 62304 \u00a75.3',
      requirement: 'Software Architecture Documentation',
      applicable: true,
      eslCapability: 'ESL reviews and documents architecture, identifying software safety classes.',
      status: 'required',
    },
    {
      standard: 'ISO 14971 + IEC 62304 \u00a77',
      requirement: 'Software Risk Management File',
      applicable: true,
      eslCapability: 'ESL performs risk-based analysis connecting hazards to software causes and controls.',
      status: 'required',
    },
    {
      standard: 'FDA Cybersecurity Guidance (2026)',
      requirement: 'Cybersecurity Risk Assessment',
      applicable: isCyber,
      eslCapability: 'SBOMator\u2122 FDA Edition generates the cybersecurity evidence package.',
      status: isCyber ? 'required' : 'recommended',
    },
    {
      standard: 'FD&C Act \u00a7524B',
      requirement: 'SBOM (CycloneDX format)',
      applicable: isCyber,
      eslCapability: 'SBOMator\u2122 produces machine-readable CycloneDX SBOM with VEX decisions.',
      status: isCyber ? 'required' : 'optional',
    },
    {
      standard: 'MISRA C/C++ or CERT C/C++',
      requirement: 'Static Code Analysis Report',
      applicable: true,
      eslCapability: 'Parasoft C/C++test (T\u00dcV S\u00dcD certified) with ESL remediation \u2014 not just scan-and-leave.',
      status: cls === 'C' ? 'required' : 'recommended',
    },
    {
      standard: 'IEC 62304 \u00a75.5',
      requirement: 'Unit Test Evidence',
      applicable: true,
      eslCapability: 'ESL engineers write and execute unit tests with harnesses, stubs, and on-target testing.',
      status: 'required',
    },
    {
      standard: 'IEC 62304 \u00a75.5 + risk rationale',
      requirement: 'Structural Coverage (Statement / Branch / MC/DC)',
      applicable: true,
      eslCapability: 'Risk-based coverage: statement for Class A, branch for B, MC/DC for C \u2014 with gap justification.',
      status: cls === 'C' ? 'required' : cls === 'B' ? 'recommended' : 'optional',
    },
    {
      standard: 'FDA General Principles of Software Validation',
      requirement: 'Software Validation Evidence',
      applicable: true,
      eslCapability: 'ESL assembles reproducible validation evidence tied to the controlled baseline.',
      status: 'required',
    },
    {
      standard: 'IEC 62304 + ALM',
      requirement: 'Traceability Matrix (Requirements \u2192 Risk \u2192 Tests \u2192 Results)',
      applicable: true,
      eslCapability: 'ESL integrates with Polarion ALM via Parasoft connector \u2014 end-to-end traceable navigation.',
      status: 'required',
    },
    {
      standard: 'FD&C Act \u00a7524B',
      requirement: 'Postmarket Cybersecurity Monitoring Plan',
      applicable: isCyber,
      eslCapability: 'SBOMator\u2122 supports postmarket monitoring and \u00a7524B evidence updates.',
      status: isCyber ? 'required' : 'optional',
    },
    {
      standard: 'CycloneDX + VEX',
      requirement: 'VEX Document (Vulnerability Exploitability Exchange)',
      applicable: isCyber,
      eslCapability: 'SBOMator\u2122 generates VEX decisions with CVSS v4.0 context mapping.',
      status: isCyber ? 'recommended' : 'optional',
    },
  ];

  return requirements;
}

export function getEvidenceChecklist(riskClass: RiskClassification): string {
  const cls = riskClass.iec62304Class;
  const isCyber = riskClass.cyberDevice;
  return [
    'Software Description (IEC 62304 \u00a75.1)',
    'Software Architecture (IEC 62304 \u00a75.3)',
    'Risk Management File (ISO 14971 + IEC 62304 \u00a77)',
    isCyber ? 'SBOM (CycloneDX) \u2014 \u00a7524B requirement' : 'SBOM (recommended)',
    isCyber ? 'Cybersecurity Risk Assessment \u2014 FDA 2026 guidance' : 'Cybersecurity Assessment (if applicable)',
    'Static Analysis Report (MISRA C:2023 / CERT C compliance)',
    cls === 'C' ? 'Unit Tests + MC/DC Coverage (Class C requirement)' : 'Unit Tests + Branch Coverage',
    'Integration Test Results',
    'Traceability Matrix (requirements \u2192 risk \u2192 tests \u2192 results)',
    isCyber ? 'Postmarket Monitoring Plan (\u00a7524B)' : 'Postmarket Plan (if applicable)',
    isCyber ? 'VEX Document' : 'VEX Document (if applicable)',
  ].join('\n');
}
