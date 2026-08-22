'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { caseStudies } from '@/lib/caseStudies';

export default function CaseStudiesPage() {
  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">End-to-End Remediation — Not Scan-and-Leave</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find it. Understand it. Fix it. Prove it. See how ESL closes the engineering loop for
            FDA software evidence — across source, build artifacts, and binary-only systems.
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((cs) => (
            <div key={cs.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{cs.pathway}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{cs.specialty}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{cs.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before ESL */}
                  <div className="bg-red-50 rounded-xl p-5">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs">✗</span>
                      Before ESL
                    </h3>
                    <ul className="space-y-2">
                      {cs.beforeESL.map((item, i) => (
                        <li key={i} className="text-sm text-red-800 flex gap-2">
                          <span className="text-red-400">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* After ESL */}
                  <div className="bg-green-50 rounded-xl p-5">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs">✓</span>
                      After ESL
                    </h3>
                    <ul className="space-y-2">
                      {cs.afterESL.map((item, i) => (
                        <li key={i} className="text-sm text-green-800 flex gap-2">
                          <span className="text-green-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Result:</strong> {cs.result}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Bring ESL the software — not a cleaned-up demo</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            We will build, clean and connect the evidence. Start with a software evidence scoping workshop.
          </p>
          <a href="mailto:sales@eswlab.com?subject=FDA Software Evidence Scoping Workshop"
            className="inline-block px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50">
            Schedule Scoping Workshop →
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
