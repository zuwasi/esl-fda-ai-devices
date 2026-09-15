import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { caseStudies, getCaseStudyById } from '@/lib/caseStudies';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return caseStudies.map(cs => ({ id: cs.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cs = getCaseStudyById(id);
  if (!cs) return { title: 'Case Study Not Found' };
  return {
    title: cs.title + ' | ESL FDA Case Study',
    description: cs.result,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { id } = await params;
  const cs = getCaseStudyById(id);
  if (!cs) notFound();

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="/case-studies" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-6">
          &larr; All case studies
        </a>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{cs.pathway}</span>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{cs.specialty}</span>
          {cs.sourceUrl && (
            <a href={cs.sourceUrl} target="_blank" rel="noopener noreferrer"
               className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium border border-green-200 hover:bg-green-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {cs.sourceLabel || 'Verified'}
            </a>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">{cs.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Before ESL */}
          <div className="bg-red-50 rounded-xl p-5">
            <h2 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs">?</span>
              Before ESL
            </h2>
            <ul className="space-y-2">
              {cs.beforeESL.map((item, i) => (
                <li key={i} className="text-sm text-red-800 flex gap-2">
                  <span className="text-red-400">&bull;</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After ESL */}
          <div className="bg-green-50 rounded-xl p-5">
            <h2 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs">V</span>
              After ESL
            </h2>
            <ul className="space-y-2">
              {cs.afterESL.map((item, i) => (
                <li key={i} className="text-sm text-green-800 flex gap-2">
                  <span className="text-green-500">&bull;</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl mb-10">
          <p className="text-blue-900">
            <strong>Result:</strong> {cs.result}
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Bring ESL the software - not a cleaned-up demo</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            We will build, clean and connect the evidence. Start with a software evidence scoping workshop.
          </p>
          <a href="https://eswlab.com/contact-us/?your-subject=FDA%20Software%20Evidence%20Scoping%20Workshop"
            target="_blank" rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50">
            Schedule Scoping Workshop &rarr;
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
