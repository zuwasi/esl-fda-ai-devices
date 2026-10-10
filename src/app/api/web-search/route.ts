import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Real-time web info about a device, powered by the OpenAI Responses API with
 * the web search tool. Enable by setting OPENAI_API_KEY in the environment.
 * Each call runs a live web search and returns a short summary with source
 * links (web search is billed per search by OpenAI).
 */

interface Citation {
  url: string;
  title: string;
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'web-search', 10, 60_000);
  if (limited) return limited;

  const openAiKey = process.env.OPENAI_API_KEY;
  const device = req.nextUrl.searchParams.get('device')?.trim().slice(0, 120);
  const company = req.nextUrl.searchParams.get('company')?.trim().slice(0, 120);
  const submission = req.nextUrl.searchParams.get('submission')?.trim().slice(0, 40);

  if (!openAiKey) {
    return NextResponse.json({ available: false, reason: 'Live web search is not configured on the server (missing OPENAI_API_KEY).' });
  }
  if (!device || !company) {
    return NextResponse.json({ available: false, reason: 'Missing device or company.' });
  }

  const prompt = `A visitor is viewing the FDA-authorized AI medical device "${device}" by ${company}`
    + (submission ? ` (FDA submission ${submission})` : '')
    + `. Search the live web for authoritative information about this device and its AI: what the AI does, what the device is used for, and any notable public information such as recalls, warnings, or news. Reply with a concise factual summary of 3-4 sentences based on what you find.`;

  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        tools: [{ type: 'web_search' }],
        input: prompt,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!upstream.ok) {
      if (upstream.status === 401) {
        return NextResponse.json({ available: false, reason: 'The OpenAI API key configured on the server is invalid or expired.' });
      }
      const errText = await upstream.text().catch(() => '');
      return NextResponse.json({ available: false, reason: `OpenAI returned HTTP ${upstream.status}.` , detail: errText.slice(0, 200) });
    }

    const data = await upstream.json();
    const citations: Citation[] = [];
    let summary = '';
    for (const item of data.output || []) {
      if (item.type === 'message') {
        for (const block of item.content || []) {
          if (block.type === 'output_text') {
            summary += block.text || '';
            for (const ann of block.annotations || []) {
              if (ann.type === 'url_citation' && ann.url && !citations.some(c => c.url === ann.url)) {
                citations.push({ url: ann.url, title: ann.title || ann.url });
              }
            }
          }
        }
      }
    }
    if (!summary.trim()) {
      return NextResponse.json({ available: false, reason: 'OpenAI returned no summary for this device.' });
    }
    // OpenAI inlines citations as markdown links like ([example.com](url)); the
    // Sources list below already presents them, so drop the inline markers.
    summary = summary.replace(/\s*\(\s*\[[^\]]+\]\([^)]+\)\s*\)/g, '');
    return NextResponse.json({ available: true, summary: summary.trim(), sources: citations.slice(0, 8) });
  } catch {
    return NextResponse.json({ available: false, reason: 'Could not reach OpenAI. Try again later.' });
  }
}
