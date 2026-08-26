import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { analyzeCyberEvidence } from '@/lib/cyberAnalysis';
import { classifyRisk, getRegulatoryPathway } from '@/lib/riskClassification';
import type { DeviceRecord } from '@/lib/types';

const SHARD_NAMES = [
  'keywords', 'questions', 'thesis', 'search_boost',
  'query_match_1', 'query_match_2', 'query_match_3'
];

const DEFAULT_WEIGHTS: Record<string, number> = {
  'keywords': 0.134207,
  'questions': 0.226103,
  'thesis': 0.094972,
  'search_boost': 0.029563,
  'query_match_1': 0.217395,
  'query_match_2': 0.241111,
  'query_match_3': 0.056650,
};

const MODEL_NAME = 'Romelianism/MedEmbed-small-v0.1';

type PipelineFunction = (
  task: string,
  model: string,
  options?: { quantized?: boolean }
) => Promise<(text: string, options?: { pooling?: string; normalize?: boolean }) => Promise<{ data: Float32Array | number[] }>>;

let SHARDS: Record<string, { id: string; vector: number[] }[]> | null = null;
let pipeline: PipelineFunction | null = null;
let RECORDS: Record<string, DeviceRecord> | null = null;
let BM25_INDEX: BM25Index | null = null;

interface ShardDoc { id: string; vector: number[] }

// --- BM25 ---
class BM25Index {
  private documents: Record<string, string> = {};
  private docFreq: Record<string, number> = {};
  private termFreq: Record<string, Record<string, number>> = {};
  private docLengths: Record<string, number> = {};
  private avgDocLength = 0;
  private totalDocs = 0;
  private k1 = 1.2;
  private b = 0.75;

  constructor(documents: Record<string, string>) {
    this.documents = documents;
    this.buildIndex();
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  }

  private buildIndex(): void {
    this.totalDocs = Object.keys(this.documents).length;
    let totalLength = 0;
    for (const [docId, content] of Object.entries(this.documents)) {
      const tokens = this.tokenize(content);
      this.docLengths[docId] = tokens.length;
      totalLength += tokens.length;
      const counts: Record<string, number> = {};
      for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
      this.termFreq[docId] = counts;
      for (const t of new Set(tokens)) this.docFreq[t] = (this.docFreq[t] || 0) + 1;
    }
    this.avgDocLength = totalLength / this.totalDocs;
  }

  public search(query: string, topK: number = 10): Array<{ id: string; score: number }> {
    const queryTerms = this.tokenize(query);
    const scores: Record<string, number> = {};
    for (const docId of Object.keys(this.documents)) {
      let score = 0;
      for (const term of queryTerms) {
        const tf = this.termFreq[docId]?.[term] || 0;
        const df = this.docFreq[term] || 0;
        if (tf > 0 && df > 0) {
          const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5));
          const dl = this.docLengths[docId];
          score += idf * (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (dl / this.avgDocLength)));
        }
      }
      if (score > 0) scores[docId] = score;
    }
    return Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, topK).map(([id, score]) => ({ id, score }));
  }
}

async function getPipeline(): Promise<PipelineFunction> {
  if (pipeline === null) {
    const { pipeline: p } = await import('@huggingface/transformers');
    pipeline = p as PipelineFunction;
  }
  return pipeline;
}

async function loadRecords(): Promise<Record<string, DeviceRecord>> {
  if (RECORDS === null) {
    const filePath = path.join(process.cwd(), 'api', 'fda_ai_records.csv');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parsed = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true }) as DeviceRecord[];
    const records: Record<string, DeviceRecord> = {};
    for (const r of parsed) {
      if (r.submission_number && r.thesis !== 'Error') records[r.submission_number] = r;
    }
    RECORDS = records;
  }
  return RECORDS;
}

async function buildBM25Index(records: Record<string, DeviceRecord>): Promise<BM25Index> {
  if (BM25_INDEX === null) {
    const documents: Record<string, string> = {};
    for (const [id, r] of Object.entries(records)) {
      const text = [r.summary_keywords, r.thesis, r.concepts].filter(Boolean).join(' ');
      if (text.trim()) documents[id] = text;
    }
    BM25_INDEX = new BM25Index(documents);
  }
  return BM25_INDEX;
}

async function embedText(text: string): Promise<number[]> {
  const p = await getPipeline();
  const embedder = await p('feature-extraction', MODEL_NAME, { quantized: true });
  const result = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

async function loadAllShards(): Promise<Record<string, ShardDoc[]>> {
  if (SHARDS === null) {
    const loaded: Record<string, ShardDoc[]> = {};
    await Promise.all(SHARD_NAMES.map(async (name) => {
      const filePath = path.join(process.cwd(), 'public', 'embeddings', name + '.json');
      try {
        loaded[name] = JSON.parse(await fs.readFile(filePath, 'utf8'));
      } catch (e) { console.error('Failed to load shard ' + name, e); }
    }));
    SHARDS = loaded;
  }
  return SHARDS;
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function normalizeScores(scores: Record<string, number>): Record<string, number> {
  const vals = Object.values(scores);
  if (!vals.length) return scores;
  const mx = Math.max(...vals), mn = Math.min(...vals), range = mx - mn;
  if (range === 0) return Object.fromEntries(Object.keys(scores).map(k => [k, 1.0]));
  return Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, (v - mn) / range]));
}

interface Filters {
  panel?: string;
  company?: string;
  pathway?: string;
  dataType?: string;
  yearFrom?: string;
  yearTo?: string;
}

function applyFilters(
  id: string,
  records: Record<string, DeviceRecord>,
  filters: Filters
): boolean {
  const r = records[id];
  if (!r) return false;
  if (filters.panel && filters.panel !== 'all' && (r.panel_lead || r.lead_panel) !== filters.panel) return false;
  if (filters.company && filters.company !== 'all' && r.company !== filters.company) return false;
  if (filters.dataType && filters.dataType !== 'all' && r.data_type !== filters.dataType) return false;
  if (filters.pathway && filters.pathway !== 'all') {
    const pathway = getRegulatoryPathway(r.submission_number);
    if (pathway !== filters.pathway) return false;
  }
  if (filters.yearFrom || filters.yearTo) {
    const year = parseInt((r.date_of_final_decision || '').split('/').pop() || '0');
    if (filters.yearFrom && year < parseInt(filters.yearFrom)) return false;
    if (filters.yearTo && year > parseInt(filters.yearTo)) return false;
  }
  return true;
}

function formatResult(id: string, score: number, records: Record<string, DeviceRecord>) {
  const r = records[id] || {} as DeviceRecord;
  const risk = classifyRisk(r);
  return {
    deviceName: r.device_model || 'N/A',
    applicant: r.company || 'N/A',
    submissionNumber: id,
    decisionDate: r.date_of_final_decision || 'N/A',
    similarity: score,
    pdfLink: r.summary_pdf_link || null,
    thesis: r.thesis || 'N/A',
    keywords: r.summary_keywords || 'N/A',
    concepts: r.concepts || 'N/A',
    panel: r.panel_lead || r.lead_panel || 'N/A',
    dataType: r.data_type || 'N/A',
    clinicalFunction: r.clinical_function || 'N/A',
    aiFunction: r.ai_function || 'N/A',
    regulatoryPathway: getRegulatoryPathway(id),
    riskClass: risk.iec62304Class,
    cyberDeviceStatus: risk.cyberDevice ? 'Cyber Device (\u00a7524B)' : 'Standard',
  };
}

async function performEmbeddingSearch(
  query: string, topK: number, weights: Record<string, number>,
  shards: Record<string, ShardDoc[]>, records: Record<string, DeviceRecord>,
  filters: Filters
) {
  const qv = await embedText(query);
  const docScores: Record<string, { [k: string]: number }> = {};
  for (const sn of SHARD_NAMES) {
    const docs = shards[sn];
    if (!docs) continue;
    for (const d of docs) {
      const s = cosineSim(qv, d.vector);
      if (!docScores[d.id]) docScores[d.id] = {};
      docScores[d.id][sn] = s;
    }
  }
  const ranked = Object.entries(docScores)
    .map(([id, scores]) => {
      let hs = 0;
      for (const sn in scores) hs += (scores[sn] || 0) * (weights[sn] || 0);
      return { id, score: hs };
    })
    .filter(r => applyFilters(r.id, records, filters))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return ranked.map(r => formatResult(r.id, r.score, records));
}

function performKeywordSearch(
  query: string, page: number, limit: number,
  records: Record<string, DeviceRecord>, filters: Filters
) {
  let arr = Object.entries(records).map(([id, r]) => ({ id, record: r }));
  if (query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    arr = arr.filter(({ id, record }) => {
      const text = [record.device_model, record.company, record.thesis, record.summary_keywords, record.concepts, id]
        .join(' ').toLowerCase();
      return terms.every(t => text.includes(t));
    });
  }
  if (filters.panel && filters.panel !== 'all') {
    arr = arr.filter(({ record }) => (record.panel_lead || record.lead_panel) === filters.panel);
  }
  if (filters.company && filters.company !== 'all') {
    arr = arr.filter(({ record }) => record.company === filters.company);
  }
  if (filters.dataType && filters.dataType !== 'all') {
    arr = arr.filter(({ record }) => record.data_type === filters.dataType);
  }
  if (filters.pathway && filters.pathway !== 'all') {
    arr = arr.filter(({ id }) => getRegulatoryPathway(id) === filters.pathway);
  }
  if (filters.yearFrom || filters.yearTo) {
    arr = arr.filter(({ record }) => {
      const year = parseInt((record.date_of_final_decision || '').split('/').pop() || '0');
      if (filters.yearFrom && year < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && year > parseInt(filters.yearTo)) return false;
      return true;
    });
  }
  const total = arr.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pageItems = arr.slice(start, start + limit);
  return {
    results: pageItems.map(({ id, record }) => formatResult(id, 1, records)),
    currentPage: page,
    totalPages,
    totalRecords: total,
    message: total === 0 ? 'No results found.' : '',
  };
}

export async function POST(req: Request) {
  try {
    const [shards, records] = await Promise.all([loadAllShards(), loadRecords()]);
    const body = await req.json();
    const {
      query = '', topK = 300, weights = DEFAULT_WEIGHTS,
      mode = 'embedding', page = 1, limit = 20, lambdaVal = 0.8,
      filters = {} as Filters,
    } = body;

    if (mode === 'embedding') {
      if (!query) return NextResponse.json({ error: 'Query required.' }, { status: 400 });
      const results = await performEmbeddingSearch(query, topK, weights, shards, records, filters);
      return NextResponse.json(results);
    } else if (mode === 'keyword') {
      const results = performKeywordSearch(query, page, limit, records, filters);
      return NextResponse.json(results);
    } else if (mode === 'hybrid') {
      if (!query) return NextResponse.json({ error: 'Query required.' }, { status: 400 });
      const embResults = await performEmbeddingSearch(query, Math.max(topK * 3, 100), weights, shards, records, filters);
      const embScores: Record<string, number> = {};
      for (const r of embResults) embScores[r.submissionNumber] = r.similarity;
      const bm25 = await buildBM25Index(records);
      const bm25Results = bm25.search(query, Math.max(topK * 3, 100));
      const bm25Scores: Record<string, number> = {};
      for (const r of bm25Results) bm25Scores[r.id] = r.score;
      const ne = normalizeScores(embScores);
      const nb = normalizeScores(bm25Scores);
      const combined: Record<string, number> = {};
      for (const id of new Set([...Object.keys(ne), ...Object.keys(nb)])) {
        if (!applyFilters(id, records, filters)) continue;
        combined[id] = lambdaVal * (ne[id] || 0) + (1 - lambdaVal) * (nb[id] || 0);
      }
      const sorted = Object.entries(combined).sort(([, a], [, b]) => b - a).slice(0, topK);
      return NextResponse.json(sorted.map(([id, score]) => formatResult(id, score, records)));
    }
    return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// GET endpoint for device detail
export async function GET(req: Request) {
  try {
    const records = await loadRecords();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (id && records[id]) {
      const r = records[id];
      const cyber = analyzeCyberEvidence(r);
      const risk = classifyRisk(r);
      return NextResponse.json({ record: r, cyber, risk });
    }
    // Return available filter values
    const panels = new Set<string>();
    const companies = new Set<string>();
    const dataTypes = new Set<string>();
    for (const r of Object.values(records)) {
      if (r.panel_lead) panels.add(r.panel_lead);
      if (r.company) companies.add(r.company);
      if (r.data_type) dataTypes.add(r.data_type);
    }
    return NextResponse.json({
      totalDevices: Object.keys(records).length,
      panels: Array.from(panels).sort(),
      companies: Array.from(companies).sort(),
      dataTypes: Array.from(dataTypes).sort(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
