import { notFound } from 'next/navigation';
import DeviceDetailClient from './DeviceDetailClient';
import { getDevice } from '@/lib/devices';
import { analyzeCyberEvidence } from '@/lib/cyberAnalysis';
import { classifyRisk, getRegulatoryPathway } from '@/lib/riskClassification';

const SITE_URL = 'https://esl-fda.io';

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getDevice(id);

  if (!record) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalDevice',
    name: record.device_model || 'Unnamed Device',
    manufacturer: { '@type': 'Organization', name: record.company },
    identifier: record.submission_number,
    regulatoryID: record.submission_number,
    category: record.ai_function || '',
    applicationCategory: 'Medical Device',
    deviceCategory: getRegulatoryPathway(record.submission_number),
    dateApproved: record.date_of_final_decision,
    description: record.thesis || '',
    url: `${SITE_URL}/device/${record.submission_number}`,
  };

  const data = {
    record,
    cyber: analyzeCyberEvidence(record),
    risk: classifyRisk(record),
  };

  return (
    <>
      <script
        id="device-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <DeviceDetailClient id={id} data={data} />
    </>
  );
}
