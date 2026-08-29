import type { Metadata } from 'next';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://esl-fda.io';

function loadDevice(id: string) {
  try {
    const filePath = path.join(process.cwd(), 'api', 'fda_ai_records.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true }) as any[];
    return records.find((r) => r.submission_number === id) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const device = loadDevice(id);

  if (!device) {
    return {
      title: 'Device Not Found',
      description: 'The requested FDA AI medical device was not found.',
    };
  }

  const deviceName = device.device_model || 'Unnamed Device';
  const company = device.company || '';
  const pathway = device.submission_number?.toUpperCase().startsWith('K') ? '510(k)'
    : device.submission_number?.toUpperCase().startsWith('DEN') ? 'De Novo'
    : device.submission_number?.toUpperCase().startsWith('P') ? 'PMA' : '';
  const description = device.thesis
    ? device.thesis.substring(0, 160)
    : company + ' ' + deviceName + ' - FDA-authorized AI medical device (' + pathway + ').';

  return {
    title: deviceName + ' - ' + company,
    description,
    alternates: { canonical: SITE_URL + '/device/' + id },
    openGraph: {
      title: deviceName + ' - ' + company + ' | ESL FDA AI Device Intelligence',
      description,
      url: SITE_URL + '/device/' + id,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: deviceName + ' - ' + company,
      description,
    },
  };
}

export default function DeviceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
