import { NextResponse } from 'next/server';
import { analyzeLetterWithJev, hydrateAnalysis, type JevAnalysisResult, type RawJevAnalysis } from '@/lib/jevAnalysis';
import { rateLimit } from '@/lib/rateLimit';
import type { DeviceRecord } from '@/lib/types';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

// FDA letters are static: cache analyses permanently in memory (bounded).
const ANALYSIS_CACHE = new Map<string, JevAnalysisResult>();
const ANALYSIS_CACHE_MAX = 300;

// Precomputed batch results (api/jev_analyses.json), written by scripts/batchJevAnalysis.mjs
let precomputed: Record<string, RawJevAnalysis> | null = null;
let precomputedLoaded = false;

function loadPrecomputed(): Record<string, RawJevAnalysis> {
  if (precomputedLoaded) return precomputed ?? {};
  precomputedLoaded = true;
  const filePath = path.join(process.cwd(), 'api', 'jev_analyses.json');
  try {
    if (fs.existsSync(filePath)) {
      precomputed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error('Failed to load precomputed Jev analyses:', error);
  }
  return precomputed ?? {};
}

export async function GET(req: Request) {
  const limited = rateLimit(req, 'jev-analysis', 10);
  if (limited) return limited;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Device ID required' }, { status: 400 });

    const cached = ANALYSIS_CACHE.get(id);
    if (cached) return NextResponse.json(cached);

    const batch = loadPrecomputed()[id];
    if (batch) {
      const analysis = hydrateAnalysis(batch);
      ANALYSIS_CACHE.set(id, analysis);
      return NextResponse.json(analysis);
    }

    if (!process.env.TYPESAFE_API_KEY) {
      return NextResponse.json({ error: 'AI letter analysis is not configured yet. Please check back soon.' }, { status: 503 });
    }

    const records = await loadRecords();
    const record = records[id];
    if (!record) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    const analysis = await analyzeLetterWithJev(record);
    if (ANALYSIS_CACHE.size >= ANALYSIS_CACHE_MAX) {
      const oldest = ANALYSIS_CACHE.keys().next().value;
      if (oldest !== undefined) ANALYSIS_CACHE.delete(oldest);
    }
    ANALYSIS_CACHE.set(id, analysis);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Jev analysis error:', error);
    return NextResponse.json({ error: 'AI letter analysis failed. Please try again later.' }, { status: 500 });
  }
}
