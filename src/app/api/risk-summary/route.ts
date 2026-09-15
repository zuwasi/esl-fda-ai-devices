import { NextResponse } from 'next/server';
import { getRegulatoryData, type RegulatoryData } from '@/lib/regulatory-data';
import { rateLimit } from '@/lib/rateLimit';

interface RiskSummary {
  summary: string;
  themes: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

interface CacheEntry { summary: RiskSummary; timestamp: number }

const CACHE = new Map<string, CacheEntry>();
const CACHE_MAX = 500; // bound memory from attacker-varied parameters
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function llmConfig(): { provider: 'gemini' | 'openai' | 'anthropic'; key: string } | null {
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', key: process.env.GEMINI_API_KEY };
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', key: process.env.OPENAI_API_KEY };
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', key: process.env.ANTHROPIC_API_KEY };
  return null;
}

const SYSTEM_PROMPT = 'You are a medical device regulatory analyst. You are given FDA data (recalls, adverse events from MAUDE, and warning letters) for a device company. Respond ONLY with a JSON object with keys: "summary" (2-3 plain-language sentences describing the main risk profile), "themes" (exactly 3 short risk theme labels, each 2-5 words), and "trend" ("improving", "stable", or "worsening" based on event dates). Do not speculate beyond the data. If there is little or no data, say so briefly in the summary and use empty themes with trend "stable".';

function buildContext(data: RegulatoryData): string {
  const d = data.deviceSpecific;
  const c = data.companyWide;
  const lines: string[] = [];

  lines.push(`Device: ${data.deviceName} (company: ${data.company})`);
  lines.push(`Device-specific recalls: ${d.recalls.total} total. Recent reasons:`);
  for (const r of d.recalls.results.slice(0, 10)) lines.push(`- [${r.date}] ${r.reason} (status: ${r.status})`);
  lines.push(`Company-wide recalls: ${c.recalls.total} total.`);
  lines.push(`Device-specific adverse events (MAUDE): ${d.adverseEvents.total} total. Recent reports:`);
  for (const e of d.adverseEvents.results.slice(0, 10)) lines.push(`- [${e.dateReceived}] ${e.eventType}: problems=${e.problems}; patient impact=${e.patientImpact}`);
  lines.push(`Company-wide adverse events: ${c.adverseEvents.total} total.`);
  lines.push(`Warning letters for the company: ${data.warningLetters.total} total.`);
  for (const wl of data.warningLetters.letters.slice(0, 5)) lines.push(`- [${wl.issueDate}] ${wl.subject} (${wl.closeoutDate ? 'closed out ' + wl.closeoutDate : 'open/no closeout'})`);

  return lines.join('\n');
}

async function callLlm(provider: 'gemini' | 'openai' | 'anthropic', key: string, context: string): Promise<RiskSummary> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    let text: string | undefined;
    if (provider === 'gemini') {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: context }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) throw new Error('Gemini API error ' + res.status);
      const json = await res.json();
      text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: context }],
          temperature: 0.2, response_format: { type: 'json_object' },
        }),
      });
      if (!res.ok) throw new Error('OpenAI API error ' + res.status);
      const json = await res.json();
      text = json?.choices?.[0]?.message?.content;
    } else {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5', max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: context }],
        }),
      });
      if (!res.ok) throw new Error('Anthropic API error ' + res.status);
      const json = await res.json();
      text = json?.content?.[0]?.text;
    }

    if (!text) throw new Error('Empty LLM response');
    const parsed = JSON.parse(text) as Partial<RiskSummary>;
    if (!parsed.summary || typeof parsed.summary !== 'string') throw new Error('LLM response missing summary');
    const trend = ['improving', 'stable', 'worsening'].includes(String(parsed.trend)) ? (parsed.trend as RiskSummary['trend']) : 'stable';
    return {
      summary: parsed.summary,
      themes: Array.isArray(parsed.themes) ? parsed.themes.filter((t): t is string => typeof t === 'string').slice(0, 3) : [],
      trend,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  const limited = rateLimit(req, 'risk-summary', 10);
  if (limited) return limited;

  const url = new URL(req.url);
  const company = url.searchParams.get('company');
  const deviceName = url.searchParams.get('deviceName');
  if (!company || !deviceName) return NextResponse.json({ error: 'Company and device name required.' }, { status: 400 });

  const config = llmConfig();
  if (!config) return NextResponse.json({ available: false, reason: 'No LLM API key configured.' });

  const cacheKey = (company + '|' + deviceName).toLowerCase();
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ available: true, ...cached.summary, cached: true });
  }

  try {
    const data = await getRegulatoryData(company, deviceName);
    const hasData = data.deviceSpecific.recalls.total > 0 || data.deviceSpecific.adverseEvents.total > 0 || data.warningLetters.total > 0;
    if (!hasData) return NextResponse.json({ available: false, reason: 'No regulatory concerns data to summarize.' });

    const summary = await callLlm(config.provider, config.key, buildContext(data));
    if (CACHE.size >= CACHE_MAX) {
      const oldest = CACHE.keys().next().value;
      if (oldest !== undefined) CACHE.delete(oldest);
    }
    CACHE.set(cacheKey, { summary, timestamp: Date.now() });
    return NextResponse.json({ available: true, ...summary });
  } catch (error) {
    console.error('Risk summary API error:', error);
    return NextResponse.json({ available: false, reason: 'AI summary temporarily unavailable.' });
  }
}
