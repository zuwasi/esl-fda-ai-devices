'use client';

import { useState } from 'react';

export interface AiInfoData {
  submissionNumber: string;
  deviceName: string;
  applicant: string;
  panel: string;
  regulatoryPathway: string;
  decisionDate: string;
  aiFunction: string;
  clinicalFunction: string;
  dataType: string;
  riskClass: string;
  thesis: string;
}

interface WebResult {
  title: string;
  url: string;
  snippet: string;
}

type WebState =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'off'; message: string }
  | { state: 'error' }
  | { state: 'done'; results: WebResult[] };

export default function AiInfoModal({ info, onClose }: { info: AiInfoData; onClose: () => void }) {
  const [web, setWeb] = useState<WebState>({ state: 'idle' });

  async function searchWeb() {
    setWeb({ state: 'loading' });
    try {
      const q = encodeURIComponent(`${info.deviceName} ${info.applicant} FDA AI`);
      const res = await fetch('/api/web-search?q=' + q);
      const data = await res.json();
      if (!data.available) setWeb({ state: 'off', message: data.reason || 'Live web search is not configured on the server.' });
      else setWeb({ state: 'done', results: data.results || [] });
    } catch {
      setWeb({ state: 'error' });
    }
  }

  const sections: { label: string; value: string }[] = [
    { label: 'What AI does in this device', value: info.aiFunction },
    { label: 'Clinical function', value: info.clinicalFunction },
    { label: 'Data the AI works on', value: info.dataType },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 bg-blue-50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                How AI Is Used in This Device
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">{info.deviceName} - {info.applicant}</p>
              <p className="text-xs text-gray-500 mt-1">{info.regulatoryPathway} • {info.panel} • Decision: {info.decisionDate} • IEC 62304 Class {info.riskClass}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {sections.filter(s => s.value && s.value !== 'N/A').map(s => (
            <div key={s.label}>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.label}</h3>
              <p className="text-sm text-gray-600">{s.value}</p>
            </div>
          ))}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">What the device is and what it is for</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{info.thesis}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Live web search (real-time, optional)</h3>
            {web.state === 'idle' && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Search the open web in real time for more public information about this device and its AI, via the site&apos;s metasearch integration (SearXNG).</p>
                <button onClick={searchWeb} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                  Search the web for this device
                </button>
              </div>
            )}
            {web.state === 'loading' && <p className="text-sm text-gray-500">Searching the web...</p>}
            {web.state === 'off' && <p className="text-xs text-gray-500 italic">{web.message}</p>}
            {web.state === 'error' && <p className="text-sm text-red-600">Live search failed. Try again later.</p>}
            {web.state === 'done' && (web.results.length
              ? <ul className="space-y-2">
                  {web.results.map((r, i) => (
                    <li key={i} className="text-sm">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">{r.title}</a>
                      <p className="text-xs text-gray-500">{r.snippet}</p>
                    </li>
                  ))}
                </ul>
              : <p className="text-xs text-gray-500 italic">No web results found for this device.</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
