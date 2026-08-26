'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'embedding' | 'keyword'>('embedding');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filterData, setFilterData] = useState<{panels:string[], companies:string[], dataTypes:string[]}>({panels:[],companies:[],dataTypes:[]});

  useEffect(() => {
    fetch('/api/search').then(r => r.json()).then(d => {
      setTotalCount(d.totalDevices || 0);
      setFilterData({ panels: d.panels || [], companies: d.companies || [], dataTypes: d.dataTypes || [] });
    }).catch(() => {});
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), mode, topK: 50, page: 1, limit: 50 }),
      });
      const data = await res.json();
      if (mode === 'keyword' && !Array.isArray(data)) {
        setResults(data.results || []);
        setTotalCount(data.totalRecords || 0);
      } else {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        {!searched && (
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {totalCount.toLocaleString()} FDA-Authorized AI Devices Indexed
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Search. Assess. Prepare. Submit.
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 mb-8">
                  Semantic search across all FDA-authorized AI medical devices. Cybersecurity evidence analysis,
                  IEC 62304 risk classification, and submission readiness assessment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${!searched ? '-mt-8 sm:-mt-12' : 'mt-6'}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search for AI devices by clinical need, e.g., 'diabetic retinopathy', 'breast cancer CT', 'cardiac arrhythmia'..."
                  className="flex-1 px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-8 py-4 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Searching...
                    </>
                  ) : 'Search Devices'}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="radio" name="mode" value="embedding" checked={mode === 'embedding'} onChange={() => setMode('embedding')} className="accent-blue-600" />
                  AI Semantic Search
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="radio" name="mode" value="keyword" checked={mode === 'keyword'} onChange={() => setMode('keyword')} className="accent-blue-600" />
                  Keyword Search
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Searching...' : results.length + ' results'}
              </h2>
              <a href="/search" className="text-sm text-blue-600 hover:underline">Full search with filters →</a>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No devices found. Try a different query or switch to AI Semantic Search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 10).map((r, i) => (
                  <a key={i} href={'/device/' + r.submissionNumber} className="block bg-white rounded-xl border border-gray-200 p-5 card-hover">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{r.deviceName}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                            background: r.riskClass === 'C' ? '#fee2e2' : r.riskClass === 'B' ? '#fef9c3' : '#dcfce7',
                            color: r.riskClass === 'C' ? '#dc2626' : r.riskClass === 'B' ? '#ca8a04' : '#16a34a'
                          }}>IEC 62304 Class {r.riskClass}</span>
                        </div>
                        <p className="text-sm text-gray-600">{r.applicant} • {r.panel} • {r.regulatoryPathway} • {r.decisionDate}</p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{r.thesis}</p>
                      </div>
                      {r.similarity > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-blue-600">{(r.similarity * 100).toFixed(0)}%</div>
                          <div className="text-xs text-gray-400">match</div>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature cards (when no search) */}
        {!searched && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Beyond Search: Regulatory Intelligence</h2>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Every device includes cybersecurity evidence analysis, IEC 62304 risk classification, and submission readiness assessment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon="🔒"
                title="Cybersecurity Evidence"
                desc="SBOM presence, §524B compliance, and CVE management indicators for every device."
                tag="Powered by SBOMator™"
              />
              <FeatureCard
                icon="📚"
                title="Evidence Requirements"
                desc="IEC 62304 evidence requirements mapped by device risk class and regulatory pathway."
                tag="Parasoft expertise"
              />
              <FeatureCard
                icon="⚠️"
                title="Risk Classification"
                desc="Automatic IEC 62304 Class A/B/C and FDA device class estimation for each AI device."
                tag="IEC 62304 expert"
              />
              <FeatureCard
                icon="✅"
                title="Submission Readiness"
                desc="Interactive wizard identifies evidence gaps and connects you to ESL's scoping workshop."
                tag="Start assessment →"
                href="/assessment"
              />
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="FDA AI Devices" value={totalCount.toLocaleString()} />
              <StatCard label="Regulatory Pathways" value="3 (510k, De Novo, PMA)" />
              <StatCard label="Clinical Panels" value={filterData.panels.length + ''} />
              <StatCard label="Data Types" value={filterData.dataTypes.length + ''} />
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-center text-gray-400">
            Search engine based on{' '}
            <a href="https://arxiv.org/html/2602.00006v1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 underline">FDA AI Search</a>{' '}
            by Kavishwar &amp; Lotter (Dana-Farber / Harvard, ML4H 2025, CC BY 4.0).{' '}
            Regulatory-engineering layers by{' '}
            <a href="/about" className="text-gray-500 hover:text-blue-600 underline">Engineering Software Lab</a>.{' '}
            <a href="/about#attribution" className="text-gray-500 hover:text-blue-600 underline">Learn what we added &rarr;</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc, tag, href }: { icon: string; title: string; desc: string; tag: string; href?: string }) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover h-full">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{desc}</p>
      <span className="text-xs font-medium text-blue-600">{tag}</span>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
