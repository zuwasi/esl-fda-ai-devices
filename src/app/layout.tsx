import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESL FDA AI Device Intelligence',
  description: 'Search, assess, and prepare FDA-authorized AI medical device submissions with ESL Software Evidence Services.',
  icons: {
    icon: '/fda-services-icon.png',
    apple: '/fda-services-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
