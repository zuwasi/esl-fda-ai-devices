const FDA_DISCUSSION_URL =
  'https://www.fda.gov/medical-devices/digital-health-center-excellence/considerations-regulation-generative-ai-enabled-medical-devices-discussion-paper-and-request';

export default function BreakingBanner() {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className="border-b border-amber-200 bg-amber-50 text-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 flex-wrap py-2.5">
        <span className="inline-flex items-center gap-1.5 font-bold text-xs tracking-wider uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
          Breaking
        </span>
        <span className="text-sm font-medium">
          FDA seeks feedback on regulating <strong>Generative AI-enabled medical devices</strong> — public
          comments open through Oct 19, 2026.{' '}
          <a
            href={FDA_DISCUSSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-700 underline whitespace-nowrap hover:text-blue-900"
          >
            Read more &rarr;
          </a>
        </span>
      </div>
    </div>
  );
}
