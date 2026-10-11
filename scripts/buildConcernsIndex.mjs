#!/usr/bin/env node
/**
 * Builds public/data/concerns-devices.json: an index of FDA device recalls,
 * grouped by recalling firm + device, used by the "regulatory concerns"
 * search tier. Source: openFDA device/recall.json (free API; set
 * OPENFDA_API_KEY for 240 req/min instead of 40).
 *
 * Usage:
 *   node scripts/buildConcernsIndex.mjs            # full build (needs network)
 *   node scripts/buildConcernsIndex.mjs --fixture  # tiny local fixture for UI tests
 */
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';

const OUT_PATH = path.join(process.cwd(), 'public', 'data', 'concerns-devices.json');
const YEAR_FROM = 2016; // keep the index focused and small
const PER_PAGE = 100;
const MAX_RECORDS = 20000;

const key = process.env.OPENFDA_API_KEY;
const keyParam = key ? '&api_key=' + key : '';

const FIXTURE = process.argv.includes('--fixture');
const bulkArgIdx = process.argv.indexOf('--bulk');
const BULK_FILE = bulkArgIdx >= 0 ? process.argv[bulkArgIdx + 1] : null;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJson(url, attempt = 1) {
  try {
    const res = await fetch(url);
    if (res.status === 429 || res.status === 503) throw new Error('HTTP ' + res.status);
    if (res.status === 404) return { results: [], meta: { results: { total: 0 } } };
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    if (attempt < 5) {
      await sleep(1500 * attempt);
      return fetchJson(url, attempt + 1);
    }
    throw e;
  }
}

function normalizeDeviceName(productDescription) {
  if (!productDescription) return 'Unspecified device';
  // Take the first comma/semicolon segment; strip leading quantities like "1 ITEM"
  let name = String(productDescription).split(/[,;]/)[0].trim();
  name = name.replace(/^\d+\s*(item|unit|box|kit|case)s?\s*/i, '').trim();
  name = name.replace(/\s+/g, ' ');
  if (name.length > 90) name = name.slice(0, 90).trim();
  return name || 'Unspecified device';
}

function groupId(firm, device) {
  const raw = (firm + '|' + device).toLowerCase();
  return crypto.createHash('md5').update(raw).digest('hex').slice(0, 12);
}

function parseDate(s) {
  // openFDA dates are YYYYMMDD or YYYY-MM-DD
  const digits = (s || '').replace(/\D/g, '');
  if (digits.length === 8) return digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
  return (s || '').slice(0, 10) || null;
}

async function buildFromOpenFda() {
  const since = YEAR_FROM + '-01-01';
  const search = 'recall_initiation_date:[' + since.replace(/-/g, '') + '+TO+*]';
  const url = 'https://api.fda.gov/device/recall.json?search=' + search + '&limit=' + PER_PAGE + '&sort=recall_initiation_date:desc' + keyParam;

  const first = await fetchJson(url);
  const total = first.meta?.results?.total || 0;
  const toFetch = Math.min(total, MAX_RECORDS);
  console.log('Recalls since ' + YEAR_FROM + ': ' + total + ' (fetching ' + toFetch + ')');

  const results = [...(first.results || [])];
  for (let skip = PER_PAGE; skip < toFetch; skip += PER_PAGE) {
    const pageUrl = 'https://api.fda.gov/device/recall.json?search=' + search + '&limit=' + PER_PAGE + '&skip=' + skip + '&sort=recall_initiation_date:desc' + keyParam;
    const page = await fetchJson(pageUrl);
    results.push(...(page.results || []));
    if (skip % 2000 === 0) console.log('  fetched ' + results.length + '/' + toFetch);
    await sleep(300);
  }
  return results;
}

const FIXTURE_RECORDS = [
  {
    recalling_firm: 'Acme MedTech Inc', classification: 'Class I', status: 'Ongoing',
    recall_initiation_date: '20250312', termination_date: null,
    reason_for_recall: 'The infusion pump may deliver an incorrect dose due to a software error.',
    root_cause_description: 'Design Control - Software', product_description: '1 ITEM ACME INFUSION PUMP, MODEL IP-200, REF IP200-01, Sterile, Rx-only, used for controlled intravenous delivery.',
    res_event_number: 'Z-1111-2025', product_quantity: '2,300 units', distribution_pattern: 'Nationwide and Canada',
  },
  {
    recalling_firm: 'Acme MedTech Inc', classification: 'Class II', status: 'Terminated',
    recall_initiation_date: '20240603', termination_date: '20240915',
    reason_for_recall: 'Battery may drain unexpectedly, causing loss of therapy.',
    root_cause_description: 'Design Control - Component', product_description: 'ACME PORTABLE OXYGEN CONCENTRATOR, MODEL OX-5, for home use.',
    res_event_number: 'Z-2222-2024', product_quantity: '850 units', distribution_pattern: 'Nationwide',
  },
  {
    recalling_firm: 'Northline Surgical Ltd', classification: 'Class I', status: 'Ongoing',
    recall_initiation_date: '20250120', termination_date: null,
    reason_for_recall: 'Laparoscopic stapler may fail to fire completely, risking incomplete resection.',
    root_cause_description: 'Process Control', product_description: 'NORTHLINE ENDOPATH STAPLER 45MM, single patient use, sterile surgical instrument.',
    res_event_number: 'Z-3333-2025', product_quantity: '14,500 units', distribution_pattern: 'Worldwide',
  },
  {
    recalling_firm: 'Radiology One Corp', classification: 'Class II', status: 'Terminated',
    recall_initiation_date: '20231108', termination_date: '20240219',
    reason_for_recall: 'X-ray table may move unexpectedly during patient positioning.',
    root_cause_description: 'Mechanism', product_description: 'RADIOLOGY ONE FLUOROSCOPY SYSTEM, MODEL F-900, Ref F900-A.',
    res_event_number: 'Z-4444-2023', product_quantity: '120 units', distribution_pattern: 'US and EU',
  },
];

/** Stream the openFDA bulk export (pretty-printed JSON, ~1.4 GB) record by
 *  record without loading it into memory. Records use bulk field names, so
 *  they are mapped to the API field names the grouping code expects. */
async function buildFromBulkFile(filePath) {
  const since = YEAR_FROM + '-01-01';
  const input = fsSync.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  const records = [];
  let current = [];
  let inResults = false;
  let seen = 0;
  let kept = 0;

  function flushRecord() {
    if (!current.length) return;
    seen++;
    try {
      const raw = JSON.parse(current.join('\n'));
      const initiated = raw.event_date_initiated || '';
      if (initiated && initiated >= since) {
        kept++;
        records.push({
          recalling_firm: raw.recalling_firm,
          product_description: raw.product_description,
          classification: raw.classification,
          status: raw.recall_status,
          recall_initiation_date: initiated,
          termination_date: raw.event_date_terminated,
          reason_for_recall: raw.reason_for_recall,
          root_cause_description: raw.root_cause_description,
          product_quantity: raw.product_quantity,
          distribution_pattern: raw.distribution_pattern,
          res_event_number: raw.res_event_number || raw.product_res_number,
          event_id: raw.res_event_number,
          k_numbers: raw.k_numbers || [],
          action: raw.action,
          code_info: raw.code_info,
          country: raw.country,
          address_1: raw.address_1,
          city: raw.city,
          state: raw.state,
          postal_code: raw.postal_code,
          firm_fei_number: raw.firm_fei_number,
          product_code: raw.product_code,
        });
      }
    } catch { /* skip malformed record */ }
    current = [];
  }

  for await (const line of rl) {
    if (!inResults) {
      if (line.startsWith('  "results": [')) inResults = true;
      continue;
    }
    if (line === '    {' ) { current = ['{']; continue; }
    if (line === '    }' || line === '    },') { current.push('}'); flushRecord(); if (seen % 10000 === 0) console.log('  parsed ' + seen + ' records, kept ' + kept); continue; }
    if (current.length) current.push(line);
  }
  flushRecord();
  console.log('Bulk file: parsed ' + seen + ' records, kept ' + kept + ' since ' + since);
  return records;
}

/** Load AI device submission numbers (api/fda_ai_records.csv) to flag recalls
 *  that reference an AI-cleared K number. */
async function loadAiSubmissionNumbers() {
  try {
    const csvPath = path.join(process.cwd(), 'api', 'fda_ai_records.csv');
    const content = await fs.readFile(csvPath, 'utf8');
    const lines = content.split('\n');
    const idx = lines[0].split(',').indexOf('submission_number');
    const set = new Set();
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols[idx]) set.add(cols[idx].trim());
    }
    console.log('AI submission numbers loaded: ' + set.size);
    return set;
  } catch {
    return new Set();
  }
}

function groupRecords(records, aiNumbers) {
  const groups = new Map();
  for (const r of records) {
    const firm = (r.recalling_firm || 'Unknown firm').trim();
    const device = normalizeDeviceName(r.product_description);
    const id = groupId(firm, device);
    if (!groups.has(id)) {
      groups.set(id, {
        id, firm, device, recalls: [], recallCount: 0, openRecalls: 0,
        worstClass: null, latestDate: null, kNumbers: [], aiLinked: [],
        productCodes: [], feiNumber: null, firmAddress: null,
      });
    }
    const g = groups.get(id);
    const initiation = parseDate(r.recall_initiation_date);
    const terminated = parseDate(r.termination_date);
    g.recallCount += 1;
    const status = r.status || 'N/A';
    if (/\bopen\b/i.test(status)) g.openRecalls += 1;
    if (!g.latestDate || (initiation && initiation > g.latestDate)) g.latestDate = initiation;
    const cls = r.classification || null;
    if (cls && (!g.worstClass || classRank(cls) < classRank(g.worstClass))) g.worstClass = cls;
    for (const k of r.k_numbers || []) {
      if (g.kNumbers.length < 5 && !g.kNumbers.includes(k)) g.kNumbers.push(k);
    }
    if (r.product_code && !g.productCodes.includes(r.product_code) && g.productCodes.length < 3) g.productCodes.push(r.product_code);
    if (r.firm_fei_number && !g.feiNumber) g.feiNumber = String(r.firm_fei_number);
    if (!g.firmAddress) {
      const addr = [r.address_1, r.city, r.state, r.postal_code].filter(Boolean).join(', ');
      if (addr) g.firmAddress = addr.slice(0, 140);
    }
    if (g.recalls.length < 5) {
      g.recalls.push({
        classification: cls || 'N/A',
        status,
        initiated: initiation || 'N/A',
        terminated: terminated || null,
        reason: (r.reason_for_recall || 'N/A').slice(0, 300),
        rootCause: (r.root_cause_description || 'N/A').slice(0, 120),
        product: (r.product_description || '').slice(0, 400),
        quantity: (r.product_quantity || '').slice(0, 60) || null,
        distribution: (r.distribution_pattern || '').slice(0, 120) || null,
        eventNumber: r.res_event_number || r.event_id || null,
        action: (r.action || '').slice(0, 500) || null,
        codeInfo: (r.code_info || '').slice(0, 120) || null,
        country: (r.country || '').slice(0, 40) || null,
      });
    }
  }
  for (const g of groups.values()) {
    g.recalls.sort((a, b) => (b.initiated || '').localeCompare(a.initiated || ''));
    g.aiLinked = g.kNumbers.filter(k => aiNumbers.has(k)).slice(0, 3);
    if (!g.aiLinked.length) delete g.aiLinked;
    if (!g.kNumbers.length) delete g.kNumbers;
    if (!g.productCodes.length) delete g.productCodes;
    if (!g.feiNumber) delete g.feiNumber;
    if (!g.firmAddress) delete g.firmAddress;
    if (!g.worstClass) delete g.worstClass; // bulk export carries no classification field
  }
  return Array.from(groups.values());
}

function classRank(c) {
  const s = String(c).toLowerCase();
  if (s.includes('i') && !s.includes('ii') && !s.includes('iii')) return 1; // Class I most severe
  if (s.includes('iii')) return 3;
  if (s.includes('ii')) return 2;
  return 9;
}

async function main() {
  let records;
  if (FIXTURE) {
    console.log('Building fixture index...');
    records = FIXTURE_RECORDS;
  } else if (BULK_FILE) {
    console.log('Building index from bulk file ' + BULK_FILE + '...');
    records = await buildFromBulkFile(BULK_FILE);
  } else {
    records = await buildFromOpenFda();
  }
  const aiNumbers = await loadAiSubmissionNumbers();
  const groups = groupRecords(records, aiNumbers);
  groups.sort((a, b) => (b.latestDate || '').localeCompare(a.latestDate || ''));
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(groups));
  const sizeKb = Math.round((await fs.stat(OUT_PATH)).size / 1024);
  console.log('Wrote ' + groups.length + ' concern device groups (' + sizeKb + ' KB) to ' + OUT_PATH);
}

main().catch(e => { console.error(e); process.exit(1); });
