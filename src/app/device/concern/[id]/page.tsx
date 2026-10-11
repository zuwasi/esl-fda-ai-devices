import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import type { Metadata } from 'next';
import RegulatoryConcerns from '@/components/RegulatoryConcerns';
import ConcernDeviceInfo from '@/components/ConcernDeviceInfo';
import type { ConcernGroup } from '@/app/api/search/concerns/route';

export const revalidate = 86400;

let INDEX: ConcernGroup[] | null = null;

async function loadIndex(): Promise<ConcernGroup[]> {
  if (INDEX === null) {
    let loaded: ConcernGroup[] = [];
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'concerns-devices.json');
      loaded = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
      loaded = [];
    }
    INDEX = loaded;
  }
  return INDEX;
}

const classColors: Record<string, string> = {
  'Class I': 'bg-red-100 text-red-700',
  'Class II': 'bg-yellow-100 text-yellow-700',
  'Class III': 'bg-red-100 text-red-700',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const groups = await loadIndex();
  const g = groups.find(x => x.id === id);
  return { title: g ? g.device + ' - ' + g.firm + ' | ESL FDA AI Device Intelligence' : 'Concern device not found' };
}

export default async function ConcernDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const groups = await loadIndex();
  const g = groups.find(x => x.id === id);

  if (!g) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Device not found in the concerns index</h1>
        <p className="text-gray-500 mt-2">The index is rebuilt periodically from FDA recall records.</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link> / <span>Regulatory concerns</span>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{g.device}</h1>
        {g.worstClass && (
          <span className={'text-xs px-2.5 py-1 rounded-full font-semibold ' + (classColors[g.worstClass] || 'bg-gray-100 text-gray-700')}>
            {g.worstClass} recall
          </span>
        )}
        {g.openRecalls > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-700">{g.openRecalls} open</span>
        )}
      </div>
      <p className="text-gray-600 mt-1">{g.firm} • {g.recallCount} recall{g.recallCount === 1 ? '' : 's'} recorded since 2016{g.latestDate ? ' • latest ' + g.latestDate : ''}</p>

      {(g.firmAddress || g.feiNumber || (g.productCodes && g.productCodes.length > 0)) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {g.firmAddress && <div><p className="text-xs text-gray-500">Recalling firm address</p><p className="text-sm font-semibold text-gray-900">{g.firmAddress}</p></div>}
          {g.feiNumber && <div><p className="text-xs text-gray-500">FDA establishment (FEI) number</p><p className="text-sm font-semibold text-gray-900">{g.feiNumber}</p></div>}
          {g.productCodes && g.productCodes.length > 0 && <div><p className="text-xs text-gray-500">FDA product code{g.productCodes.length > 1 ? 's' : ''}</p><p className="text-sm font-semibold text-gray-900">{g.productCodes.join(', ')}</p></div>}
        </div>
      )}

      {g.aiLinked && g.aiLinked.length > 0 && (
        <p className="text-sm mt-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          FDA submission records linked to this recall:{' '}
          {g.aiLinked.map(k => <Link key={k} href={'/device/' + k} className="text-blue-600 font-semibold hover:underline mr-3">{k}</Link>)}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
        This device is not in the FDA AI-Enabled Device Index, but it has FDA recall records. It appears on this site through the ESL regulatory-concerns index built from openFDA recall data.
      </p>

      {g.productCodes && g.productCodes.length > 0 && (
        <ConcernDeviceInfo productCodes={g.productCodes} kNumbers={g.kNumbers || []} aiLinked={g.aiLinked || []} />
      )}

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Recall history</h2>
      <div className="space-y-3">
        {g.recalls.map((r, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {r.classification && r.classification !== 'N/A' && (
                <span className={'text-xs px-2 py-0.5 rounded-full font-semibold ' + (classColors[r.classification] || 'bg-gray-100 text-gray-700')}>{r.classification}</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{r.status}</span>
              <span className="text-xs text-gray-500">Initiated {r.initiated}{r.terminated ? ' • Terminated ' + r.terminated : ''}</span>
            </div>
            <p className="text-sm text-gray-800"><span className="font-semibold">Reason:</span> {r.reason}</p>
            {r.rootCause && r.rootCause !== 'N/A' && <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Root cause:</span> {r.rootCause}</p>}
            {r.product && r.product !== 'N/A' && <p className="text-xs text-gray-500 mt-2">{r.product}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
              {r.quantity && <span>Quantity: {r.quantity}</span>}
              {r.distribution && <span>Distribution: {r.distribution}</span>}
              {r.country && <span>Country: {r.country}</span>}
            </div>
            {r.codeInfo && <p className="text-xs text-gray-500 mt-1">Codes: {r.codeInfo}</p>}
            {r.action && (
              <details className="mt-2">
                <summary className="text-xs font-semibold text-blue-600 cursor-pointer">Corrective action taken by the firm</summary>
                <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{r.action}</p>
              </details>
            )}
            {r.eventNumber && (
              <a
                href={'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRES/res.cfm?id=' + encodeURIComponent(r.eventNumber)}
                target="_blank" rel="noopener noreferrer"
                className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                View on FDA.gov ↗
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <RegulatoryConcerns company={g.firm} deviceName={g.device} />
      </div>
    </div>
  );
}
