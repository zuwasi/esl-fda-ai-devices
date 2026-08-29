import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ESL FDA AI Device Intelligence',
    short_name: 'ESL FDA AI',
    description: 'Search every FDA-authorized AI medical device with regulatory risk monitoring and cybersecurity evidence analysis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      { src: '/fda-services-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}