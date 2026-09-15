import { NextResponse } from 'next/server';
import { getRegulatoryData, emptyConcernSet } from '@/lib/regulatory-data';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(req: Request) {
  const limited = rateLimit(req, 'regulatory-concerns', 30);
  if (limited) return limited;

  const url = new URL(req.url);
  const company = url.searchParams.get('company');
  const deviceName = url.searchParams.get('deviceName');
  if (!company || !deviceName) return NextResponse.json({ error: 'Company and device name required.' }, { status: 400 });

  try {
    const data = await getRegulatoryData(company, deviceName);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Regulatory concerns API error:', error);
    return NextResponse.json({
      company, deviceName,
      deviceSpecific: emptyConcernSet(),
      companyWide: emptyConcernSet(),
      warningLetters: { letters: [], total: 0, searchUrl: '', note: 'FDA Warning Letters search is temporarily unavailable.' },
    });
  }
}
