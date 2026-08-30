import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for ESL FDA AI Device Intelligence - how we handle data, cookies, and analytics on esl-fda.io.',
  alternates: { canonical: 'https://esl-fda.io/privacy' },
  openGraph: {
    title: 'Privacy Policy | ESL FDA AI Device Intelligence',
    description: 'How we handle data, cookies, and analytics on esl-fda.io.',
    url: 'https://esl-fda.io/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
