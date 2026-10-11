'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DeviceInfo {
  available: boolean;
  classification: { deviceName?: string; deviceClass?: string; regulationNumber?: string; specialty?: string; panel?: string } | null;
  clearances: Array<{ kNumber?: string; deviceName?: string; applicant?: string; decisionDate?: string; decision?: string; pdfUrl?: string | null }>;
  note?: string;
}

/** Live FDA enrichment (device class + clearance history) for concern pages. */
export default function ConcernDeviceInfo({ productCodes, kNumbers, aiLinked }: { productCodes: string[]; kNumbers: string[]; aiLinked: string[] }) {
  const [info, setInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (productCodes[0]) params.set('productCode', productCodes[0]);
    if (kNumbers.length) params.set('kNumbers', kNumbers.join(','));
    if (!productCodes[0] && !kNumbers.length) return;
    fetch('/api/concern-device-info?' + params.toString())
      .then(r => r.json())
      .then(setInfo)
      .catch(() => setInfo(null));
  }, [productCodes, kNumbers]);

  if (!info) {
    return <div className="h-24 bg-gray-100 rounded-xl animate-pulse mt-8" />;
  }

  const c = info.classification;
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Device classification & clearances</h2>
      {info.note && <p className="text-xs text-gray-500 italic bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">{info.note}</p>}
      {c && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {c.deviceClass && <div><p className="text-xs text-gray-500">FDA device class</p><p className="text-sm font-semibold text-gray-900">{c.deviceClass}</p></div>}
          {c.specialty && <div><p className="text-xs text-gray-500">Medical specialty</p><p className="text-sm font-semibold text-gray-900">{c.specialty}</p></div>}
          {c.regulationNumber && <div><p className="text-xs text-gray-500">Regulation</p><p className="text-sm font-semibold text-gray-900">{c.regulationNumber}</p></div>}
          {c.deviceName && <div><p className="text-xs text-gray-500">Generic device type (product code {productCodes[0]})</p><p className="text-sm font-semibold text-gray-900">{c.deviceName}</p></div>}
        </div>
      )}
      {info.clearances.length > 0 && (
        <div className="space-y-2">
          {info.clearances.map(cl => {
            const isAi = cl.kNumber && aiLinked.includes(cl.kNumber);
            return (
              <div key={cl.kNumber} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {cl.kNumber}
                    {isAi && <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">AI device</span>}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{cl.deviceName} • {cl.applicant} • decided {cl.decisionDate}</p>
                </div>
                <div className="flex gap-3 shrink-0 text-sm">
                  {isAi && cl.kNumber && <Link href={'/device/' + cl.kNumber} className="text-blue-600 font-semibold hover:underline">AI analysis</Link>}
                  {cl.pdfUrl && <a href={cl.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FDA summary PDF ↗</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
