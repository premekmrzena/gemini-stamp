'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { gtagPageview } from '@/lib/gtag';

// gtag('config', ...) v GoogleAnalytics.tsx odešle pageview jen při prvním
// natvrdo načtení stránky. Next.js App Router mezi stránkami navigaguje
// klientsky (bez reloadu), takže bez tohohle by GA viděl jen vstupní stránku
// návštěvy a žádné další kliknutí v rámci webu.
export default function AnalyticsPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    gtagPageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
