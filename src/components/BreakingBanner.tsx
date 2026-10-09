'use client';

import { useEffect, useState } from 'react';
import { articles } from '@/lib/articles';

/** The banner always shows the three newest articles. */
const FLASHES = articles.slice(0, 3).map(a => ({
  label: a.source,
  text: (
    <>
      <strong>{a.title}</strong> - {a.summary.length > 140 ? a.summary.slice(0, 140) + '…' : a.summary}{' '}
      <a
        href={a.url}
        target={a.external ? '_blank' : undefined}
        rel={a.external ? 'noopener noreferrer' : undefined}
        className="font-bold text-blue-700 underline whitespace-nowrap hover:text-blue-900"
      >
        Read more &rarr;
      </a>
    </>
  ),
}));

export default function BreakingBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % FLASHES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (FLASHES.length === 0) return null;

  const flash = FLASHES[index];

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="border-b border-amber-200 bg-amber-50 text-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 flex-wrap py-2.5">
        <span
          key={flash.label}
          className="inline-flex items-center gap-1.5 font-bold text-xs tracking-wider uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
          {flash.label}
        </span>
        <span key={index} className="text-sm font-medium banner-swap">
          {flash.text}
        </span>
        <a
          href="/articles"
          className="ml-auto text-xs font-semibold text-blue-700 underline whitespace-nowrap hover:text-blue-900"
        >
          All articles
        </a>
      </div>
    </div>
  );
}
