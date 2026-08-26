import { NextResponse } from 'next/server';

interface RecallResult {
  product_description: string;
  reason_for_recall: string;
  root_cause_description: string;
  recall_status: string;
  event_date_posted: string;
  product_code: string;
  recalling_firm: string;
  res_event_number: string;
}

interface AdverseEventResult {
  event_type: string;
  report_number: string;
  date_received: string;
  date_of_event: string;
  device?: Array<{
    brand_name: string;
    generic_name: string;
    manufacturer_d_name: string;
    device_report_product_code: string;
  }>;
  product_problems?: string[];
  patient?: Array<{
    patient_problems?: string[];
    patient_age?: string;
    patient_sex?: string;
  }>;
  mdr_text?: Array<{
    text_type_code: string;
    text: string;
  }>;
}

interface RegulatoryResponse {
  company: string;
  recalls: {
    total: number;
    results: Array<{
      product: string;
      reason: string;
      rootCause: string;
      status: string;
      date: string;
      firm: string;
      eventNumber: string;
    }>;
  };
  adverseEvents: {
    total: number;
    results: Array<{
      eventType: string;
      reportNumber: string;
      dateReceived: string;
      deviceName: string;
      deviceGeneric: string;
      problems: string;
      patientImpact: string;
      description: string;
    }>;
  };
  warningLetters: {
    searchUrl: string;
    note: string;
  };
}

function getPrimaryCompanyName(company: string): string {
  // Take the first significant word for broad matching
  const cleaned = company.replace(/[.,]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => w.length > 2 && !['Inc', 'LLC', 'Corp', 'Ltd', 'Co', 'The', 'And', 'GmbH', 'SA', 'AG'].includes(w));
  return words[0] || cleaned.split(/\s+/)[0] || company;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = url.searchParams.get('company');

    if (!company) {
      return NextResponse.json({ error: 'Company name required.' }, { status: 400 });
    }

    const primaryName = getPrimaryCompanyName(company);
    const encodedName = encodeURIComponent(JSON.stringify(primaryName));

    const recallUrl = `https://api.fda.gov/device/recall.json?search=recalling_firm:${encodedName}&limit=10&sort=event_date_posted:desc`;
    const eventUrl = `https://api.fda.gov/device/event.json?search=device.manufacturer_d_name:${encodedName}&limit=10&sort=date_received:desc`;

    // Search FDA APIs in parallel
    const [recallRes, eventRes] = await Promise.all([
      fetch(recallUrl).then(r => r.json()).catch(() => ({ results: [], meta: { results: { total: 0 } } })),
      fetch(eventUrl).then(r => r.json()).catch(() => ({ results: [], meta: { results: { total: 0 } } })),
    ]);

    const recallResults = (recallRes.results || []) as RecallResult[];
    const eventResults = (eventRes.results || []) as AdverseEventResult[];

    const response: RegulatoryResponse = {
      company,
      recalls: {
        total: recallRes.meta?.results?.total || 0,
        results: recallResults.map(r => ({
          product: (r.product_description || 'N/A').substring(0, 200),
          reason: (r.reason_for_recall || 'N/A').substring(0, 300),
          rootCause: r.root_cause_description || 'N/A',
          status: r.recall_status || 'N/A',
          date: r.event_date_posted || 'N/A',
          firm: r.recalling_firm || 'N/A',
          eventNumber: r.res_event_number || 'N/A',
        })),
      },
      adverseEvents: {
        total: eventRes.meta?.results?.total || 0,
        results: eventResults.map(e => ({
          eventType: e.event_type || 'N/A',
          reportNumber: e.report_number || 'N/A',
          dateReceived: e.date_received || 'N/A',
          deviceName: e.device?.[0]?.brand_name || 'N/A',
          deviceGeneric: e.device?.[0]?.generic_name || 'N/A',
          problems: (e.product_problems || []).join(', ') || 'N/A',
          patientImpact: (e.patient?.[0]?.patient_problems || []).join(', ') || 'N/A',
          description: (e.mdr_text?.find(t => t.text_type_code === 'Description of Event or Problem')?.text || '').substring(0, 400),
        })),
      },
      warningLetters: {
        searchUrl: `https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters?field_company_name=${encodeURIComponent(primaryName)}`,
        note: 'FDA Warning Letters are searched on the FDA website. Click to view any warning letters issued to this company.',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Regulatory concerns API error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
