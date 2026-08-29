'use client';
import { useState } from 'react';

interface ConcernSet {
  recalls: { total: number; results: Array<{ product: string; reason: string; rootCause: string; status: string; date: string; firm: string; eventNumber: string }> };
  adverseEvents: { total: number; results: Array<{ eventType: string; reportNumber: string; dateReceived: string; deviceName: string; deviceGeneric: string; problems: string; patientImpact: string; description: string }> };
}

interface WarningLetter {
  postedDate: string;
  issueDate: string;
  companyName: string;
  issuingOffice: string;
  subject: string;
  hasResponse: boolean;
  closeoutDate: string | null;
}

interface RegulatoryData {
  company: string; deviceName: string; deviceSpecific: ConcernSet; companyWide: ConcernSet;
  warningLetters: { letters: WarningLetter[]; total: number; searchUrl: string; note: string };
}

function primaryCompanyName(company: string) {
  const cleaned = company.replace(/[.,]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => w.length > 2 && !['Inc', 'LLC', 'Corp', 'Ltd', 'Co', 'The', 'And', 'GmbH', 'SA', 'AG'].includes(w));
  return words[0] || cleaned.split(/\s+/)[0] || company;
}

function deviceSearchKeywords(deviceName: string) {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'system', 'systems', 'software', 'version', 'inc', 'llc', 'corp', 'ltd', 'co', 'gmbh', 'feature', 'diagnostic', 'medical', 'device', 'algorithm', 'notification']);
  const words = deviceName.replace(/\([^)]*\)/g, ' ').split(/[\s\/\-]+/).filter(word => word && word.length > 1 && !stopWords.has(word.toLowerCase()));
  return words.slice(0, 2).join(' ') || deviceName;
}

export default function RegulatoryConcerns({ company, deviceName }: { company: string; deviceName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegulatoryData | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'recalls' | 'events' | 'warnings'>('recalls');
  const [scope, setScope] = useState<'device' | 'company'>('device');

  async function handleClick() {
    setOpen(true);
    if (data) return;
    setLoading(true);
    setError('');
    try {
      const apiUrl = '/api/regulatory-concerns?company=' + encodeURIComponent(company) + '&deviceName=' + encodeURIComponent(deviceName);
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      const result: RegulatoryData = await response.json();
      setData(result);
      if (result.deviceSpecific.recalls.total > 0) setTab('recalls');
      else if (result.deviceSpecific.adverseEvents.total > 0) setTab('events');
      else if (result.warningLetters.total > 0) setTab('warnings');
      else setTab('recalls');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load regulatory concerns.');
    } finally {
      setLoading(false);
    }
  }

  const concerns = data ? (scope === 'device' ? data.deviceSpecific : data.companyWide) : null;
  const total = (concerns?.recalls.total || 0) + (concerns?.adverseEvents.total || 0);
  const wlCount = data?.warningLetters.total || 0;
  const deviceTotal = (data?.deviceSpecific.recalls.total || 0) + (data?.deviceSpecific.adverseEvents.total || 0);
  const totalWithWL = deviceTotal + wlCount;
  const encodedCompany = encodeURIComponent(JSON.stringify(primaryCompanyName(company)));
  const encodedDevice = encodeURIComponent(JSON.stringify(deviceSearchKeywords(deviceName)));
  const recallSearch = 'https://api.fda.gov/device/recall.json?search=recalling_firm:' + encodedCompany + (scope === 'device' ? '+AND+product_description:' + encodedDevice : '') + '&limit=100';
  const eventSearch = 'https://api.fda.gov/device/event.json?search=device.manufacturer_d_name:' + encodedCompany + (scope === 'device' ? '+AND+device.brand_name:' + encodedDevice : '') + '&limit=100';

  return <>
    <button onClick={handleClick} className={'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors' + ''}>
      <WarningIcon className={'w-4 h-4' + ''} /> Regulatory Concerns
      {data && totalWithWL > 0 && <span className={'px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-bold' + ''}>{totalWithWL > 999 ? '999+' : totalWithWL}</span>}
    </button>
    {open && <div className={'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50' + ''} onClick={() => setOpen(false)}>
      <div className={'bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col' + ''} onClick={event => event.stopPropagation()}>
        <div className={'p-5 border-b border-gray-200 bg-red-50' + ''}>
          <div className={'flex items-start justify-between' + ''}>
            <div><h2 className={'text-lg font-bold text-gray-900 flex items-center gap-2' + ''}><WarningIcon className={'w-5 h-5 text-red-600' + ''} />Regulatory Concerns</h2>
              <p className={'text-sm text-gray-600 mt-0.5' + ''}>{company} - {deviceName}</p></div>
            <button onClick={() => setOpen(false)} className={'text-gray-400 hover:text-gray-600 p-1' + ''} aria-label="Close"><svg className={'w-6 h-6' + ''} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <label className={'mt-3 inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer' + ''}>
            <input type="checkbox" checked={scope === 'company'} onChange={event => setScope(event.target.checked ? 'company' : 'device')} className={'w-4 h-4 accent-red-600' + ''} />
            Show all concerns for {company}
          </label>
        </div>
        <div className={'flex-1 overflow-y-auto' + ''}>
          {loading && <div className={'p-8 text-center' + ''}><div className={'inline-block animate-spin h-8 w-8 border-4 border-red-200 border-t-red-600 rounded-full mb-3' + ''} /><p className={'text-sm text-gray-500' + ''}>Searching FDA databases...</p></div>}
          {error && <div className={'p-8 text-center text-red-600 text-sm' + ''}>{error}</div>}
          {data && concerns && !loading && <>
            <div className={'flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-sm' + ''}>
              <span className={total ? 'font-medium text-red-600' : 'font-medium text-green-600'}>{total ? (scope === 'device' ? total.toLocaleString() + ' regulatory concerns for this device' : total.toLocaleString() + ' total regulatory concerns for ' + company) : 'No recalls or adverse events found in FDA databases'}</span>
              <span className={'text-xs text-gray-400' + ''}>Source: openFDA API</span>
            </div>
            <div className={'flex border-b border-gray-200 px-5' + ''}>
              <TabButton active={tab === 'recalls'} onClick={() => setTab('recalls')} label="Recalls" count={concerns.recalls.total} />
              <TabButton active={tab === 'events'} onClick={() => setTab('events')} label="Adverse Events" count={concerns.adverseEvents.total} />
              <TabButton active={tab === 'warnings'} onClick={() => setTab('warnings')} label="Warning Letters" count={wlCount} />
            </div>
            <div className={'p-5' + ''}>
              {tab === 'recalls' && <div className={'space-y-3' + ''}>
                {!concerns.recalls.results.length ? <EmptyState message="No device recalls found in FDA records." /> : concerns.recalls.results.map((recall, index) =>
                  <div key={index} className={'bg-white border border-gray-200 rounded-lg p-4' + ''}><div className={'flex justify-between gap-3 mb-2' + ''}><span className={'text-xs px-2 py-1 rounded-full font-medium ' + (recall.status.includes('Open') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>{recall.status}</span><span className={'text-xs text-gray-400' + ''}>{recall.date}</span></div><p className={'text-sm font-medium text-gray-900 mb-1' + ''}>{recall.product}</p><p className={'text-sm text-gray-600 mb-2' + ''}><strong>Reason:</strong> {recall.reason}</p><p className={'text-xs text-gray-500' + ''}>Root cause: {recall.rootCause} · Event #: {recall.eventNumber}</p></div>)}
                {concerns.recalls.total > concerns.recalls.results.length && <a href={recallSearch} target="_blank" rel="noopener noreferrer" className={'block text-center text-sm text-blue-600 hover:underline py-2' + ''}>View all {concerns.recalls.total.toLocaleString()} results on openFDA →</a>}
              </div>}
              {tab === 'events' && <div className={'space-y-3' + ''}>
                {!concerns.adverseEvents.results.length ? <EmptyState message="No adverse event reports found in the FDA MAUDE database." /> : concerns.adverseEvents.results.map((event, index) =>
                  <div key={index} className={'bg-white border border-gray-200 rounded-lg p-4' + ''}><div className={'flex justify-between gap-3 mb-2' + ''}><span className={'text-xs px-2 py-1 rounded-full font-medium ' + (event.eventType === 'Death' ? 'bg-red-100 text-red-700' : event.eventType === 'Injury' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700')}>{event.eventType}</span><span className={'text-xs text-gray-400' + ''}>{event.dateReceived}</span></div><p className={'text-sm font-medium text-gray-900' + ''}>{event.deviceName}</p><p className={'text-xs text-gray-500 mb-2' + ''}>{event.deviceGeneric} · Report: {event.reportNumber}</p>{event.problems !== 'N/A' && <p className={'text-sm text-gray-600' + ''}><strong>Problems:</strong> {event.problems}</p>}{event.patientImpact !== 'N/A' && <p className={'text-sm text-gray-600' + ''}><strong>Patient impact:</strong> {event.patientImpact}</p>}{event.description && <p className={'text-xs text-gray-500 mt-2 italic line-clamp-3' + ''}>{event.description}</p>}</div>)}
                {concerns.adverseEvents.total > concerns.adverseEvents.results.length && <a href={eventSearch} target="_blank" rel="noopener noreferrer" className={'block text-center text-sm text-blue-600 hover:underline py-2' + ''}>View all {concerns.adverseEvents.total.toLocaleString()} results on openFDA →</a>}
              </div>}
              {tab === 'warnings' && <div className={'space-y-3' + ''}>
                {!data.warningLetters.letters.length ? <EmptyState message="No warning letters found for this company in FDA records." /> : data.warningLetters.letters.map((wl, index) =>
                  <div key={index} className={'bg-white border border-gray-200 rounded-lg p-4' + ''}>
                    <div className={'flex justify-between gap-3 mb-2' + ''}>
                      <span className={'text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700' + ''}>Warning Letter</span>
                      <span className={'text-xs text-gray-400' + ''}>Issued: {wl.issueDate}</span>
                    </div>
                    <p className={'text-sm font-medium text-gray-900 mb-1' + ''}>{wl.subject}</p>
                    <p className={'text-xs text-gray-500 mb-2' + ''}>{wl.companyName} · {wl.issuingOffice}</p>
                    <div className={'flex flex-wrap gap-2 mt-2' + ''}>
                      {wl.hasResponse && <span className={'text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium' + ''}>Response Received</span>}
                      {wl.closeoutDate ? <span className={'text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium' + ''}>Closed Out: {wl.closeoutDate}</span> : <span className={'text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium' + ''}>Open / No Closeout</span>}
                      <span className={'text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600' + ''}>Posted: {wl.postedDate}</span>
                    </div>
                  </div>)}
                {data.warningLetters.searchUrl && <a href={data.warningLetters.searchUrl} target="_blank" rel="noopener noreferrer" className={'block text-center text-sm text-blue-600 hover:underline py-2' + ''}>View full warning letters on FDA.gov →</a>}
              </div>}
            </div>
            <div className={'mx-5 mb-5 p-4 rounded-lg bg-red-50' + ''}><p className={'text-sm text-red-900 mb-2' + ''}><strong>ESL can help remediate regulatory concerns.</strong> From warning letter responses to recall corrective actions, static analysis remediation, and SBOM/CVE evidence packages.</p><a href="mailto:sales@eswlab.com?subject=Regulatory%20Concerns%20Remediation" className={'text-sm font-medium text-red-700 hover:underline' + ''}>Contact ESL for remediation support →</a></div>
          </>}
        </div>
      </div>
    </div>}
  </>;
}

function WarningIcon({ className }: { className: string }) { return <svg className={className + ''} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>; }

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number | null }) {
  return <button onClick={onClick} className={'px-4 py-3 text-sm font-medium border-b-2 transition-colors ' + (active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>{label}{count !== null && count > 0 && <span className={'ml-2 px-1.5 py-0.5 text-xs rounded-full font-bold ' + (active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>{count > 999 ? '999+' : count.toLocaleString()}</span>}</button>;
}

function EmptyState({ message }: { message: string }) {
  return <div className={'text-center py-8' + ''}><svg className={'w-12 h-12 text-green-400 mx-auto mb-3' + ''} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className={'text-sm text-gray-500' + ''}>{message}</p></div>;
}
