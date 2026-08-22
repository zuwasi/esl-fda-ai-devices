'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AssessmentState {
  deviceType: string;
  pathway: string;
  softwareClass: string;
  hasSBOM: boolean;
  hasStaticAnalysis: boolean;
  hasUnitTests: boolean;
  hasCoverage: boolean;
  hasTraceability: boolean;
  hasCyberAssessment: boolean;
}

export default function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [state, setState] = useState<AssessmentState>({
    deviceType: '', pathway: '', softwareClass: 'B',
    hasSBOM: false, hasStaticAnalysis: false, hasUnitTests: false,
    hasCoverage: false, hasTraceability: false, hasCyberAssessment: false,
  });

  function toggle(key: keyof AssessmentState) {
    setState(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function next() { setStep(s => Math.min(4, s + 1)); }
  function prev() { setStep(s => Math.max(1, s - 1)); }

  const evidenceItems = [
    { key: 'hasSBOM' as const, label: 'SBOM (Software Bill of Materials)', standard: '§524B requirement', esl: 'SBOMator™ FDA Edition' },
    { key: 'hasStaticAnalysis' as const, label: 'Static Code Analysis', standard: 'MISRA C/C++, CERT C/C++', esl: 'Parasoft C/C++test' },
    { key: 'hasUnitTests' as const, label: 'Unit Testing Evidence', standard: 'IEC 62304 §5.5', esl: 'ESL engineer-authored tests' },
    { key: 'hasCoverage' as const, label: 'Structural Coverage', standard: 'Statement/branch/MC/DC', esl: 'Risk-based coverage analysis' },
    { key: 'hasTraceability' as const, label: 'Traceability Matrix', standard: 'Requirements → Risk → Tests', esl: 'Polarion ALM integration' },
    { key: 'hasCyberAssessment' as const, label: 'Cybersecurity Risk Assessment', standard: 'FDA 2026 guidance', esl: 'SBOMator™ + VEX' },
  ];

  const completed = evidenceItems.filter(e => state[e.key]).length;
  const gapCount = evidenceItems.length - completed;
  const readinessScore = Math.round((completed / evidenceItems.length) * 100);

  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Submission Readiness Assessment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Identify gaps in your FDA software evidence package. Get a tailored action plan
            mapped to IEC 62304, §524B, and FDA cybersecurity guidance.
          </p>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1,2,3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: step >= s ? '#0b4c8a' : '#e5e7eb', color: step >= s ? 'white' : '#6b7280' }}>
                    {s}
                  </div>
                  {s < 3 && <div className="w-12 h-0.5" style={{ background: step > s ? '#0b4c8a' : '#e5e7eb' }} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4 fade-in">
                <h2 className="text-xl font-semibold mb-4">Device Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type / Clinical Area</label>
                  <input type="text" value={state.deviceType} onChange={e => setState({...state, deviceType: e.target.value})}
                    placeholder="e.g., AI-based diabetic retinopathy detection, cardiac imaging AI..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Regulatory Pathway</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['510(k)', 'De Novo', 'PMA'].map(p => (
                      <button key={p} onClick={() => setState({...state, pathway: p})}
                        className="px-4 py-3 border rounded-lg text-sm font-medium transition"
                        style={{ borderColor: state.pathway === p ? '#0b4c8a' : '#d1d5db', background: state.pathway === p ? '#eff6ff' : 'white', color: state.pathway === p ? '#0b4c8a' : '#374151' }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IEC 62304 Software Safety Class</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { cls: 'A', desc: 'Low Risk', color: '#16a34a' },
                      { cls: 'B', desc: 'Moderate', color: '#eab308' },
                      { cls: 'C', desc: 'High Risk', color: '#dc2626' },
                    ].map(c => (
                      <button key={c.cls} onClick={() => setState({...state, softwareClass: c.cls})}
                        className="px-4 py-3 border rounded-lg text-sm font-medium transition text-center"
                        style={{ borderColor: state.softwareClass === c.cls ? '#0b4c8a' : '#d1d5db', background: state.softwareClass === c.cls ? '#eff6ff' : 'white' }}>
                        <div className="font-bold" style={{ color: c.color }}>Class {c.cls}</div>
                        <div className="text-xs text-gray-500">{c.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={next} disabled={!state.pathway} className="px-6 py-2.5 text-white font-semibold rounded-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>Next →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 fade-in">
                <h2 className="text-xl font-semibold mb-4">Current Evidence Status</h2>
                <p className="text-sm text-gray-500">Check all that apply to your current software evidence package:</p>
                <div className="space-y-3">
                  {evidenceItems.map(item => (
                    <button key={item.key} onClick={() => toggle(item.key)}
                      className="w-full flex items-center justify-between p-4 border rounded-lg text-left transition"
                      style={{ borderColor: state[item.key] ? '#16a34a' : '#d1d5db', background: state[item.key] ? '#f0fdf4' : 'white' }}>
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.standard} • ESL capability: {item.esl}</div>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: state[item.key] ? '#16a34a' : '#e5e7eb' }}>
                        {state[item.key] && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={prev} className="px-6 py-2.5 border rounded-lg font-medium">Back</button>
                  <button onClick={() => setShowResults(true)} className="px-6 py-2.5 text-white font-semibold rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>View Assessment →</button>
                </div>
              </div>
            )}

            {step === 3 && !showResults && (
              <div className="space-y-4 fade-in">
                <h2 className="text-xl font-semibold mb-4">Review &amp; Generate</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div><span className="text-gray-500">Device:</span> {state.deviceType || 'Not specified'}</div>
                  <div><span className="text-gray-500">Pathway:</span> {state.pathway}</div>
                  <div><span className="text-gray-500">Software Class:</span> IEC 62304 Class {state.softwareClass}</div>
                  <div><span className="text-gray-500">Evidence items completed:</span> {completed} of {evidenceItems.length}</div>
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={prev} className="px-6 py-2.5 border rounded-lg font-medium">Back</button>
                  <button onClick={() => setShowResults(true)} className="px-6 py-2.5 text-white font-semibold rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>Generate Report →</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="space-y-6 fade-in">
            {/* Score card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle cx="64" cy="64" r="56" fill="none" strokeWidth="12" strokeLinecap="round"
                      stroke={readinessScore >= 80 ? '#16a34a' : readinessScore >= 50 ? '#eab308' : readinessScore >= 25 ? '#f97316' : '#dc2626'}
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - readinessScore / 100)} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">{readinessScore}%</span>
                    <span className="text-xs text-gray-500">Ready</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {readinessScore >= 80 ? 'Strong Evidence Package' : readinessScore >= 50 ? 'Partial Evidence — Gaps Identified' : readinessScore >= 25 ? 'Significant Gaps — Action Needed' : 'Major Evidence Gaps — Start from Scratch'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {gapCount} of {evidenceItems.length} evidence areas need attention.
                    Based on IEC 62304 Class {state.softwareClass} via {state.pathway} pathway.
                  </p>
                </div>
              </div>
            </div>

            {/* Gap analysis */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Evidence Gap Analysis</h3>
              <div className="space-y-3">
                {evidenceItems.map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg" style={{ background: state[item.key] ? '#f0fdf4' : '#fef2f2' }}>
                    <div className="flex items-center gap-3">
                      {state[item.key] ?
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><span className="text-green-600">✓</span></div> :
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><span className="text-red-600">✗</span></div>
                      }
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.standard}</div>
                      </div>
                    </div>
                    {!state[item.key] && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">ESL can close this gap: {item.esl}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action plan */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-3">Your Recommended Next Step</h3>
              <p className="text-blue-100 mb-6">
                ESL offers a <strong>Software Evidence Scoping Workshop</strong> to assess your software stack,
                artifacts, and tests — then define the minimum complete evidence package required for your
                {state.pathway} submission.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Find it</h4>
                  <p className="text-sm text-blue-100">ESL scans source, builds, dependencies, containers, firmware and binaries.</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Understand it</h4>
                  <p className="text-sm text-blue-100">Triage findings, confirm applicability, classify impact and prioritize against product risk.</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Fix it</h4>
                  <p className="text-sm text-blue-100">ESL engineers fix code defects, upgrade or replace vulnerable components.</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Prove it</h4>
                  <p className="text-sm text-blue-100">Rebuild, rescan, retest and assemble audit-ready evidence with full traceability.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="mailto:sales@eswlab.com?subject=FDA Software Evidence Scoping Workshop"
                  className="flex-1 text-center py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50">
                  Schedule Scoping Workshop →
                </a>
                <button onClick={() => { setShowResults(false); setStep(1); }}
                  className="flex-1 text-center py-3 border border-white/30 rounded-lg hover:bg-white/10">
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
