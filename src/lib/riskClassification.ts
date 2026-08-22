import type { RiskClassification, DeviceRecord } from './types';

function inferRegulatoryPathway(submissionNumber: string): string {
  if (!submissionNumber) return 'Unknown';
  const prefix = submissionNumber.toUpperCase();
  if (prefix.startsWith('K')) return '510(k)';
  if (prefix.startsWith('DEN')) return 'De Novo';
  if (prefix.startsWith('P')) return 'PMA';
  return 'Unknown';
}

export function classifyRisk(record: DeviceRecord): RiskClassification {
  const pathway = inferRegulatoryPathway(record.submission_number || '');
  const panel = (record.panel_lead || record.lead_panel || '').toLowerCase();
  const thesis = (record.thesis || '').toLowerCase();
  const keywords = (record.summary_keywords || '').toLowerCase();
  const fullText = thesis + ' ' + keywords;

  const decisionDate = new Date(record.date_of_final_decision || '2020-01-01');
  const isAfter524B = decisionDate >= new Date('2023-12-08');

  const hasNetworkCapability = fullText.includes('network') || fullText.includes('cloud') ||
    fullText.includes('connect') || fullText.includes('wireless') || fullText.includes('api') ||
    fullText.includes('internet') || fullText.includes('remote');

  const cyberDevice = isAfter524B && hasNetworkCapability;

  let fdaClass: 'I' | 'II' | 'III' = 'II';
  if (pathway === 'PMA') fdaClass = 'III';
  if (pathway === 'De Novo') fdaClass = 'II';
  if (pathway === '510(k)') fdaClass = 'II';

  let iec62304Class: 'A' | 'B' | 'C' = 'B';

  if (pathway === 'PMA' || panel.includes('anesthesiology') || panel.includes('cardiovascular')) {
    iec62304Class = 'C';
  } else if (panel.includes('radiology') || panel.includes('ophthalmology') ||
             panel.includes('neurology') || panel.includes('gastroenterology')) {
    if (fullText.includes('diagnosis') || fullText.includes('detection') || fullText.includes('screening')) {
      iec62304Class = 'B';
    } else if (fullText.includes('treatment') || fullText.includes('therapy') || fullText.includes('intervention')) {
      iec62304Class = 'C';
    }
  } else if (fullText.includes('triage') || fullText.includes('workflow') || fullText.includes('prioritization')) {
    iec62304Class = 'A';
  }

  const rationaleParts: string[] = [];
  rationaleParts.push(`FDA Class ${fdaClass} via ${pathway} pathway`);
  rationaleParts.push(`IEC 62304 Class ${iec62304Class} (software safety classification)`);
  if (cyberDevice) {
    rationaleParts.push('Qualifies as a cyber device under \u00a7524B (post-Dec 2023, networked)');
  } else {
    rationaleParts.push(isAfter524B ? 'Post-\u00a7524B but no clear network capability detected' : 'Authorized before \u00a7524B enforcement');
  }

  return {
    iec62304Class,
    fdaClass,
    rationale: rationaleParts.join('; '),
    cyberDevice,
  };
}

export function getRegulatoryPathway(submissionNumber: string): string {
  return inferRegulatoryPathway(submissionNumber);
}

export function getIec62304ClassLabel(cls: 'A' | 'B' | 'C'): string {
  switch (cls) {
    case 'A': return 'Class A (Low Risk)';
    case 'B': return 'Class B (Moderate Risk)';
    case 'C': return 'Class C (High Risk)';
  }
}

export function getIec62304ClassColor(cls: 'A' | 'B' | 'C'): string {
  switch (cls) {
    case 'A': return '#16a34a';
    case 'B': return '#eab308';
    case 'C': return '#dc2626';
  }
}
