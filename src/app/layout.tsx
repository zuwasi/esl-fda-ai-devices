import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://esl-fda.io';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ESL FDA AI Device Intelligence',
    template: '%s | ESL FDA AI Device Intelligence',
  },
  description: 'The only free public platform that combines semantic search of every FDA-authorized AI medical device with live regulatory risk monitoring, cybersecurity evidence analysis, and IEC 62304 risk classification.',
  keywords: ['FDA', 'AI medical devices', '510(k)', 'PMA', 'De Novo', 'SBOM', 'IEC 62304', 'cybersecurity', 'warning letters', 'recalls', 'adverse events', 'regulatory compliance', 'software evidence'],
  authors: [{ name: 'ESL Software Evidence Services', url: 'https://eswlab.com' }],
  creator: 'ESL Software Evidence Services',
  publisher: 'ESL Software Evidence Services',
  icons: {
    icon: '/fda-services-icon.png',
    apple: '/fda-services-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'ESL FDA AI Device Intelligence',
    title: 'ESL FDA AI Device Intelligence',
    description: 'Search every FDA-authorized AI medical device with semantic search, live regulatory risk monitoring, cybersecurity evidence analysis, and IEC 62304 risk classification.',
    images: [{ url: '/fda-services-icon.png', width: 512, height: 512, alt: 'ESL FDA AI Device Intelligence' }],
  },
  twitter: {
    card: 'summary',
    title: 'ESL FDA AI Device Intelligence',
    description: 'Search every FDA-authorized AI medical device with regulatory risk monitoring and cybersecurity evidence analysis.',
    images: ['/fda-services-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
