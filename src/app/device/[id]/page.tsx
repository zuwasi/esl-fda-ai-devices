'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { CyberEvidence, RiskClassification, EvidenceRequirement, DeviceRecord } from '@/lib/types';

export default function DeviceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    record: DeviceRecord; cyber: CyberEvidence; risk: RiskClassification;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/search?id=' + encodeURIComponent(id))
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

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
            {r.summary_pdf_link && (
              <a href={r.summary_pdf_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                FDA Summary PDF
              </a>
            )}
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
                  <span className="text-sm font-medium">IEC 62304 Class</span>
                  <span className="text-lg font-bold">{risk.iec62304Class}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">FDA Device Class</span>
                  <span className="text-lg font-bold text-blue-700">{risk.fdaClass}</span>
                </div>
                <p className="text-xs text-gray-500">{risk.rationale}</p>
              </div>
            </Section>

            {/* Cybersecurity Evidence */}
            <Section title="Cybersecurity Evidence" badge="Powered by SBOMator™">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Cyber Score</span>
                  <span className="text-lg font-bold" style={{ color: cyber.cyberScore >= 80 ? '#16a34a' : cyber.cyberScore >= 50 ? '#eab308' : cyber.cyberScore >= 25 ? '#f97316' : '#dc2626' }}>
                    {cyber.cyberScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: cyber.cyberScore + '%', background: cyber.cyberScore >= 80 ? '#16a34a' : cyber.cyberScore >= 50 ? '#eab308' : cyber.cyberScore >= 25 ? '#f97316' : '#dc2626' }} />
                </div>
                <CyberRow label="SBOM Evidence" found={cyber.hasSBOM} />
                <CyberRow label="Cyber Risk Assessment" found={cyber.hasCyberRiskAssessment} />
                <CyberRow label="Postmarket Plan" found={cyber.hasPostmarketPlan} />
                <CyberRow label="§524B Applicable" found={cyber.section524BApplicable} neutral={true} />
                {cyber.findings.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">Analysis:</p>
                    {cyber.findings.map((f, i) => <p key={i} className="text-xs text-gray-600 mb-1">• {f}</p>)}
                  </div>
                )}
              </div>
            </Section>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Preparing a similar submission?</h3>
              <p className="text-sm text-blue-100 mb-4">
                ESL takes complete ownership of your software evidence work.
                SBOM &amp; CVE remediation. Static analysis. Unit testing. Traceability.
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

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {badge && <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{badge}</span>}
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

function CyberRow({ label, found, neutral }: { label: string; found: boolean; neutral?: boolean }) {
  if (neutral) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={found ? 'text-orange-600 font-medium' : 'text-gray-400'}>{found ? 'Yes' : 'No'}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      {found ? <span className="text-green-600 font-medium">✓ Detected</span> : <span className="text-red-500 font-medium">✗ Not Evidenced</span>}
    </div>
  );
}
