import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface RecallResult {
  product_description: string; reason_for_recall: string; root_cause_description: string;
  recall_status: string; event_date_posted: string; recalling_firm: string; res_event_number: string;
}

interface AdverseEventResult {
  event_type: string; report_number: string; date_received: string;
  device?: Array<{ brand_name: string; generic_name: string }>;
  product_problems?: string[];
  patient?: Array<{ patient_problems?: string[] }>;
  mdr_text?: Array<{ text_type_code: string; text: string }>;
}

interface FdaResponse<T> {
  results?: T[];
  meta?: { results?: { total?: number } };
}

function getPrimaryCompanyName(company: string): string {
  // Take the first significant word for broad matching
  const cleaned = company.replace(/[.,]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => w.length > 2 && !['Inc', 'LLC', 'Corp', 'Ltd', 'Co', 'The', 'And', 'GmbH', 'SA', 'AG'].includes(w));
  return words[0] || cleaned.split(/\s+/)[0] || company;
}

function getDeviceKeywords(deviceName: string): string {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'system', 'systems', 'software', 'version', 'inc', 'llc', 'corp', 'ltd', 'co', 'gmbh', 'feature', 'diagnostic', 'medical', 'device', 'algorithm', 'notification']);
  const words = deviceName.replace(/\([^)]*\)/g, ' ').split(/[\s\/\-]+/).filter(word => word && word.length > 1 && !stopWords.has(word.toLowerCase()));
  return words.slice(0, 2).join(' ') || deviceName;
}

const emptyFdaResponse = (): FdaResponse<never> => ({ results: [], meta: { results: { total: 0 } } });

async function fetchFda<T>(url: string): Promise<FdaResponse<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) return emptyFdaResponse();
    return await response.json();
  } catch {
    return emptyFdaResponse();
  }
}

function formatRecalls(response: FdaResponse<RecallResult>) {
  return {
    total: response.meta?.results?.total || 0,
    results: (response.results || []).map(r => ({
      product: (r.product_description || 'N/A').substring(0, 200),
      reason: (r.reason_for_recall || 'N/A').substring(0, 300),
      rootCause: r.root_cause_description || 'N/A', status: r.recall_status || 'N/A',
      date: r.event_date_posted || 'N/A', firm: r.recalling_firm || 'N/A', eventNumber: r.res_event_number || 'N/A',
    })),
  };
}

function formatEvents(response: FdaResponse<AdverseEventResult>) {
  return {
    total: response.meta?.results?.total || 0,
    results: (response.results || []).map(e => ({
      eventType: e.event_type || 'N/A', reportNumber: e.report_number || 'N/A', dateReceived: e.date_received || 'N/A',
      deviceName: e.device?.[0]?.brand_name || 'N/A', deviceGeneric: e.device?.[0]?.generic_name || 'N/A',
      problems: (e.product_problems || []).join(', ') || 'N/A',
      patientImpact: (e.patient?.[0]?.patient_problems || []).join(', ') || 'N/A',
      description: (e.mdr_text?.find(t => t.text_type_code === 'Description of Event or Problem')?.text || '').substring(0, 400),
    })),
  };
}

interface WarningLetter {
  postedDate: string;
  issueDate: string;
  companyName: string;
  issuingOffice: string;
  subject: string;
  hasResponse: boolean;
  closeoutDate: string | null;
}

const WL_CACHE: Record<string, { letters: WarningLetter[]; timestamp: number }> = {};
const WL_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function fetchWarningLetters(companyName: string, primaryName: string): Promise<WarningLetter[]> {
  const cacheKey = primaryName.toLowerCase();
  const cached = WL_CACHE[cacheKey];
  if (cached && Date.now() - cached.timestamp < WL_CACHE_TTL) {
    return cached.letters;
  }

  const xlsxUrl = 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters/datatables-data?search_api_fulltext=' + encodeURIComponent(primaryName) + '&page&_format=xlsx';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(xlsxUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ESL-FDA-AI-Device-Intelligence/1.0' },
    });
    if (!response.ok) return [];

    const arrayBuffer = await response.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    const lowerCompany = companyName.toLowerCase();
    const lowerPrimary = primaryName.toLowerCase();

    const letters: WarningLetter[] = rows
      .filter(row => {
        const rowCompany = String(row['Company Name'] || '').toLowerCase();
        if (!rowCompany) return false;
        // Match if the row company contains the primary name or vice versa
        return rowCompany.includes(lowerPrimary) || lowerCompany.includes(rowCompany) ||
               rowCompany.includes(lowerCompany.split(' ')[0]) ||
               lowerPrimary.includes(rowCompany.split(' ')[0]);
      })
      .map(row => ({
        postedDate: String(row['Posted Date'] || ''),
        issueDate: String(row['Letter Issue Date'] || ''),
        companyName: String(row['Company Name'] || ''),
        issuingOffice: String(row['Issuing Office'] || ''),
        subject: String(row['Subject'] || ''),
        hasResponse: !!row['Response Letter'],
        closeoutDate: row['Closeout Letter'] ? String(row['Closeout Letter']) : null,
      }))
      .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));

    WL_CACHE[cacheKey] = { letters, timestamp: Date.now() };
    return letters;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const company = url.searchParams.get('company');
  const deviceName = url.searchParams.get('deviceName');
  if (!company || !deviceName) return NextResponse.json({ error: 'Company and device name required.' }, { status: 400 });

  const primaryName = getPrimaryCompanyName(company);
  const deviceKeywords = getDeviceKeywords(deviceName);
  const encodedName = encodeURIComponent(JSON.stringify(primaryName));
  const encodedDevice = encodeURIComponent(JSON.stringify(deviceKeywords));
  const recallBase = 'https://api.fda.gov/device/recall.json?search=recalling_firm:' + encodedName;
  const eventBase = 'https://api.fda.gov/device/event.json?search=device.manufacturer_d_name:' + encodedName;

  try {
    const [deviceRecalls, companyRecalls, deviceEvents, companyEvents, warningLetters] = await Promise.all([
      fetchFda<RecallResult>(recallBase + '+AND+product_description:' + encodedDevice + '&limit=10&sort=event_date_posted:desc'),
      fetchFda<RecallResult>(recallBase + '&limit=10&sort=event_date_posted:desc'),
      fetchFda<AdverseEventResult>(eventBase + '+AND+device.brand_name:' + encodedDevice + '&limit=10&sort=date_received:desc'),
      fetchFda<AdverseEventResult>(eventBase + '&limit=10&sort=date_received:desc'),
      fetchWarningLetters(company, primaryName),
    ]);

    const fdaWlSearchUrl = 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters?field_company_name=' + encodeURIComponent(primaryName);

    return NextResponse.json({
      company, deviceName,
      deviceSpecific: { recalls: formatRecalls(deviceRecalls), adverseEvents: formatEvents(deviceEvents) },
      companyWide: { recalls: formatRecalls(companyRecalls), adverseEvents: formatEvents(companyEvents) },
      warningLetters: {
        letters: warningLetters,
        total: warningLetters.length,
        searchUrl: fdaWlSearchUrl,
        note: warningLetters.length > 0
          ? 'FDA Warning Letters fetched live from FDA.gov. Click a letter to view the full text on FDA.gov.'
          : 'No warning letters found for this company in FDA records.',
      },
    });
  } catch (error) {
    console.error('Regulatory concerns API error:', error);
    const empty = { total: 0, results: [] };
    return NextResponse.json({
      company, deviceName,
      deviceSpecific: { recalls: empty, adverseEvents: empty },
      companyWide: { recalls: empty, adverseEvents: empty },
      warningLetters: { letters: [], total: 0, searchUrl: '', note: 'FDA Warning Letters search is temporarily unavailable.' },
    });
  }
}
