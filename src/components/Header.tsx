import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <Image
                src="/fda-services-icon.png"
                alt="FDA Services"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <span className="text-lg font-bold text-gray-900">ESL</span>
                <span className="text-sm font-medium text-gray-500 ml-1">FDA AI Device Intelligence</span>
              </div>
            </div>
          </a>
          <nav className="flex items-center gap-1 sm:gap-4">
            <a href="/" className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-2 rounded">Search</a>
            <a href="/assessment" className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-2 rounded">Assessment</a>
            <a href="/case-studies" className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-2 rounded">Case Studies</a>
            <a href="/about" className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-2 rounded">About</a>
            <a href="mailto:sales@eswlab.com" className="hidden sm:inline-block text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
              Contact ESL
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
