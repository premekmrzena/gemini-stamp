import { useTranslations } from 'next-intl';

// Jednořádková informace o expresu na hotel (docs/14-plan-marketing-2026-10.md, bod 4) -
// detail produktu a košík. Podmínky viz src/lib/expressDelivery.ts.
export default function ExpressDeliveryNote({ className = '' }: { className?: string }) {
  const t = useTranslations('expressDelivery');
  return (
    <p className={`style-label text-secondary/70 flex items-center gap-2 ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-success">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
      {t('note')}
    </p>
  );
}
