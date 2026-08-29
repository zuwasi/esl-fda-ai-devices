import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search FDA AI Medical Devices',
  description: 'Search and filter 1,200+ FDA-authorized AI medical devices by clinical panel, company, regulatory pathway, AI function, product code, risk class, and cybersecurity evidence.',
  alternates: { canonical: 'https://esl-fda.io/search' },
  openGraph: {
    title: 'Search FDA AI Medical Devices | ESL FDA AI Device Intelligence',
    description: 'Search and filter 1,200+ FDA-authorized AI medical devices with semantic search and faceted filtering.',
    url: 'https://esl-fda.io/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}