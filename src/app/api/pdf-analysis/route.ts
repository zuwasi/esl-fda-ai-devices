import { NextResponse } from 'next/server';
import { analyzeCyberEvidenceFromText } from '@/lib/cyberAnalysis';
import { fetchPdfText } from '@/lib/pdfText';
import { rateLimit } from '@/lib/rateLimit';
import type { DeviceRecord } from '@/lib/types';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

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

export async function GET(req: Request) {
  const limited = rateLimit(req, 'pdf-analysis', 10);
  if (limited) return limited;

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
    console.error('PDF analysis error:', error);
    return NextResponse.json({ error: 'PDF analysis failed. Please try again later.' }, { status: 500 });
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