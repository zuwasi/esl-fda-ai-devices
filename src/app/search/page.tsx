'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'embedding' | 'keyword'>('embedding');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterData, setFilterData] = useState({ panels: [] as string[], companies: [] as string[], dataTypes: [] as string[], aiFunctions: [] as string[] });
  const [filters, setFilters] = useState({
    panel: 'all', company: 'all', pathway: 'all', dataType: 'all', productCode: '',
    aiFunction: 'all', deviceClass: 'all', cyberDevice: 'all', yearFrom: '', yearTo: ''
  });

  useEffect(() => {
    fetch('/api/search').then(r => r.json()).then(d => {
      setFilterData({ panels: d.panels || [], companies: d.companies || [], dataTypes: d.dataTypes || [], aiFunctions: d.aiFunctions || [] });
    }).catch(() => {});
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (mode === 'embedding' && !query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const body: any = { query: query.trim(), mode, filters };
      if (mode === 'keyword') { body.page = page; body.limit = 20; }
      else { body.topK = 100; }
      const res = await fetch('/api/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (mode === 'keyword' && !Array.isArray(data)) {
        setResults(data.results || []);
        setTotalPages(data.totalPages || 0);
        setTotalRecords(data.totalRecords || 0);
      } else {
        setResults(Array.isArray(data) ? data : []);
        setTotalRecords(Array.isArray(data) ? data.length : 0);
      }
    } catch { setResults([]); }
    setLoading(false);
  }

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  // Re-search when filters change (for keyword mode)
  useEffect(() => {
    if (searched && mode === 'keyword') handleSearch();
  }, [filters, mode, page]);

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Search FDA-Authorized AI Devices</h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="e.g., 'diabetic retinopathy', 'lung cancer CT', 'breast density'..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" disabled={loading}
              className="px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0b4c8a, #1a6cb0)' }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="smode" checked={mode === 'embedding'} onChange={() => { setMode('embedding'); setPage(1); }} className="accent-blue-600" />
              AI Semantic Search
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="smode" checked={mode === 'keyword'} onChange={() => { setMode('keyword'); setPage(1); }} className="accent-blue-600" />
              Keyword Search
            </label>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Filters</h3>
              <FilterSelect label="Clinical Panel" value={filters.panel} options={filterData.panels} onChange={v => handleFilterChange('panel', v)} />
              <FilterSelect label="Company" value={filters.company} options={filterData.companies} onChange={v => handleFilterChange('company', v)} />
              <FilterSelect label="Regulatory Pathway" value={filters.pathway} options={['510(k)', 'De Novo', 'PMA']} onChange={v => handleFilterChange('pathway', v)} />
              <FilterSelect label="Data Type" value={filters.dataType} options={filterData.dataTypes} onChange={v => handleFilterChange('dataType', v)} />
              <div>
                <label className="text-xs font-medium text-gray-600">FDA Product Code</label>
                <input type="text" maxLength={3} placeholder="e.g., QIH" value={filters.productCode}
                  onChange={e => handleFilterChange('productCode', e.target.value.toUpperCase())}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded uppercase" />
              </div>
              <FilterSelect label="AI Function" value={filters.aiFunction} options={filterData.aiFunctions} onChange={v => handleFilterChange('aiFunction', v)} />
              <FilterSelect label="Estimated FDA Device Class" value={filters.deviceClass} options={['I', 'II', 'III']} onChange={v => handleFilterChange('deviceClass', v)} />
              <FilterSelect label="Estimated §524B Applicability" value={filters.cyberDevice} options={['Likely applicable', 'Not identified']} onChange={v => handleFilterChange('cyberDevice', v)} />
              <div>
                <label className="text-xs font-medium text-gray-600">Year Range</label>
                <div className="flex gap-2 mt-1">
                  <input type="text" placeholder="From" value={filters.yearFrom} onChange={e => handleFilterChange('yearFrom', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                  <input type="text" placeholder="To" value={filters.yearTo} onChange={e => handleFilterChange('yearTo', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Device class and §524B applicability are ESL estimates.</p>
              <button onClick={() => { setFilters({ panel: 'all', company: 'all', pathway: 'all', dataType: 'all', productCode: '', aiFunction: 'all', deviceClass: 'all', cyberDevice: 'all', yearFrom: '', yearTo: '' }); setPage(1); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">Clear filters</button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {searched && (
              <div className="mb-4 text-sm text-gray-600">
                {loading ? 'Searching...' : totalRecords + ' devices found'}
              </div>
            )}
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : results.length === 0 ? (
              searched ? <div className="text-center py-12 text-gray-500"><p className="text-lg">No devices found.</p></div> :
              <div className="text-center py-12 text-gray-400"><p>Enter a search query to begin.</p></div>
            ) : (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <a key={i} href={'/device/' + r.submissionNumber} className="block bg-white rounded-xl border border-gray-200 p-5 card-hover">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{r.deviceName}</h3>
                          <RiskBadge cls={r.riskClass} />
                          {r.cyberDeviceStatus && r.cyberDeviceStatus.includes('524B') && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">§524B Cyber Device</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{r.applicant} • {r.panel} • {r.regulatoryPathway} • {r.decisionDate}</p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{r.thesis}</p>
                      </div>
                      {r.similarity > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-blue-600">{(r.similarity * 100).toFixed(0)}%</div>
                          <div className="text-xs text-gray-400">match</div>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
            {/* Pagination for keyword mode */}
            {mode === 'keyword' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => { setPage(p => Math.max(1, p - 1)); }} disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border rounded disabled:opacity-50">Prev</button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); }} disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white">
        <option value="all">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function RiskBadge({ cls }: { cls: string }) {
  const colors: Record<string, string> = { A: '#16a34a', B: '#eab308', C: '#dc2626' };
  const bgs: Record<string, string> = { A: '#dcfce7', B: '#fef9c3', C: '#fee2e2' };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: bgs[cls] || '#e5e7eb', color: colors[cls] || '#6b7280' }}>
      IEC 62304 Class {cls}
    </span>
  );
}
