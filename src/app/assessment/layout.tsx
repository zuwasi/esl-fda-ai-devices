import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submission Readiness Assessment',
  description: 'Assess your FDA software evidence readiness. Interactive wizard identifies evidence gaps in SBOM, cybersecurity, IEC 62304, and postmarket surveillance, with recommendations from ESL Software Evidence Services.',
  alternates: { canonical: 'https://esl-fda.io/assessment' },
  openGraph: {
    title: 'Submission Readiness Assessment | ESL FDA AI Device Intelligence',
    description: 'Assess your FDA software evidence readiness with an interactive gap analysis wizard.',
    url: 'https://esl-fda.io/assessment',
  },
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}