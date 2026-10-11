import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Live FDA enrichment for concern device pages: device classification (by
 * product code) and 510(k) clearance history (by K number). Degrades
 * gracefully while the openFDA API is unreachable.
 */

interface ClassificationResult {
  device_name?: string;
  device_class?: string;
  regulation_number?: string;
  medical_specialty_description?: string;
  review_panel?: string;
}

interface K510Result {
  k_number?: string;
  device_name?: string;
  applicant?: string;
  decision_date?: string;
  decision_description?: string;
  product_code?: string;
}

const fdaGet = async (url: string) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), next: { revalidate: 86_400 } });
  if (!res.ok) return null;
  return res.json();
};

function fdaPdfLink(kNumber: string): string {
  // FDA hosts 510(k) summary letters under /cdrh_docs/pdf/ (pdf2/ for pre-1997 K numbers)
  const num = kNumber.replace(/^K/i, '');
  const dir = num.startsWith('9') && num.length === 6 ? 'pdf2' : 'pdf';
  return 'https://www.accessdata.fda.gov/cdrh_docs/' + dir + '/' + kNumber.toUpperCase() + '.pdf';
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'concern-device-info', 30, 60_000);
  if (limited) return limited;

  const productCode = req.nextUrl.searchParams.get('productCode')?.trim().toUpperCase();
  const kNumbers = (req.nextUrl.searchParams.get('kNumbers') || '')
    .split(',')
    .map(k => k.trim().toUpperCase())
    .filter(k => /^K\d{6}$/.test(k))
    .slice(0, 5);

  if (!productCode && !kNumbers.length) {
    return NextResponse.json({ available: false, note: 'No product code or K number provided.' });
  }

  const [classification, clearances] = await Promise.all([
    productCode
      ? fdaGet('https://api.fda.gov/device/classification.json?search=product_code:' + encodeURIComponent(productCode) + '&limit=1')
      : Promise.resolve(null),
    kNumbers.length
      ? fdaGet('https://api.fda.gov/device/510k.json?search=' + encodeURIComponent(kNumbers.map(k => 'k_number.exact:' + k).join('+OR+')) + '&limit=5')
      : Promise.resolve(null),
  ]);

  const classificationInfo = classification?.results?.[0] || null;
  const clearanceResults: K510Result[] = clearances?.results || [];
  const clearanceList = clearanceResults
    .sort((a, b) => (b.decision_date || '').localeCompare(a.decision_date || ''))
    .map(r => ({
      kNumber: r.k_number,
      deviceName: r.device_name,
      applicant: r.applicant,
      decisionDate: r.decision_date,
      decision: r.decision_description,
      pdfUrl: r.k_number ? fdaPdfLink(r.k_number) : null,
    }));

  return NextResponse.json({
    available: !!(classificationInfo || clearanceList.length),
    classification: classificationInfo
      ? {
          deviceName: classificationInfo.device_name,
          deviceClass: classificationInfo.device_class,
          regulationNumber: classificationInfo.regulation_number,
          specialty: classificationInfo.medical_specialty_description,
          panel: classificationInfo.review_panel,
        }
      : null,
    clearances: clearanceList,
    note: !classificationInfo && !clearanceList.length
      ? 'FDA databases are temporarily unreachable; device class and clearance history will appear when the connection returns.'
      : undefined,
  });
}
