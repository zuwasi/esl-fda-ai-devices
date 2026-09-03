import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() || '';

  if (hostname.endsWith('.up.railway.app')) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = 'https';
    canonicalUrl.host = 'esl-fda.io';
    canonicalUrl.port = '';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  return NextResponse.next();
}
