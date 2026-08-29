import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies - ESL FDA Software Evidence Services',
  description: 'Real ESL engagement results: Inovytec achieves FDA certification with Parasoft static analysis, and code coverage remediation for FDA compliance.',
  alternates: { canonical: 'https://esl-fda.io/case-studies' },
  openGraph: {
    title: 'Case Studies | ESL FDA AI Device Intelligence',
    description: 'Real ESL engagement results in FDA software evidence and regulatory compliance.',
    url: 'https://esl-fda.io/case-studies',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}