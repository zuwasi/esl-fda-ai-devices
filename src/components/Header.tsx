import Image from 'next/image';
import BreakingBanner from '@/components/BreakingBanner';
import MobileMenu from '@/components/MobileMenu';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Search' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-3 h-16">
            <a href="/" className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src="/esl-icon.png"
                  alt="ESL"
                  width={36}
                  height={36}
                  className="object-contain shrink-0"
                />
                <Image
                  src="/fda-services-icon.png"
                  alt="FDA Services"
                  width={40}
                  height={40}
                  className="object-contain shrink-0"
                />
                <div className="min-w-0 whitespace-nowrap">
                  <span className="text-lg font-bold text-gray-900">ESL</span>
                  <span className="hidden xl:inline text-sm font-medium text-gray-500 ml-1">FDA AI Device Intelligence</span>
                </div>
              </div>
            </a>
            <nav className="hidden lg:flex items-center gap-1 xl:gap-3">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-2 rounded whitespace-nowrap">{l.label}</a>
              ))}
              <ThemeToggle />
              <a href="https://eswlab.com/contact-us/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
                <Image
                  src="/esl-icon.png"
                  alt="ESL"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                Contact ESL
              </a>
            </nav>
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <ThemeToggle />
              <MobileMenu links={NAV_LINKS} />
            </div>
          </div>
        </div>
      </header>
      <BreakingBanner />
    </>
  );
}
