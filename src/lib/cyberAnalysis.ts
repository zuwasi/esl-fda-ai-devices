import type { CyberEvidence, DeviceRecord } from './types';

const SBOM_INDICATORS = [
  'sbom', 'software bill of materials', 'component list',
  'third-party software', 'open source', 'open-source',
  'software composition', 'dependency', 'library list',
  'cyclonedx', 'spdx'
];

const CYBER_RISK_INDICATORS = [
  'cybersecurity', 'cyber risk', 'security risk assessment',
  'vulnerability', 'threat model', 'security assessment',
  'penetration test', 'security testing', 'cryptographic',
  'encryption', 'authentication', 'access control',
  'data protection', 'hipaa', 'privacy'
];

const POSTMARKET_INDICATORS = [
  'postmarket', 'post-market', 'postmarket surveillance',
  'monitoring plan', 'update plan', 'patch management',
  'maintenance plan', 'cybersecurity postmarket'
];

function checkIndicators(text: string, indicators: string[]): boolean {
  const lower = text.toLowerCase();
  return indicators.some(term => lower.includes(term));
}

export function analyzeCyberEvidence(record: DeviceRecord): CyberEvidence {
  const fullText = [
    record.summary || '',
    record.thesis || '',
    record.summary_keywords || '',
    record.concepts || '',
    record.generated_questions || '',
  ].join(' ');

  const decisionDate = record.date_of_final_decision || '';
  const dateObj = new Date(decisionDate);
  const isAfter524B = dateObj >= new Date('2023-12-08');

  const hasSBOM = checkIndicators(fullText, SBOM_INDICATORS);
  const hasCyberRiskAssessment = checkIndicators(fullText, CYBER_RISK_INDICATORS);
  const hasPostmarketPlan = checkIndicators(fullText, POSTMARKET_INDICATORS);

  const section524BApplicable = isAfter524B;

  let score = 0;
  if (hasSBOM) score += 30;
  if (hasCyberRiskAssessment) score += 30;
  if (hasPostmarketPlan) score += 25;
  if (section524BApplicable && hasSBOM && hasCyberRiskAssessment) score += 15;

  const findings: string[] = [];
  if (hasSBOM && hasCyberRiskAssessment && hasPostmarketPlan) {
    findings.push('Comprehensive cybersecurity evidence detected in submission summary');
  } else {
    findings.push('Analysis is based on the AI-generated device summary, not the full FDA submission package. Evidence may be present in the complete submission even if not reflected here.');
    if (section524BApplicable && !hasSBOM) {
      findings.push('SBOM not mentioned in summary. Under \u00a7524B (effective Oct 2023), cyber devices must provide a SBOM \u2014 it is likely included in the full submission but not in this condensed summary.');
    }
    if (section524BApplicable && !hasCyberRiskAssessment) {
      findings.push('Cybersecurity risk assessment not referenced in summary. FDA cybersecurity guidance (2023) expects this for cyber devices \u2014 likely present in the actual submission documentation.');
    }
    if (!section524BApplicable && (!hasSBOM || !hasCyberRiskAssessment)) {
      findings.push('This device was authorized before \u00a7524B took effect. Cybersecurity evidence requirements were less prescriptive at the time.');
    }
    if (!hasPostmarketPlan) {
      findings.push('Postmarket cybersecurity monitoring plan not clearly documented in summary.');
    }
  }

  return {
    hasSBOM,
    hasCyberRiskAssessment,
    hasPostmarketPlan,
    section524BApplicable,
    cyberScore: Math.min(score, 100),
    findings,
  };
}

export function getCyberScoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 50) return 'Moderate';
  if (score >= 25) return 'Limited';
  return 'Not Detected in Summary';
}

export function getCyberScoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#6b7280';
}
