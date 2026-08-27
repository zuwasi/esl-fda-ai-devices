import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/esl-icon.png"
                alt="ESL"
                width={32}
                height={32}
                className="object-contain"
              />
              <Image
                src="/fda-services-icon.png"
                alt="FDA Services"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-lg font-bold text-white">ESL Engineering Software Lab</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              FDA software evidence services: SBOM & CVE remediation, static analysis & bug fixing,
              unit testing & code coverage, traceability & audit-ready reports.
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
              <li><a href="https://eswlab.com/contact-us/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Contact Form</a></li>
              <li><a href="mailto:sales@eswlab.com" className="hover:text-white">sales@eswlab.com</a></li>
              <li><a href="https://www.eswlab.com" className="hover:text-white">www.eswlab.com</a></li>
              <li className="text-gray-400">+972 9 8855803</li>
              <li className="text-gray-400">Ha-Nagar 24 A, Hod Hasharon, Israel</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              This platform is an assistive tool and may make errors. Not legal or regulatory advice.
              The manufacturer retains responsibility for safety, effectiveness, and submissions.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 whitespace-nowrap">
              <span>Powered by SBOMator</span>
              <span>|</span>
              <span>Parasoft C/C++test</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-600">
            Search engine based on{' '}
            <a href="https://arxiv.org/html/2602.00006v1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 underline">FDA AI Search</a>{' '}
            by Kavishwar & Lotter (Dana-Farber / Harvard, ML4H 2025, CC BY 4.0).{' '}
            Extended with regulatory-engineering layers by ESL.{' '}
            <a href="/about#attribution" className="text-gray-500 hover:text-gray-300 underline">Details</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
