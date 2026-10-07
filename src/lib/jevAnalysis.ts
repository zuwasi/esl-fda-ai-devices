import type { DeviceRecord } from './types';
import { fetchPdfText } from './pdfText';

/**
 * Jev (TypeSafe AI System One model) analysis of FDA letters.
 *
 * Jev cannot generate text: it returns typed decisions (choice / score / noul)
 * with calibrated probabilities. We ask parallel yes/no questions per regulatory
 * concern category plus one complexity score, against the letter's full text.
 * API: POST https://api.typesafe.ai/v1/systemone (TYPESAFE_API_KEY).
 */

export interface JevConcern {
  key: string;
  label: string;
  // noul probability (0-1) that the letter evidences this concern category
  probability: number;
  description: string;
}

export interface JevAnalysisResult {
  submissionNumber: string;
  model: string;
  concerns: JevConcern[];
  regulatoryComplexity: { level: number; description: string } | null;
  pdfUrl: string;
  analyzedCharacters: number;
  analyzedAt: string;
}

export const JEV_CONCERN_QUESTIONS: Record<string, { label: string; instructions: string; description: string }> = {
  clinicalValidation: {
    label: 'Clinical Validation',
    instructions: 'Does the letter evidence limited, absent, or questionable clinical validation data for the device (e.g., no clinical study, small sample, reliance on bench testing alone)?',
    description: 'Clinical data supporting safety and effectiveness may be thin; regulators and competitors may question the evidence base.',
  },
  softwareVV: {
    label: 'Software V&V',
    instructions: 'Does the letter evidence software verification and validation gaps (e.g., no V&V summary, limited testing detail, missing ML model validation methodology)?',
    description: 'Software verification and validation evidence may be incomplete relative to IEC 62304 expectations.',
  },
  aiMlSpecific: {
    label: 'AI/ML Concerns',
    instructions: 'Does the letter evidence AI/ML-specific concerns such as training data limitations, generalizability, model drift, lack of PCCP (predetermined change control plan), or opaque model updates?',
    description: 'The AI/ML component raises questions an FDA reviewer or competitor could probe (dataset bias, drift, update control).',
  },
  cybersecurity: {
    label: 'Cybersecurity Evidence',
    instructions: 'Does the letter evidence cybersecurity evidence gaps such as no SBOM mention, no cybersecurity risk assessment, or no postmarket cyber plan?',
    description: 'Cybersecurity evidence (SBOM, risk management, postmarket plan) may be missing despite Section 524B expectations.',
  },
  predicateDifference: {
    label: 'Predicate Differences',
    instructions: 'Do the technological characteristics differences from the predicate device raise new safety or effectiveness questions that were addressed with limited data?',
    description: 'Differences from the predicate device introduce new questions of safety/effectiveness supported by limited data.',
  },
  humanFactors: {
    label: 'Human Factors',
    instructions: 'Does the letter evidence missing or limited human factors / usability validation for the device or its user interface?',
    description: 'Usability and human-factors validation may be under-documented, a common FDA deficiency area.',
  },
  performanceData: {
    label: 'Performance Data',
    instructions: 'Does the letter evidence limited, absent, or weak performance testing data (bench, phantom, or analytical studies with small scope)?',
    description: 'Performance testing scope may be narrow relative to what reviewers or litigators expect.',
  },
  indicationBreadth: {
    label: 'Indication Breadth',
    instructions: 'Does the letter evidence broad, vague, or expansive indications for use relative to the data provided (possible off-label expansion risk)?',
    description: 'Indications for use may be broader than the supporting evidence, creating off-label or expansion risk.',
  },
};

const NOUL_CRITERIA = {
  true: 'The letter contains explicit evidence of this concern for this device.',
  false: 'The letter shows no evidence of this concern.',
};

const COMPLEXITY_QUESTION = {
  type: 'score' as const,
  instructions: 'How regulatory-complex is this submission: how much engineering and evidence effort would a comparable manufacturer need for software evidence (SBOM, cybersecurity, software V&V, clinical validation)?',
  // Ordered levels; Jev scores from 0 (first level) to 4 (last level).
  criteria: [
    'Minimal: routine software with abundant standard evidence',
    'Low: mostly standard evidence, small gaps',
    'Moderate: typical AI/ML SaMD evidence needs',
    'High: extensive software evidence work required',
    'Very high: complex submission needing exhaustive evidence and remediation',
  ],
};

interface JevNoulAnswer { type: 'noul'; noul: number }
interface JevScoreAnswer { type: 'score'; score: number; probabilities?: unknown }
type JevAnswer = JevNoulAnswer | JevScoreAnswer;

interface JevResponse {
  answers: Record<string, JevAnswer>;
}

const STATE_MAX_CHARS = 60_000; // ~15k tokens, well inside Jev's 32k state budget

/** Shape stored in the precomputed batch file (api/jev_analyses.json). */
export interface RawJevAnalysis {
  submissionNumber: string;
  model: string;
  concerns: { key: string; probability: number }[];
  regulatoryComplexity: { level: number } | null;
  pdfUrl: string;
  analyzedCharacters: number;
  analyzedAt: string;
}

/** Rebuild a full analysis (with labels and descriptions) from a raw batch entry. */
export function hydrateAnalysis(raw: RawJevAnalysis): JevAnalysisResult {
  const concerns: JevConcern[] = Object.entries(JEV_CONCERN_QUESTIONS).map(([key, q]) => {
    const entry = raw.concerns.find(c => c.key === key);
    return {
      key,
      label: q.label,
      probability: entry ? entry.probability : 0,
      description: q.description,
    };
  }).sort((a, b) => b.probability - a.probability);
  return {
    submissionNumber: raw.submissionNumber,
    model: raw.model,
    concerns,
    regulatoryComplexity: raw.regulatoryComplexity
      ? { level: raw.regulatoryComplexity.level, description: 'Estimated regulatory-engineering effort for comparable software evidence.' }
      : null,
    pdfUrl: raw.pdfUrl,
    analyzedCharacters: raw.analyzedCharacters,
    analyzedAt: raw.analyzedAt,
  };
}

export async function analyzeLetterWithJev(record: DeviceRecord): Promise<JevAnalysisResult> {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    throw new Error('Jev analysis is not configured: TYPESAFE_API_KEY is missing');
  }
  if (!record.summary_pdf_link || !record.summary_pdf_link.startsWith('http')) {
    throw new Error('No valid FDA Summary PDF available for this device');
  }

  const pdfText = await fetchPdfText(record.summary_pdf_link);
  if (!pdfText || pdfText.trim().length < 100) {
    throw new Error('PDF text extraction returned limited content; analysis would be incomplete');
  }
  const state = pdfText.length > STATE_MAX_CHARS ? pdfText.slice(0, STATE_MAX_CHARS) : pdfText;

  const questions: Record<string, { type: 'noul' | 'score'; instructions: string; criteria?: unknown }> = {};
  for (const [key, q] of Object.entries(JEV_CONCERN_QUESTIONS)) {
    questions[key] = { type: 'noul', instructions: q.instructions, criteria: NOUL_CRITERIA };
  }
  questions.regulatoryComplexity = COMPLEXITY_QUESTION;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  let response: Response;
  try {
    response = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'jev-1.13.0',
        state,
        questions,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error('Jev API error ' + response.status + (detail ? ': ' + detail.slice(0, 200) : ''));
  }

  const data = (await response.json()) as JevResponse;
  if (!data.answers) {
    throw new Error('Jev API returned no answers');
  }

  const concerns: JevConcern[] = Object.entries(JEV_CONCERN_QUESTIONS).map(([key, q]) => {
    const answer = data.answers[key];
    const probability = answer && answer.type === 'noul' ? answer.noul : 0;
    return {
      key,
      label: q.label,
      probability,
      description: q.description,
    };
  }).sort((a, b) => b.probability - a.probability);

  const complexityAnswer = data.answers.regulatoryComplexity;
  const regulatoryComplexity = complexityAnswer && complexityAnswer.type === 'score'
    ? { level: Math.min(5, Math.round(complexityAnswer.score) + 1), description: 'Estimated regulatory-engineering effort for comparable software evidence.' }
    : null;

  return {
    submissionNumber: record.submission_number,
    model: 'jev-1.13.0',
    concerns,
    regulatoryComplexity,
    pdfUrl: record.summary_pdf_link,
    analyzedCharacters: pdfText.length,
    analyzedAt: new Date().toISOString(),
  };
}
