import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ESL FDA AI Device Intelligence',
  description: 'ESL FDA AI Device Intelligence is the only free public platform combining semantic search of FDA-authorized AI medical devices with live regulatory risk monitoring, cybersecurity evidence analysis, and IEC 62304 risk classification.',
  alternates: { canonical: 'https://esl-fda.io/about' },
  openGraph: {
    title: 'About ESL FDA AI Device Intelligence',
    description: 'The only free public platform combining semantic search of FDA-authorized AI medical devices with live regulatory risk monitoring and cybersecurity evidence analysis.',
    url: 'https://esl-fda.io/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}