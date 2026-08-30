import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for ESL FDA AI Device Intelligence - acceptable use, disclaimers, and limitations for esl-fda.io.',
  alternates: { canonical: 'https://esl-fda.io/terms' },
  openGraph: {
    title: 'Terms of Use | ESL FDA AI Device Intelligence',
    description: 'Acceptable use, disclaimers, and limitations for esl-fda.io.',
    url: 'https://esl-fda.io/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
