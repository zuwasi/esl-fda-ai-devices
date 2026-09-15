import { NextResponse } from 'next/server';

// Simple fixed-window in-memory rate limiter (per server instance).
// Good enough for a single-instance Railway deployment; swap for a shared
// store (e.g. Upstash) if the app ever scales beyond one instance.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_TRACKED_CLIENTS = 10000;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(
  req: Request,
  bucket: string,
  limit: number,
  windowMs: number = 60_000,
): NextResponse | null {
  const key = `${bucket}:${getClientIp(req)}`;
  const now = Date.now();

  if (windows.size >= MAX_TRACKED_CLIENTS) {
    for (const [k, w] of windows) {
      if (w.resetAt <= now) windows.delete(k);
    }
    if (windows.size >= MAX_TRACKED_CLIENTS) windows.clear();
  }

  let win = windows.get(key);
  if (!win || win.resetAt <= now) {
    win = { count: 0, resetAt: now + windowMs };
    windows.set(key, win);
  }

  win.count += 1;
  if (win.count > limit) {
    const retryAfter = Math.ceil((win.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  return null;
}
