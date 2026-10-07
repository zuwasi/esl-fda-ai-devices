// Batch-analyze all FDA device letters with Jev and write api/jev_analyses.json.
// Usage: node scripts/batchJevAnalysis.mjs   (requires TYPESAFE_API_KEY in .env.local or env)
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { pathToFileURL } from 'url';

const ROOT = path.resolve(import.meta.dirname, '..');
const workerPath = path.join(ROOT, 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs');
PDFParse.setWorker(pathToFileURL(workerPath).href);

// Load TYPESAFE_API_KEY from .env.local if not already in the environment
if (!process.env.TYPESAFE_API_KEY) {
  const envPath = path.join(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*TYPESAFE_API_KEY\s*=\s*(\S+)\s*$/);
      if (m) process.env.TYPESAFE_API_KEY = m[1];
    }
  }
}
if (!process.env.TYPESAFE_API_KEY) {
  console.error('TYPESAFE_API_KEY missing: put it in .env.local');
  process.exit(1);
}

const NOUL_CRITERIA = {
  true: 'The letter contains explicit evidence of this concern for this device.',
  false: 'The letter shows no evidence of this concern.',
};

const QUESTIONS = {
  clinicalValidation: 'Does the letter evidence limited, absent, or questionable clinical validation data for the device (e.g., no clinical study, small sample, reliance on bench testing alone)?',
  softwareVV: 'Does the letter evidence software verification and validation gaps (e.g., no V&V summary, limited testing detail, missing ML model validation methodology)?',
  aiMlSpecific: 'Does the letter evidence AI/ML-specific concerns such as training data limitations, generalizability, model drift, lack of PCCP (predetermined change control plan), or opaque model updates?',
  cybersecurity: 'Does the letter evidence cybersecurity evidence gaps such as no SBOM mention, no cybersecurity risk assessment, or no postmarket cyber plan?',
  predicateDifference: 'Do the technological characteristics differences from the predicate device raise new safety or effectiveness questions that were addressed with limited data?',
  humanFactors: 'Does the letter evidence missing or limited human factors / usability validation for the device or its user interface?',
  performanceData: 'Does the letter evidence limited, absent, or weak performance testing data (bench, phantom, or analytical studies with small scope)?',
  indicationBreadth: 'Does the letter evidence broad, vague, or expansive indications for use relative to the data provided (possible off-label expansion risk)?',
};

const COMPLEXITY_CRITERIA = [
  'Minimal: routine software with abundant standard evidence',
  'Low: mostly standard evidence, small gaps',
  'Moderate: typical AI/ML SaMD evidence needs',
  'High: extensive software evidence work required',
  'Very high: complex submission needing exhaustive evidence and remediation',
];

const STATE_MAX_CHARS = Number(process.env.JEV_STATE_MAX_CHARS) || 60_000;
const CONCURRENCY = 4;
const CHECKPOINT_PATH = path.join(ROOT, 'api', 'jev_analyses.checkpoint.jsonl');
const OUTPUT_PATH = path.join(ROOT, 'api', 'jev_analyses.json');

const pdfTextCache = new Map();

async function fetchPdfText(pdfUrl) {
  if (pdfTextCache.has(pdfUrl)) return pdfTextCache.get(pdfUrl);
  // FDA blocks the legacy /CDRH510K/ path; rewrite to the canonical cdrh_docs path
  const cm = pdfUrl.match(/\/CDRH510K\/([KPD]\d{6})\.pdf/i);
  if (cm) {
    const id = cm[1].toUpperCase();
    pdfUrl = 'https://www.accessdata.fda.gov/cdrh_docs/pdf' + id.slice(1, 3) + '/' + id + '.pdf';
  }
  const response = await fetch(pdfUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  if (!response.ok) throw new Error('PDF fetch failed: ' + response.status);
  const buffer = Buffer.from(await response.arrayBuffer());
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  const text = data.text || '';
  pdfTextCache.set(pdfUrl, text);
  return text;
}

async function analyzeWithJev(submissionNumber, pdfUrl) {
  const pdfText = await fetchPdfText(pdfUrl);
  if (!pdfText || pdfText.trim().length < 100) throw new Error('PDF text extraction returned limited content');
  const state = pdfText.length > STATE_MAX_CHARS ? pdfText.slice(0, STATE_MAX_CHARS) : pdfText;

  const questions = {};
  for (const [key, instructions] of Object.entries(QUESTIONS)) {
    questions[key] = { type: 'noul', instructions, criteria: NOUL_CRITERIA };
  }
  questions.regulatoryComplexity = {
    type: 'score',
    instructions: 'How regulatory-complex is this submission: how much engineering and evidence effort would a comparable manufacturer need for software evidence (SBOM, cybersecurity, software V&V, clinical validation)?',
    criteria: COMPLEXITY_CRITERIA,
  };

  const response = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.TYPESAFE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'jev-1.13.0', state, questions }),
  });

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') || '5');
    await new Promise(res => setTimeout(res, retryAfter * 1000));
    return analyzeWithJev(submissionNumber, pdfUrl);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error('Jev API error ' + response.status + (detail ? ': ' + detail.slice(0, 200) : ''));
  }
  const data = await response.json();
  if (!data.answers) throw new Error('Jev API returned no answers');

  const concerns = Object.entries(QUESTIONS).map(([key, instructions]) => {
    const answer = data.answers[key];
    return { key, probability: answer && answer.type === 'noul' ? answer.noul : 0 };
  });
  const complexity = data.answers.regulatoryComplexity;
  return {
    submissionNumber,
    model: 'jev-1.13.0',
    concerns,
    regulatoryComplexity: complexity && complexity.type === 'score'
      ? { level: Math.min(5, Math.round(complexity.score) + 1) }
      : null,
    pdfUrl,
    analyzedCharacters: pdfText.length,
    analyzedAt: new Date().toISOString(),
  };
}

async function processOne(record) {
  try {
    const result = await analyzeWithJev(record.submission_number, record.summary_pdf_link);
    fs.appendFileSync(CHECKPOINT_PATH, JSON.stringify(result) + '\n');
    done++;
    console.log('[' + done + '/' + total + '] OK ' + record.submission_number);
  } catch (error) {
    done++;
    failed++;
    console.error('[' + done + '/' + total + '] FAIL ' + record.submission_number + ': ' + error.message);
  }
}

// Load records
const csv = fs.readFileSync(path.join(ROOT, 'api', 'fda_ai_records.csv'), 'utf8');
const parsed = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
const records = parsed.filter(r => r.submission_number && r.thesis !== 'Error' && r.summary_pdf_link && r.summary_pdf_link.startsWith('http'));
const total = records.length;
let done = 0;
let failed = 0;
console.log('Analyzing ' + total + ' devices with concurrency ' + CONCURRENCY);

// Resume support: skip already-analyzed submissions from checkpoint
const alreadyDone = new Set();
if (fs.existsSync(CHECKPOINT_PATH)) {
  for (const line of fs.readFileSync(CHECKPOINT_PATH, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { alreadyDone.add(JSON.parse(line).submissionNumber); } catch { /* skip corrupt line */ }
  }
  console.log('Resuming: ' + alreadyDone.size + ' already analyzed');
}

const pending = records.filter(r => !alreadyDone.has(r.submission_number));
const queue = [...pending];
const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  while (queue.length > 0) {
    const record = queue.shift();
    if (!record) break;
    await processOne(record);
  }
});
await Promise.all(workers);

// Assemble final JSON (merge checkpoint entries, sorted)
const results = new Map();
if (fs.existsSync(CHECKPOINT_PATH)) {
  for (const line of fs.readFileSync(CHECKPOINT_PATH, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      results.set(r.submissionNumber, r);
    } catch { /* skip corrupt line */ }
  }
}
const output = Object.fromEntries([...results.entries()].sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 1));
console.log('Wrote ' + OUTPUT_PATH + ' with ' + Object.keys(output).length + ' analyses, ' + failed + ' failed of ' + total);
