'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegulatoryConcerns from '@/components/RegulatoryConcerns';
import type { CyberEvidence, RiskClassification, EvidenceRequirement, DeviceRecord } from '@/lib/types';

export default function DeviceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    record: DeviceRecord; cyber: CyberEvidence; risk: RiskClassification;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfAnalyzing, setPdfAnalyzing] = useState(false);
  const [pdfResult, setPdfResult] = useState<{
    cyber: CyberEvidence; pdfTextLength: number; snippets: string[]; warning?: string;
  } | null>(null);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    fetch('/api/search?id=' + encodeURIComponent(id))
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!data?.record) return;
    const r = data.record;
    const pathway = r.submission_number?.toUpperCase().startsWith('K') ? '510(k)'
      : r.submission_number?.toUpperCase().startsWith('DEN') ? 'De Novo'
      : r.submission_number?.toUpperCase().startsWith('P') ? 'PMA' : '';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'MedicalDevice',
      name: r.device_model || 'Unnamed Device',
      manufacturer: { '@type': 'Organization', name: r.company },
      identifier: r.submission_number,
      regulatoryID: r.submission_number,
      category: r.ai_function || '',
      applicationCategory: 'Medical Device',
      deviceCategory: pathway,
      dateApproved: r.date_of_final_decision,
      description: r.thesis || '',
      url: 'https://esl-fda.io/device/' + r.submission_number,
    };
    const existing = document.getElementById('device-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'device-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { const el = document.getElementById('device-jsonld'); if (el) el.remove(); };
  }, [data]);

  async function analyzePdf() {
    if (!data?.record?.summary_pdf_link?.startsWith('http')) return;
    setPdfAnalyzing(true);
    setPdfError('');
    setPdfResult(null);
    try {
      const res = await fetch('/api/pdf-analysis?id=' + encodeURIComponent(id));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Analysis failed');
      }
      const d = await res.json();
      setPdfResult({
        cyber: d.cyber,
        pdfTextLength: d.pdfTextLength || 0,
        snippets: d.snippets || [],
        warning: d.warning,
      });
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setPdfAnalyzing(false);
    }
  }

  if (loading) return (
    <div><Header /><main className="max-w-4xl mx-auto py-20 px-4">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </main><Footer /></div>
  );

  if (error || !data) return (
    <div><Header /><main className="max-w-4xl mx-auto py-20 px-4 text-center">
      <p className="text-lg text-gray-500">Device not found.</p>
      <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to search</a>
    </main><Footer /></div>
  );

  const { record: r, cyber, risk } = data;

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:underline">Home</a> {' / '}
          <a href="/search" className="hover:underline">Search</a> {' / '}
          <span className="text-gray-700">{r.submission_number}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{r.device_model || 'Unnamed Device'}</h1>
              <p className="text-gray-600">{r.company} • {r.panel_lead || r.lead_panel} • {r.date_of_final_decision}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{getRegulatoryPathway(r.submission_number)}</span>
                <span className="text-sm px-3 py-1 rounded-full font-medium" style={{
                  background: risk.iec62304Class === 'C' ? '#fee2e2' : risk.iec62304Class === 'B' ? '#fef9c3' : '#dcfce7',
                  color: risk.iec62304Class === 'C' ? '#dc2626' : risk.iec62304Class === 'B' ? '#ca8a04' : '#16a34a'
                }}>IEC 62304 Class {risk.iec62304Class}</span>
                {risk.cyberDevice && <span className="text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-medium">§524B Cyber Device</span>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {r.summary_pdf_link && (
                <a href={r.summary_pdf_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  FDA Summary PDF
                </a>
              )}
              <RegulatoryConcerns company={r.company} deviceName={r.device_model || 'Unnamed Device'} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Device info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thesis */}
            <Section title="Device Purpose">
              <p className="text-gray-700 leading-relaxed">{r.thesis || 'No thesis available.'}</p>
            </Section>

            {/* Summary */}
            {r.summary && r.summary !== 'Error' && (
              <Section title="Summary">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{r.summary}</p>
              </Section>
            )}

            {/* Keywords */}
            {r.summary_keywords && (
              <Section title="Keywords">
                <div className="flex flex-wrap gap-2">
                  {r.summary_keywords.split(',').map((k, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{k.trim()}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Metadata grid */}
            <Section title="Device Metadata">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <MetaItem label="Submission Number" value={r.submission_number} />
                <MetaItem label="Company" value={r.company} />
                <MetaItem label="Panel" value={r.panel_lead || r.lead_panel} />
                <MetaItem label="Product Code" value={r.primary_product_code || 'N/A'} />
                <MetaItem label="Data Type" value={r.data_type} />
                <MetaItem label="Clinical Function" value={r.clinical_function} />
                <MetaItem label="AI Function" value={r.ai_function} />
                <MetaItem label="AI Subclass" value={r.ai_function_subclass} />
              </div>
            </Section>

            {/* Generated questions */}
            {r.generated_questions && (
              <Section title="Relevant Clinical Questions">
                <ul className="space-y-2">
                  {r.generated_questions.split('|').map((q, i) => q.trim() && <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-blue-500">Q{i+1}.</span> {q.trim()}</li>)}
                </ul>
              </Section>
            )}
          </div>

          {/* Right column: ESL Intelligence */}
          <div className="space-y-6">
            {/* Risk Classification */}
            <Section title="Risk Classification" badge="ESL Analysis">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: risk.iec62304Class === 'C' ? '#fee2e2' : risk.iec62304Class === 'B' ? '#fef9c3' : '#dcfce7' }}>
                  <a href="https://www.parasoft.com/blog/what-is-iec-62304-how-is-it-used-in-medical-device-compliance/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">IEC 62304 Class</a>
                  <span className="text-lg font-bold">{risk.iec62304Class}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">FDA Device Class</span>
                  <span className="text-lg font-bold text-blue-700">{risk.fdaClass}</span>
                </div>
                <p className="text-xs text-gray-500">{risk.rationale}</p>
                <a href="https://www.parasoft.com/blog/what-is-iec-62304-how-is-it-used-in-medical-device-compliance/" target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 hover:underline mt-1">
                  Learn how Parasoft automates IEC 62304 compliance testing →
                </a>
              </div>
            </Section>

            {/* Cybersecurity Evidence */}
            <Section title="Cybersecurity Evidence" badge={<a href="https://eswlab.com/products/esl-ailogiclabs/sbomator/" target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium hover:bg-blue-100">Powered by SBOMator™</a>}>
              {!pdfResult && (
                <p className="text-xs text-gray-400 mb-3">Based on AI-generated device summaries, not the full FDA submission. Items not detected here may still be present in the complete submission package.</p>
              )}
              <div className="space-y-3">
                {/* Show PDF analysis results if available, otherwise show summary-based results */}
                {(() => {
                  const activeCyber = pdfResult ? pdfResult.cyber : cyber;
                  return (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Cyber Score</span>
                        <span className="text-lg font-bold" style={{ color: activeCyber.cyberScore >= 80 ? '#16a34a' : activeCyber.cyberScore >= 50 ? '#eab308' : activeCyber.cyberScore >= 25 ? '#f97316' : '#6b7280' }}>
                          {activeCyber.cyberScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: activeCyber.cyberScore + '%', background: activeCyber.cyberScore >= 80 ? '#16a34a' : activeCyber.cyberScore >= 50 ? '#eab308' : activeCyber.cyberScore >= 25 ? '#f97316' : '#6b7280' }} />
                      </div>
                      {pdfResult && (
                        <div className="text-xs font-medium text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                          ✓ Analyzed {pdfResult.pdfTextLength.toLocaleString()} characters from the full FDA Summary PDF
                        </div>
                      )}
                      <CyberRow label="SBOM Evidence" found={activeCyber.hasSBOM} section524B={activeCyber.section524BApplicable} pdfMode={!!pdfResult} />
                      <CyberRow label="Cyber Risk Assessment" found={activeCyber.hasCyberRiskAssessment} section524B={activeCyber.section524BApplicable} pdfMode={!!pdfResult} />
                      <CyberRow label="Postmarket Plan" found={activeCyber.hasPostmarketPlan} section524B={activeCyber.section524BApplicable} pdfMode={!!pdfResult} />
                      <CyberRow label="§524B Applicable" found={activeCyber.section524BApplicable} neutral={true} />
                      {/* xBOM Supply Chain Evidence (CycloneDX / OWASP ECMA-424) */}
                      {activeCyber.xbom && activeCyber.xbom.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Supply Chain BOM Evidence</p>
                          <p className="text-xs text-gray-400 mb-3">Based on the CycloneDX / OWASP ECMA-424 xBOM ecosystem. Detection is from the {pdfResult ? 'full FDA PDF' : 'AI-generated summary'}.</p>
                          <div className="space-y-2">
                            {activeCyber.xbom.map((x, i) => (
                              <div key={i} className="flex items-start justify-between gap-2 text-xs">
                                <div className="flex-1">
                                  <span className={'font-medium ' + (x.detected ? 'text-gray-700' : 'text-gray-400')}>{x.type}</span>
                                  <span className="text-gray-400 ml-1">{x.fullName}</span>
                                  {x.detected && x.indicators.length > 0 && (
                                    <span className="text-gray-400 ml-1">({x.indicators.join(', ')})</span>
                                  )}
                                </div>
                                <span className={x.detected ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                  {x.detected ? '✓ Detected' : '— Not detected'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeCyber.findings.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 mb-2">Analysis:</p>
                          {activeCyber.findings.map((f, i) => <p key={i} className="text-xs text-gray-600 mb-1">• {f}</p>)}
                        </div>
                      )}
                    </>
                  );
                })()}
                {/* PDF evidence snippets */}
                {pdfResult && pdfResult.snippets.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">Evidence snippets from FDA PDF:</p>
                    {pdfResult.snippets.map((s, i) => <p key={i} className="text-xs text-gray-500 mb-2 italic">{s}</p>)}
                  </div>
                )}
                {pdfResult && pdfResult.warning && (
                  <p className="text-xs text-amber-600">{pdfResult.warning}</p>
                )}
                {/* Analyze Full FDA PDF button */}
                {r.summary_pdf_link && r.summary_pdf_link.startsWith('http') && !pdfResult && (
                  <button
                    onClick={analyzePdf}
                    disabled={pdfAnalyzing}
                    className="w-full py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {pdfAnalyzing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Fetching & analyzing FDA PDF...
                      </>
                    ) : (
                      <>📄 Analyze Full FDA PDF</>
                    )}
                  </button>
                )}
                {pdfError && (
                  <p className="text-xs text-red-500">PDF analysis failed: {pdfError}</p>
                )}
                {pdfResult && (
                  <button
                    onClick={() => setPdfResult(null)}
                    className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Back to summary-based analysis
                  </button>
                )}
              </div>
            </Section>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Preparing a similar submission?</h3>
              <p className="text-sm text-blue-100 mb-4">
                ESL takes complete ownership of your software evidence work —
                SBOM &amp; CVE remediation with <a href="https://eswlab.com/products/esl-ailogiclabs/sbomator/" target="_blank" rel="noopener noreferrer" className="text-white font-medium underline hover:text-blue-200">SBOMator™</a>,
                static analysis &amp; unit testing with <a href="https://www.parasoft.com/blog/what-is-iec-62304-how-is-it-used-in-medical-device-compliance/" target="_blank" rel="noopener noreferrer" className="text-white font-medium underline hover:text-blue-200">Parasoft</a>,
                traceability, and full IEC 62304 lifecycle support.
              </p>
              <a href="/assessment" className="block w-full text-center py-2.5 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50">
                Assess Your Readiness →
              </a>
              <a href="mailto:sales@eswlab.com" className="block w-full text-center py-2 mt-2 text-blue-100 text-sm hover:underline">
                Or contact ESL directly
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function getRegulatoryPathway(sub: string): string {
  if (!sub) return 'Unknown';
  if (sub.toUpperCase().startsWith('K')) return '510(k)';
  if (sub.toUpperCase().startsWith('DEN')) return 'De Novo';
  if (sub.toUpperCase().startsWith('P')) return 'PMA';
  return 'Unknown';
}

function Section({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {badge && (typeof badge === 'string'
          ? <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{badge}</span>
          : badge)}
      </div>
      {children}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</dd>
    </div>
  );
}

function CyberRow({ label, found, neutral, section524B, pdfMode }: { label: string; found: boolean; neutral?: boolean; section524B?: boolean; pdfMode?: boolean }) {
  if (neutral) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={found ? 'text-orange-600 font-medium' : 'text-gray-400'}>{found ? 'Yes' : 'No'}</span>
      </div>
    );
  }
  if (found) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="text-green-600 font-medium">{pdfMode ? '✓ Found in FDA PDF' : '✓ Detected in Summary'}</span>
      </div>
    );
  }
  // Not found
  const hint = pdfMode
    ? (section524B ? 'Not found in full FDA PDF' : 'Not mentioned in FDA PDF')
    : (section524B ? 'Not in summary — likely in full submission per §524B' : 'Not mentioned in summary');
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">{label}</span>
        <span className={'font-medium ' + (pdfMode ? 'text-red-500' : 'text-gray-500')}>{pdfMode ? '✗ ' : '⚠ '}{hint}</span>
      </div>
    </div>
  );
}
