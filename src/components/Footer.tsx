import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
                <span className="text-white font-bold">E</span>
              </div>
              <Image
                src="/fda-services-icon.png"
                alt="FDA Services"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="text-lg font-bold text-white">ESL Engineering Software Lab</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              FDA software evidence services: SBOM &amp; CVE remediation, static analysis &amp; bug fixing,
              unit testing &amp; code coverage, traceability &amp; audit-ready reports.
              Find it. Understand it. Fix it. Prove it.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white">Search Devices</a></li>
              <li><a href="/assessment" className="hover:text-white">Submission Readiness</a></li>
              <li><a href="/case-studies" className="hover:text-white">Case Studies</a></li>
              <li><a href="/about" className="hover:text-white">About ESL</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:sales@eswlab.com" className="hover:text-white">sales@eswlab.com</a></li>
              <li><a href="https://www.eswlab.com" className="hover:text-white">www.eswlab.com</a></li>
              <li className="text-gray-400">+972 9 8855803</li>
              <li className="text-gray-400">Ha-Nagar 24 A, Hod Hasharon, Israel</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            This platform is an assistive tool and may make errors. Not legal or regulatory advice.
            The manufacturer retains responsibility for safety, effectiveness, and submissions.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Powered by SBOMator™</span>
            <span>•</span>
            <span>Parasoft C/C++test (TÜV SÜD certified)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
