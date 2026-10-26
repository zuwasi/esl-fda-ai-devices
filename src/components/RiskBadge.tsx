/** IEC 62304 software safety class chip. Uses palette classes that globals.css
 *  remaps under .dark, so the chip follows the theme toggle. */
const STYLES: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-amber-100 text-amber-800',
  C: 'bg-red-100 text-red-700',
};

export default function RiskBadge({ cls, size = 'sm' }: { cls: string; size?: 'sm' | 'md' }) {
  const sizing = size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span className={`${sizing} rounded-full font-medium whitespace-nowrap ${STYLES[cls] || 'bg-gray-100 text-gray-600'}`}>
      IEC 62304 Class {cls}
    </span>
  );
}
