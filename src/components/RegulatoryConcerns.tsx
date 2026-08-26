'use client';
import { useState } from 'react';

interface RegulatoryData {
  company: string;
  recalls: {
    total: number;
    results: Array<{
      product: string; reason: string; rootCause: string; status: string; date: string; firm: string; eventNumber: string;
    }>;
  };
  adverseEvents: {
    total: number;
    results: Array<{
      eventType: string; reportNumber: string; dateReceived: string; deviceName: string; deviceGeneric: string; problems: string; patientImpact: string; description: string;
    }>;
  };
  warningLetters: {
    searchUrl: string; note: string;
  };
}

export default function RegulatoryConcerns({ company, deviceName }: { company: string; deviceName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegulatoryData | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'recalls' | 'events' | 'warnings'>('recalls');

  async function handleClick() {
    setOpen(true);
    if (data) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/regulatory-concerns?company=' + encodeURIComponent(company));
      if (!res.ok) throw new Error('Failed to fetch');
      const d = await res.json();
      setData(d);
      if (d.recalls?.total > 0) setTab('recalls');
      else if (d.adverseEvents?.total > 0) setTab('events');
      else setTab('warnings');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load regulatory concerns.');
    } finally {
      setLoading(false);
    }
  }

  const totalConcerns = (data?.recalls?.total || 0) + (data?.adverseEvents?.total || 0);
  const openFDaRecallUrl = 'https://api.fda.gov/device/recall.json?search=recalling_firm:' + encodeURIComponent(JSON.stringify(company)) + '&limit=100';
  const openFDAEventUrl = 'https://api.fda.gov/device/event.json?search=device.manufacturer_d_name:' + encodeURIComponent(JSON.stringify(company)) + '&limit=100';
  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-60 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        <svg className="w.h4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        Regulatory Concerns
        {data && totalConcerns > 0 && (
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-bold">{totalConcerns > 999 ? '999+' : totalConcerns}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-red-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Regulatory Concerns
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">{company} - {deviceName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-red-200 border-t-red-600 rounded-full mb-3" />
                  <p className="text-sm text-gray-500">Searching FDA Databases for {company}...</p>
                </div>
              )}
              {error && (
                <div className="p-8 text-center text-red-600 text-sm">{error}</div>
              )}
              {data && !loading && (
                <>
                  <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-sm">
                    <span className="font-medium text-gray-700">
                      {totalConcerns > 0 ? (
                        <span className="text-red-600">{totalConcerns.toLocaleString()} regulatory concern {totalConcerns > 1 ? 's' : ''}</span>
                      ) : (
                       <span className="text-green-600">No recalls or adverse events found in FDA databases</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">Source: openFDA API</span>
                  </div>
                  <div className="flex border-b border-gray-200 px-5">
                    <TabButton active={tab === 'recalls'} onClick={() => setTab('recalls')} label="Device Recalls" count={data.recalls.total} />
                    <TabButton active={tab === 'events'} onClick={() => setTab('events')} label="Adverse Events (MAUDE)" count={data.adverseEvents.total} />
                    <TabButton active={tab === 'warnings'} onClick={() => setTab('warnings')} label="Warning Letters" count={null} />
                  </div>
                  <div className="p-5">
                    {tab === 'recalls' && (
                      <div className="space-y-3">
                        {data.recalls.results.length === 0 ? (
                          <EmptyState message="No device recalls found for this company in FDA records." />
                        ) : (
                          data.recalls.results.map((r, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (r.status.includes('Open') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>{r.status}</span>
                               <span className="text-xs text-gray-400">{r.date}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">{r.product}</p>
                              <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Reason:</span> {r.reason}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Root cause: {r.rootCause}</span>
                                <span>Event #: {r.eventNumber}</span>
                              </div>
                           </div>
                          ))
                      )}
                      {data.recalls.total > data.recalls.results.length && (
                        <a href={openFDaRecallUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-blue-600 hover:underline py-2">
                          View all {data.recalls.total.toLocaleString()} recalls on openFDA &rarr;
                        </a>
                      )}
                    </div>
                  )}

                    {tab === 'events' && (
                      <div className="space-y-3">
                        {data.adverseEvents.results.length === 0 ? (
                          <EmptyState message="No adverse event reports found for this company in the FDA MAUDE Database." />
                        ) : (
                          data.adverseEvents.results.map((e, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (e.eventType === 'Death' ? 'bg-red-100 text-red-700' : e.eventType === 'Injury' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700')}>{e.eventType}</span>
                                  <span className="text-xs text-gray-400">Report: {e.reportNumber}</span>
                                </div>
                                <span className="text-xs text-gray-400">{e.dateReceived}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">{e.deviceName}</p>
                             <p className="text-xs text-gray-500 mb-2">{e.deviceGeneric}</p>
                             {e.problems !== 'N/A' && <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Problems:</span> {e.problems}</p>}
                             {e.patientImpact !== 'N/A' && <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Patient impact:</span> {e.patientImpact}</p>}
                             {e.description && <p className="text-xs text-gray-500 mt-2 italic line-clamp-3">{e.description}</p>}
                          </div>
                          ))
                      )}
                      {data.adverseEvents.total > data.adverseEvents.results.length && (
                        <a href={openFDAEventUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-blue-600 hover:underline py-2">
                          View all {data.adverseEvents.total.toLocaleString()} adverse events on openFDA &rarr;
                        </a>
                      )}
                    </div>
                  )}

                    {tab === 'warnings' && (
                      <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-800 mb-3">{data.warningLetters.note}</p>
                          <a href={data.warningLetters.searchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Search FDA Warning Letters for {company}
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 space-y-2">
                          <p>FDA Warning Letters are issued when FDA inspectors find significant violations of regulatory requirements. They are not available through the openFDA API but can be searched on the FDA Website.</p>
                          <p>The FDA warning letter database covers all regulated industries and is updated weekly.</p>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="mx-5 mb-5 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
                    <p className="text-sm text-red-900 mb-2">
                      <strong>ESL can help remediate regulatory concerns.</strong> From warning letter responses to recall corrective actions, static analysis remediation, and SBOM/CVE evidence packages.
                    </p>
                    <a href="mailto:sales@eswlab.com?subject=Regulatory Concerns Remediation" className="text-sm font-medium text-red-700 hover:underline">
                      Contact ESL for remediation support &rarr;
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        )}
    </>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number | null }) {
  return (
    <button
      className={'px-4 py-3 text-sm font-medium border-b-2 transition-colors ' + (active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700')}
    >
      {label}
      {count !== null && count > 0 && (
        <span className={'ml-2 px-1.5 py-0.5 text-xs rounded-full font-bold ' + (active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>
          {count > 999 ? '999+' : count.toLocaleString()}
        </span>
      )}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}