import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Optional real-time metasearch via a SearXNG instance
 * (https://github.com/searxng/searxng). Enable by setting SEARXNG_URL in the
 * environment to the instance base URL, with `search:
 * formats: [html, json]` in the instance's settings.yml so the JSON API is
 * allowed. When unset, the endpoint reports available: false and the UI hides
 * the feature.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'web-search', 20, 60_000);
  if (limited) return limited;

  const searxngUrl = process.env.SEARXNG_URL;
  const q = req.nextUrl.searchParams.get('q')?.trim().slice(0, 200);
  if (!searxngUrl || !q) {
    return NextResponse.json({ available: false, reason: !q ? 'Missing search query.' : 'Live web search is not configured on the server.' });
  }

  try {
    const upstream = await fetch(
      searxngUrl.replace(/\/+$/, '') + '/search?q=' + encodeURIComponent(q) + '&format=json&language=en',
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) },
    );
    if (!upstream.ok) {
      return NextResponse.json({ available: false, reason: `Metasearch instance returned HTTP ${upstream.status} (JSON format may be disabled in its settings).` });
    }
    const data = await upstream.json();
    const results = (data.results || [])
      .slice(0, 5)
      .map((r: { title?: string; url?: string; content?: string }) => ({
        title: r.title || r.url || 'Result',
        url: r.url,
        snippet: (r.content || '').slice(0, 300),
      }))
      .filter((r: { url?: string }) => !!r.url);
    return NextResponse.json({ available: true, results });
  } catch {
    return NextResponse.json({ available: false, reason: 'Could not reach the metasearch instance.' });
  }
}
