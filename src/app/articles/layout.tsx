import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles & Regulatory News',
  description:
    'Curated regulatory news and ESL briefs on FDA-authorized AI medical devices: recall system concerns, the 510(k) pathway, generative AI regulation, and software verification enforcement trends.',
  alternates: { canonical: '/articles' },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
