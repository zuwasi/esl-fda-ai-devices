import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { analyzeCyberEvidenceFromText } from '@/lib/cyberAnalysis';
import type { DeviceRecord } from '@/lib/types';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Set pdf.js worker to the bundled worker file (required for Node.js / Next.js server)
const workerPath = path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs');
PDFParse.setWorker(pathToFileURL(workerPath).href);

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

let recordsCache: Record<string, DeviceRecord> | null = null;

async function loadRecords(): Promise<Record<string, DeviceRecord>> {
  if (recordsCache) return recordsCache;
  const filePath = path.join(process.cwd(), 'api', 'fda_ai_records.csv');
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const parsed = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true }) as DeviceRecord[];
  const records: Record<string, DeviceRecord> = {};
  for (const r of parsed) {
    if (r.submission_number && r.thesis !== 'Error') records[r.submission_number] = r;
  }
  recordsCache = records;
  return records;
}

const PDF_TEXT_CACHE: Record<string, { text: string; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function fetchPdfText(pdfUrl: string): Promise<string> {
  const cached = PDF_TEXT_CACHE[pdfUrl];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.text;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(pdfUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ESL-FDA-AI-Device-Intelligence/1.0' },
    });
    if (!response.ok) throw new Error('PDF fetch failed: ' + response.status);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text || '';
    PDF_TEXT_CACHE[pdfUrl] = { text, timestamp: Date.now() };
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Device ID required' }, { status: 400 });

    const records = await loadRecords();
    const record = records[id];
    if (!record) return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    if (!record.summary_pdf_link || !record.summary_pdf_link.startsWith('http')) {
      return NextResponse.json({ error: 'No valid FDA Summary PDF available for this device' }, { status: 404 });
    }

    const pdfText = await fetchPdfText(record.summary_pdf_link);
    if (!pdfText || pdfText.trim().length < 100) {
      return NextResponse.json({
        source: 'pdf',
        pdfUrl: record.summary_pdf_link,
        pdfTextLength: pdfText.length,
        cyber: analyzeCyberEvidenceFromText(record, pdfText),
        warning: 'PDF text extraction returned limited content. Analysis may be incomplete.',
      });
    }

    const cyber = analyzeCyberEvidenceFromText(record, pdfText);

    // Extract relevant snippets for transparency
    const snippets = extractCyberSnippets(pdfText);

    return NextResponse.json({
      source: 'pdf',
      pdfUrl: record.summary_pdf_link,
      pdfTextLength: pdfText.length,
      cyber,
      snippets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'PDF analysis failed: ' + message }, { status: 500 });
  }
}

function extractCyberSnippets(text: string): string[] {
  const snippets: string[] = [];
  const lower = text.toLowerCase();
  const terms = [
    'sbom', 'software bill of materials', 'cybersecurity', 'cyber risk',
    'vulnerability', 'threat model', 'encryption', 'authentication',
    'access control', 'postmarket', 'post-market', 'patch management',
    'security', '524b', 'cyber device',
  ];

  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx >= 0) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(text.length, idx + term.length + 120);
      const snippet = text.substring(start, end).replace(/\n/g, ' ').trim();
      snippets.push('...' + snippet + '...');
    }
  }

  return snippets.slice(0, 8);
}