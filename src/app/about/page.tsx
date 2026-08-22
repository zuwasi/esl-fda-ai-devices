'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About ESL FDA AI Device Intelligence</h1>

        <div className="prose max-w-none space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-3">One Accountable Engineering Partner</h2>
            <p className="text-gray-600">
              Many FDA tasks. One complete software-evidence workstream. You keep ownership of the
              product and submission. ESL owns the execution of the software analysis, remediation,
              testing and evidence tasks in scope.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-3">The ESL FDA Software-Evidence Stack</h2>
            <p className="text-gray-600 mb-4">One ESL team. Two specialized evidence pillars.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-5">
                <h3 className="font-semibold text-blue-900 mb-2">SBOMator™ FDA Edition</h3>
                <p className="text-sm text-blue-800 mb-2">Developed by ESL</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Source, package, container, firmware and binary-only analysis</li>
                  <li>• CycloneDX SBOM, VEX decisions and CVSS v4.0 context</li>
                  <li>• CVE applicability review, remediation and cleaner reports</li>
                  <li>• Section 524B evidence mapping and postmarket monitoring</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-5">
                <h3 className="font-semibold text-green-900 mb-2">Parasoft C/C++test</h3>
                <p className="text-sm text-green-800 mb-2">Represented and implemented by ESL</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Static analysis with defect triage and source-code remediation</li>
                  <li>• Automated and engineer-authored unit testing</li>
                  <li>• Statement, branch, condition and MC/DC coverage</li>
                  <li>• Requirements-to-test traceability and ALM integration</li>
                  <li>• TÜV SÜD-certified for use in IEC 62304 development</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-3">Standards &amp; Frameworks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'FDA Cybersecurity in Medical Devices (2026)',
                'FD&C Act §524B — Cyber device requirements',
                'FDA General Principles of Software Validation',
                'IEC 62304 — Medical device software lifecycle',
                'ISO 14971 — Risk management',
                'MISRA C/C++ — Coding standards',
                'CERT C/C++ — Secure coding',
                'CWE — Common weakness enumeration',
                'CVSS v4.0 — Vulnerability scoring',
                'CycloneDX + VEX — SBOM format',
              ].map(s => (
                <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">✓</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Email:</span> <a href="mailto:sales@eswlab.com" className="text-blue-600 hover:underline">sales@eswlab.com</a></div>
              <div><span className="text-gray-500">Web:</span> <a href="https://www.eswlab.com" className="text-blue-600 hover:underline">www.eswlab.com</a></div>
              <div><span className="text-gray-500">Phone:</span> +972 9 8855803</div>
              <div><span className="text-gray-500">Office:</span> Ha-Nagar 24 A, Hod Hasharon, Israel</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-xs text-amber-800">
              This platform describes engineering services, not legal or regulatory advice. FDA guidance
              documents generally contain nonbinding recommendations unless specific statutory or regulatory
              requirements are cited. ESL does not guarantee FDA clearance, approval or inspection outcomes.
              The manufacturer retains responsibility for safety, effectiveness, quality-system compliance,
              risk decisions, validation and submissions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
