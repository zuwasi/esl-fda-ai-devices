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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">End-to-End Remediation - Not Scan-and-Leave</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find it. Understand it. Fix it. Prove it. See how ESL closes the engineering loop for
            FDA software evidence - across source, build artifacts, and binary-only systems.
          </p>
        </div>

        {/* Featured executive brief */}
        <a
          href="/case-studies/unit-testing-code-coverage"
          className="block bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl overflow-hidden mb-10 text-white card-hover"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-blue-900 font-bold uppercase tracking-wider">Executive Brief</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100">Medical Device Software / IEC 62304</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100">7 FDA enforcement cases</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Static Code Analysis Alone Is Not Enough: Add Unit Testing &amp; Code Coverage</h2>
            <p className="text-blue-100 text-sm mb-4">
              Seven FDA enforcement cases. One consistent pattern: teams that passed system-level testing and managed
              static-analysis findings were still cited for missing code-level verification. The full brief maps each
              case to the exact ESL solution with Parasoft tools.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">
              Read the brief &rarr;
            </span>
          </div>
        </a>

        <div className="space-y-8">
          {caseStudies.map((cs) => (
            <a key={cs.id} href={'/case-studies/' + cs.id} className="block bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{cs.pathway}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{cs.specialty}</span>
                  {cs.sourceUrl && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium border border-green-200">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {cs.sourceLabel || 'Verified'}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{cs.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before ESL */}
                  <div className="bg-red-50 rounded-xl p-5">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs">?</span>
                      Before ESL
                    </h3>
                    <ul className="space-y-2">
                      {cs.beforeESL.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-sm text-red-800 flex gap-2">
                          <span className="text-red-400">&bull;</span> {item}
                        </li>
                      ))}
                      {cs.beforeESL.length > 3 && (
                        <li className="text-xs text-red-500">+{cs.beforeESL.length - 3} more on the case page</li>
                      )}
                    </ul>
                  </div>

                  {/* After ESL */}
                  <div className="bg-green-50 rounded-xl p-5">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs">V</span>
                      After ESL
                    </h3>
                    <ul className="space-y-2">
                      {cs.afterESL.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-sm text-green-800 flex gap-2">
                          <span className="text-green-500">&bull;</span> {item}
                        </li>
                      ))}
                      {cs.afterESL.length > 3 && (
                        <li className="text-xs text-green-600">+{cs.afterESL.length - 3} more on the case page</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Result:</strong> {cs.result}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-700">
                  Read the full case &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Bring ESL the software - not a cleaned-up demo</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            We will build, clean and connect the evidence. Start with a software evidence scoping workshop.
          </p>
          <a href="https://eswlab.com/contact-us/?your-subject=FDA%20Software%20Evidence%20Scoping%20Workshop"
            target="_blank" rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50">
            Schedule Scoping Workshop &rarr;
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
