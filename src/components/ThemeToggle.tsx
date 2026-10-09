'use client';

export default function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      // Private mode: theme just won't persist.
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      title="Toggle theme"
      className="theme-toggle relative inline-flex items-center gap-2 h-9 px-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-blue-700 hover:border-blue-300 shadow-sm"
    >
      {/* Sun icon + label: visible in dark mode (click to go light) */}
      <svg className="theme-toggle-sun w-[18px] h-[18px] text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <span className="theme-toggle-sun-label text-xs font-semibold whitespace-nowrap">Switch to daylight mode</span>
      {/* Moon icon: visible in light mode (click to go dark) */}
      <svg className="theme-toggle-moon w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
