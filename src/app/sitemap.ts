import type { MetadataRoute } from 'next';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://esl-fda.io';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const filePath = path.join(process.cwd(), 'api', 'fda_ai_records.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true }) as any[];

  const deviceUrls = records
    .filter((r) => r.submission_number && r.submission_number.trim() && r.submission_number !== 'error')
    .map((r) => ({
      url: SITE_URL + '/device/' + r.submission_number,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const staticUrls = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: SITE_URL + '/search', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: SITE_URL + '/about', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: SITE_URL + '/case-studies', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: SITE_URL + '/assessment', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: SITE_URL + '/privacy', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: SITE_URL + '/terms', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  return [...staticUrls, ...deviceUrls];
}