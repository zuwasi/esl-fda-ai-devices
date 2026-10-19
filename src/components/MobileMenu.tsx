'use client';

import { useEffect, useState } from 'react';

/** Hamburger menu for narrow screens. Renders a panel anchored under the sticky header. */
export default function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
        )}
      </button>
      {open && (
        <div id="mobile-menu" className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-700 rounded-lg hover:bg-gray-50">
                {l.label}
              </a>
            ))}
            <a
              href="https://eswlab.com/contact-us/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 mb-2 inline-flex justify-center text-sm font-semibold text-white px-4 py-3 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}
            >
              Contact ESL
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
