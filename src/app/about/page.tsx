'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { caseStudies } from '@/lib/caseStudies';

export default function AboutPage() {
  const verifiedCaseStudies = caseStudies.filter(cs => cs.sourceUrl);

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            ESL FDA Software Evidence Services
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            One Accountable Engineering Partner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Many FDA tasks. One complete software-evidence workstream. You keep ownership of the
            product and submission. ESL owns the execution of the software analysis, remediation,
            testing, and evidence tasks in scope.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a href="mailto:sales@eswlab.com?subject=FDA Software Evidence Scoping Workshop"
              className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
              Request a Scoping Workshop
            </a>
            <a href="/"
              className="px-6 py-3 text-blue-700 font-semibold rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors">
              Explore the Platform &rarr;
            </a>
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { title: 'Right-Sized to Your Submission', body: 'Not every product needs every activity. ESL identifies the applicable scope with your team — then performs only the work needed.' },
            { title: 'End-to-End Remediation', body: 'A long finding list does not help a submission. ESL closes the engineering loop: find it, understand it, fix it, prove it.' },
            { title: 'Engineers Who Fix, Not Reassign', body: 'Source is repaired by experienced engineers — not merely reassigned back to your team. Before/after evidence is retained.' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Four Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Four Software-Evidence Services. One Engagement.</h2>
          <p className="text-gray-600 mb-6 text-sm">Combine SBOM, CVE remediation, static analysis, code repair, unit tests, coverage, and ALM traceability — or take only the individual service you need.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: '01', title: 'SBOM Reports — Even From Binaries Only', points: [
                'Machine-readable SBOM plus human-readable inventory',
                'Known-vulnerability correlation, incl. binary-only discovery',
                'Applicability analysis, remediation & documented rationale',
                'Rescan after changes, residual status made explicit',
              ]},
              { num: '02', title: 'Static Code Analysis — and Actual Fixes', points: [
                'Rules & severity profile tuned to language and policy',
                'Findings triaged: defects, deviations, false positives',
                'MISRA C/C++, CERT C/C++, CWE & project rules',
                'Final scan & disposition tied to controlled baseline',
              ]},
              { num: '03', title: 'Unit Testing and Structural Coverage', points: [
                'Risk-appropriate test strategy & acceptance criteria',
                'Harnesses, stubs, mocks & target communication',
                'Statement, branch, condition & MC/DC where appropriate',
                'Uncovered / dead-code analysis with documented disposition',
              ]},
              { num: '04', title: 'Requirements-to-Test Proof in Your ALM', points: [
                'Requirements & risk controls mapped to test levels',
                'Executed tests exported into the ALM with results',
                'Traceability from requirement through tests to code',
                'Gaps & progress visible in dashboards & matrices',
              ]},
            ].map(svc => (
              <div key={svc.num} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{svc.num}</span>
                  <h3 className="font-semibold text-gray-900 text-sm">{svc.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {svc.points.map(p => (
                    <li key={p} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-blue-500 flex-shrink-0">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Find It. Understand It. Fix It. Prove It.</h2>
            <p className="text-blue-100 mb-6 text-sm">ESL closes the engineering loop for both source-code defects and software-component vulnerabilities — one repeatable remediation workflow.</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                { step: '1', title: 'Discover', body: 'Scan source, builds, dependencies, containers, firmware, and binaries.' },
                { step: '2', title: 'Triage', body: 'Remove noise, confirm applicability, classify impact, prioritize against risk.' },
                { step: '3', title: 'Remediate', body: 'Fix code defects; upgrade, replace, or patch vulnerable components.' },
                { step: '4', title: 'Verify', body: 'Rebuild, rescan, retest, and run regression checks.' },
                { step: '5', title: 'Evidence', body: 'Record tool versions, findings, dispositions, results, and traceability.' },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mx-auto mb-2">{s.step}</div>
                  <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-blue-200">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dual Pillar */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">One ESL Team. Two Specialized Evidence Pillars.</h2>
          <p className="text-gray-600 mb-6 text-sm">Use only the evidence activities your device, risk, and submission require.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold text-blue-900">SBOMator™</h3>
                <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded font-medium">Developed by ESL</span>
              </div>
              <p className="text-sm text-blue-800 mb-3">FDA-focused software supply-chain evidence</p>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li>• Source, package, container, firmware & binary-only analysis</li>
                <li>• CycloneDX SBOM, VEX decisions & CVSS v4.0 context</li>
                <li>• CVE applicability review, remediation & cleaner reports</li>
                <li>• Section 524B evidence mapping & postmarket monitoring</li>
                <li>• HBOM, FPGA & DataBOM evidence where applicable</li>
              </ul>
              <a href="https://eswlab.com/products/esl-ailogiclabs/sbomator/"
                className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline">Explore SBOMator FDA Edition &rarr;</a>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold text-green-900">Parasoft C/C++test</h3>
                <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded font-medium">Represented by ESL</span>
              </div>
              <p className="text-sm text-green-800 mb-3">IEC 62304-focused verification evidence</p>
              <ul className="text-sm text-green-700 space-y-1.5">
                <li>• Static analysis with defect triage & source-code remediation</li>
                <li>• Automated and engineer-authored unit testing</li>
                <li>• Statement, branch, condition & MC/DC coverage</li>
                <li>• Requirements-to-test traceability & ALM integration</li>
                <li>• TÜV SÜD-certified for use in IEC 62304 development</li>
              </ul>
              <a href="https://eswlab.com/parasoft/"
                className="inline-block mt-4 text-sm text-green-600 font-medium hover:underline">Explore Parasoft for Medical Devices &rarr;</a>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Complementary roles:</strong> SBOMator produces software-composition and cybersecurity evidence.
              Parasoft produces source-code verification evidence. ESL connects both to the controlled build, requirements,
              tests, findings, fixes, and release baseline. <strong>The manufacturer owns the regulatory decision; ESL supplies the engineering execution and objective evidence behind it.</strong>
            </p>
          </div>
        </div>

        {/* Before / After */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">From Scattered Findings to a Controlled Baseline</h2>
          <p className="text-gray-600 mb-6 text-sm">What changes when ESL owns the software-evidence execution.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs">✗</span>
                Before ESL
              </h3>
              <ul className="space-y-2">
                {['Unknown components', 'Noisy findings', 'Unowned defects', 'Incomplete tests', 'Disconnected evidence'].map(item => (
                  <li key={item} className="text-sm text-red-800 flex gap-2">
                    <span className="text-red-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs">✓</span>
                After ESL
              </h3>
              <ul className="space-y-2">
                {['Controlled baseline', 'Remediated findings', 'Repeatable tests', 'Reviewed reports', 'Explicit residual risk'].map(item => (
                  <li key={item} className="text-sm text-green-800 flex gap-2">
                    <span className="text-green-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Verified Case Studies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proof — Not Just Claims</h2>
          <p className="text-gray-600 mb-6 text-sm">Real, verified case studies from ESL's FDA and Parasoft engagements.</p>
          <div className="space-y-4">
            {verifiedCaseStudies.map(cs => (
              <div key={cs.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{cs.pathway}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{cs.specialty}</span>
                  {cs.sourceUrl && (
                    <a href={cs.sourceUrl} target="_blank" rel="noopener noreferrer"
                       className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium border border-green-200 hover:bg-green-100 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {cs.sourceLabel || 'Verified'}
                    </a>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{cs.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Before ESL</h4>
                    <ul className="space-y-1">
                      {cs.beforeESL.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-red-800 flex gap-1.5">
                          <span className="text-red-400">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-2">After ESL</h4>
                    <ul className="space-y-1">
                      {cs.afterESL.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-green-800 flex gap-1.5">
                          <span className="text-green-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-900"><strong>Result:</strong> {cs.result}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <a href="/case-studies" className="text-sm text-blue-600 font-medium hover:underline">See all case studies &rarr;</a>
          </div>
        </div>

        {/* Leadership */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Who You Work With</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
                  DL
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Daniel (Dani) Liezrowice</h3>
                <p className="text-sm text-gray-500 mb-3">CEO & Co-Founder, Engineering Software Lab (ESL)</p>
                <p className="text-sm text-gray-600 mb-3">
                  22+ years leading 250+ projects in static code analysis, dynamic testing, unit testing,
                  code coverage, and compliance-driven software quality initiatives. Background spans embedded
                  software, enterprise-scale C/C++/Java applications, and regulated industries across virtually
                  all major host and target operating systems.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Parasoft Israeli Distributor', 'FDA / IEC 62304 Expert', 'MISRA C/C++ Authority', 'ISO 26262 & ISO 21434'].map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standards Matrix */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Standards & Frameworks</h2>
          <p className="text-gray-600 mb-6 text-sm">ESL works against the standards your submission requires.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'FDA Cybersecurity in Medical Devices (2026)',
              'FD&C Act §524B — Cyber device requirements',
              'FDA General Principles of Software Validation',
              'IEC 62304 — Medical device software lifecycle',
              'ISO 14971 — Risk management',
              'MISRA C/C++ — Coding standards (2004/2012/2023)',
              'CERT C/C++ — Secure coding',
              'CWE — Common weakness enumeration',
              'CVSS v4.0 — Vulnerability scoring',
              'CycloneDX + VEX — SBOM format',
            ].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-200 px-4 py-3">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Language / Target Coverage */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Source Languages', body: 'C, C++, C#, Java, VB.NET, and other stacks through suitable static-analysis, testing, and software-composition technologies.' },
              { title: 'Execution Targets', body: 'Desktop, server, cloud, container, mobile, cross-compiled, and resource-constrained embedded targets — including on-target testing.' },
              { title: 'Available Artifacts', body: 'Full repositories, partial source, package manifests, build outputs, containers, firmware, and binaries. SBOM work does not require a perfect source tree.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mb-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Bring ESL the Software — Not a Cleaned-Up Demo</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">
            We will build, clean, and connect the evidence. Start with a software-evidence scoping workshop:
            ESL reviews your intended submission context, software stack, available artifacts, existing tests,
            and ALM environment — then defines the smallest complete work package needed.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="mailto:sales@eswlab.com?subject=FDA Software Evidence Scoping Workshop"
              className="inline-block px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Request a Scoping Workshop &rarr;
            </a>
            <a href="https://eswlab.com/contact-us/?your-subject=FDA%20Software%20Evidence%20Services%20-%20General%20Enquiry"
              className="inline-block px-8 py-3 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/10 transition-colors">
              Talk to an Engineer
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Email:</span> <a href="mailto:sales@eswlab.com" className="text-blue-600 hover:underline">sales@eswlab.com</a></div>
              <div><span className="text-gray-500">Web:</span> <a href="https://www.eswlab.com" className="text-blue-600 hover:underline">www.eswlab.com</a></div>
              <div><span className="text-gray-500">Phone:</span> +972 9 8855803</div>
              <div><span className="text-gray-500">Office:</span> Ha-Nagar 24 A, Hod Hasharon, Israel</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-amber-800">
            This platform describes engineering services, not legal or regulatory advice. FDA guidance
            documents generally contain nonbinding recommendations unless specific statutory or regulatory
            requirements are cited. Applicable evidence depends on the device, software functions, risk,
            submission type, and current FDA expectations. ESL does not guarantee FDA clearance, approval,
            or inspection outcomes. The manufacturer retains responsibility for safety, effectiveness,
            quality-system compliance, risk decisions, validation, and submissions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
