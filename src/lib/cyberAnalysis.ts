import type { CyberEvidence, DeviceRecord, XBomEvidence } from './types';

const SBOM_INDICATORS = [
  'sbom', 'software bill of materials', 'component list',
  'third-party software', 'third-party component', 'open source', 'open-source',
  'software composition', 'dependency', 'library list',
  'cyclonedx', 'spdx',
  'software component', 'software version', 'software package',
  'software library', 'libraries',
];

const CYBER_RISK_INDICATORS = [
  'cybersecurity', 'cyber risk', 'security risk assessment',
  'vulnerability', 'threat model', 'security assessment',
  'penetration test', 'security testing', 'cryptographic',
  'encryption', 'authentication', 'access control',
  'data protection', 'hipaa', 'privacy',
  'cyber', 'security', 'system security', 'data security',
  'network security', 'security mechanism', 'security feature',
  'password', 'biometric', 'de-identification', 'deidentification',
  'anonymiz', 'pseudonym', 'decrypt', 'firewall', 'antivirus',
  'malware', 'ransomware', 'TLS', 'SSL', 'VPN', 'AES',
];

const POSTMARKET_INDICATORS = [
  'postmarket', 'post-market', 'postmarket surveillance',
  'monitoring plan', 'update plan', 'patch management',
  'maintenance plan', 'cybersecurity postmarket',
  'post approval', 'post-approval', 'monitoring',
  'surveillance', 'software update', 'real-world',
  'real world', 'ongoing monitoring',
];

// ─── xBOM indicators (CycloneDX / OWASP ECMA-424 ecosystem) ───

const MLBOM_INDICATORS = [
  'training data', 'training set', 'model training', 'machine learning',
  'deep learning', 'neural network', 'algorithm', 'dataset', 'data set',
  'ground truth', 'validation set', 'test set', 'model performance',
  'model validation', 'model version', 'retraining', 'drift',
  'bias', 'fairness', 'explainability', 'interpretability',
  'annotation', 'labeling', 'model architecture', 'inference',
  'training pipeline', 'feature extraction', 'preprocessing',
];

const CBOM_INDICATORS = [
  'cryptograph', 'encryption', 'decrypt', 'AES', 'RSA', 'SHA',
  'TLS', 'SSL', 'key management', 'certificate', 'digital signature',
  'hash', 'random number', 'PRNG', 'cipher', 'key exchange',
  'public key', 'private key', 'symmetric', 'asymmetric',
];

const HBOM_INDICATORS = [
  'hardware', 'processor', 'CPU', 'GPU', 'TPU', 'sensor', 'camera',
  'embedded', 'firmware', 'FPGA', 'ASIC', 'SoC', 'microcontroller',
  'MCU', 'edge device', 'on-device', 'edge computing',
];

const SAASBOM_INDICATORS = [
  'cloud', 'SaaS', 'API', 'web service', 'server', 'hosted',
  'remote', 'internet', 'network', 'connectivity', 'wireless',
  'bluetooth', 'Wi-Fi', 'cellular', '5G', 'LTE', 'data center',
  'platform', 'backend', 'infrastructure',
];

const VDR_VEX_INDICATORS = [
  'vulnerab', 'CVE', 'security advisory', 'security patch',
  'security update', 'disclosure', 'exploit', 'patch management',
  'bug fix', 'security fix', 'responsible disclosure',
  'security bulletin', 'known vulnerability',
];

const OBOM_INDICATORS = [
  'configuration', 'runtime', 'deployment', 'environment',
  'operational', 'production environment', 'container',
  'docker', 'kubernetes', 'orchestration', 'infrastructure as code',
  'runtime configuration', 'deployment manifest',
];

const XBOM_TYPES: { type: string; fullName: string; description: string; indicators: string[] }[] = [
  { type: 'SBOM', fullName: 'Software Bill of Materials', description: 'Software components, libraries, and dependencies', indicators: SBOM_INDICATORS },
  { type: 'ML-BOM', fullName: 'Machine Learning Bill of Materials', description: 'ML models, training data, algorithms, and performance metrics', indicators: MLBOM_INDICATORS },
  { type: 'SaaSBOM', fullName: 'Software-as-a-Service Bill of Materials', description: 'Cloud services, APIs, and external service dependencies', indicators: SAASBOM_INDICATORS },
  { type: 'HBOM', fullName: 'Hardware Bill of Materials', description: 'Hardware components, processors, sensors, and embedded systems', indicators: HBOM_INDICATORS },
  { type: 'CBOM', fullName: 'Cryptography Bill of Materials', description: 'Cryptographic algorithms, keys, and protocols', indicators: CBOM_INDICATORS },
  { type: 'VDR/VEX', fullName: 'Vulnerability Disclosure Report / Vulnerability Exploitability eXchange', description: 'Vulnerability disclosure, patch management, and exploitability context', indicators: VDR_VEX_INDICATORS },
  { type: 'OBOM', fullName: 'Operations Bill of Materials', description: 'Runtime configuration, deployment environment, and operational dependencies', indicators: OBOM_INDICATORS },
];

function checkIndicators(text: string, indicators: string[]): boolean {
  const lower = text.toLowerCase();
  return indicators.some(term => lower.includes(term));
}

function findMatchingIndicators(text: string, indicators: string[]): string[] {
  const lower = text.toLowerCase();
  return indicators.filter(term => lower.includes(term));
}

export function analyzeCyberEvidence(record: DeviceRecord): CyberEvidence {
  const fullText = [
    record.summary || '',
    record.thesis || '',
    record.summary_keywords || '',
    record.concepts || '',
    record.generated_questions || '',
  ].join(' ');
  return analyzeCyberEvidenceFromText(record, fullText);
}

export function analyzeCyberEvidenceFromText(record: DeviceRecord, text: string): CyberEvidence {
  const fullText = text;

  const decisionDate = record.date_of_final_decision || '';
  const dateObj = new Date(decisionDate);
  const isAfter524B = dateObj >= new Date('2023-12-08');

  const hasSBOM = checkIndicators(fullText, SBOM_INDICATORS);
  const hasCyberRiskAssessment = checkIndicators(fullText, CYBER_RISK_INDICATORS);
  const hasPostmarketPlan = checkIndicators(fullText, POSTMARKET_INDICATORS);

  const section524BApplicable = isAfter524B;

  // Build xBOM evidence
  const xbom: XBomEvidence[] = XBOM_TYPES.map(x => {
    const matching = findMatchingIndicators(fullText, x.indicators);
    return {
      type: x.type,
      fullName: x.fullName,
      description: x.description,
      detected: matching.length > 0,
      indicators: matching.slice(0, 5),
    };
  });

  // Score: base cyber score + xBOM diversity bonus
  let score = 0;
  if (hasSBOM) score += 20;
  if (hasCyberRiskAssessment) score += 20;
  if (hasPostmarketPlan) score += 15;
  if (section524BApplicable && hasSBOM && hasCyberRiskAssessment) score += 10;

  // xBOM diversity: each detected BOM type adds points (max 35 from xBOM)
  const xbomDetectedCount = xbom.filter(x => x.detected).length;
  score += Math.min(xbomDetectedCount * 5, 35);

  score = Math.min(score, 100);

  const findings: string[] = [];
  const sourceLabel = text === [
    record.summary || '', record.thesis || '', record.summary_keywords || '',
    record.concepts || '', record.generated_questions || '',
  ].join(' ') ? 'AI-generated device summary' : 'full FDA Summary PDF';

  if (sourceLabel === 'AI-generated device summary') {
    findings.push('Analysis is based on the AI-generated device summary, not the full FDA submission package. Click "Analyze Full FDA PDF" below to scan the actual submission document.');
  }

  const detectedTypes = xbom.filter(x => x.detected).map(x => x.type);
  const missingTypes = xbom.filter(x => !x.detected).map(x => x.type);

  if (detectedTypes.length > 0) {
    findings.push('Evidence of ' + detectedTypes.join(', ') + ' detected in ' + sourceLabel + '.');
  }

  if (section524BApplicable && !hasSBOM) {
    findings.push('SBOM not mentioned in ' + sourceLabel + '. Under \u00a7524B (effective Oct 2023), cyber devices must provide a SBOM.');
  }
  if (section524BApplicable && !hasCyberRiskAssessment) {
    findings.push('Cybersecurity risk assessment not referenced in ' + sourceLabel + '. FDA cybersecurity guidance (2023) expects this for cyber devices.');
  }
  if (!section524BApplicable && (!hasSBOM || !hasCyberRiskAssessment)) {
    findings.push('This device was authorized before \u00a7524B took effect. Cybersecurity evidence requirements were less prescriptive at the time.');
  }
  if (!hasPostmarketPlan) {
    findings.push('Postmarket cybersecurity monitoring plan not clearly documented in ' + sourceLabel + '.');
  }
  if (missingTypes.length > 0) {
    findings.push('Not detected in ' + sourceLabel + ': ' + missingTypes.join(', ') + '. These may be present in the full FDA submission.');
  }

  return {
    hasSBOM,
    hasCyberRiskAssessment,
    hasPostmarketPlan,
    section524BApplicable,
    cyberScore: score,
    findings,
    xbom,
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
