import { PDFParse } from 'pdf-parse';
import path from 'path';
import { pathToFileURL } from 'url';

// Set pdf.js worker to the bundled worker file (required for Node.js / Next.js server)
const workerPath = path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs');
PDFParse.setWorker(pathToFileURL(workerPath).href);

const PDF_TEXT_CACHE = new Map<string, { text: string; timestamp: number }>();
const PDF_TEXT_CACHE_MAX = 200; // bound memory from attacker-varied ids
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/** FDA blocks the legacy /CDRH510K/ path used by some dataset links; rewrite to the canonical cdrh_docs path. */
function canonicalPdfUrl(pdfUrl: string): string {
  const m = pdfUrl.match(/\/CDRH510K\/([KPD]\d{6})\.pdf/i);
  if (!m) return pdfUrl;
  const id = m[1].toUpperCase();
  const year = id.slice(1, 3);
  return 'https://www.accessdata.fda.gov/cdrh_docs/pdf' + year + '/' + id + '.pdf';
}

export async function fetchPdfText(pdfUrl: string): Promise<string> {
  const cached = PDF_TEXT_CACHE.get(pdfUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.text;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(canonicalPdfUrl(pdfUrl), {
      signal: controller.signal,
      headers: { 'User-Agent': 'ESL-FDA-AI-Device-Intelligence/1.0' },
    });
    if (!response.ok) throw new Error('PDF fetch failed: ' + response.status);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text || '';
    if (PDF_TEXT_CACHE.size >= PDF_TEXT_CACHE_MAX) {
      const oldest = PDF_TEXT_CACHE.keys().next().value;
      if (oldest !== undefined) PDF_TEXT_CACHE.delete(oldest);
    }
    PDF_TEXT_CACHE.set(pdfUrl, { text, timestamp: Date.now() });
    return text;
  } finally {
    clearTimeout(timeout);
  }
}
