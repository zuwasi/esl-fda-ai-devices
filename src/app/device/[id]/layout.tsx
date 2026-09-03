import type { Metadata } from 'next';
import { getDevice } from '@/lib/devices';
import { getRegulatoryPathway } from '@/lib/riskClassification';

const SITE_URL = 'https://esl-fda.io';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const device = getDevice(id);

  if (!device) {
    return {
      title: 'Device Not Found',
      description: 'The requested FDA AI medical device was not found.',
    };
  }

  const deviceName = device.device_model || 'Unnamed Device';
  const company = device.company || '';
  const pathway = getRegulatoryPathway(device.submission_number);
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
