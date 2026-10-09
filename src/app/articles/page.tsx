import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { articles } from '@/lib/articles';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ArticlesPage() {
  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Articles &amp; Regulatory News</h1>
          <p className="text-gray-600">
            Curated regulatory news and ESL briefs on FDA-authorized AI medical devices: recall system
            concerns, the 510(k) pathway, generative AI regulation, and software verification
            enforcement trends.
          </p>
        </div>

        <div className="space-y-6">
          {articles.map((a) => (
            <a
              key={a.id}
              href={a.url}
              target={a.external ? '_blank' : undefined}
              rel={a.external ? 'noopener noreferrer' : undefined}
              className="block bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 card-hover"
            >
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                  {a.source}
                </span>
                <time dateTime={a.date} className="text-xs text-gray-500">
                  {formatDate(a.date)}
                </time>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{a.title}</h2>
              <p className="text-gray-600 text-sm mb-3">{a.summary}</p>
              {a.credit && <p className="text-xs text-gray-500 italic mb-3">{a.credit}</p>}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                {a.external ? 'Read on the source site' : 'Read the article'} &rarr;
              </span>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
