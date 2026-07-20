'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const MIN_VISITORS = 5;
const MAX_VISITORS = 12;

function randomVisitorCount() {
  return Math.floor(Math.random() * (MAX_VISITORS - MIN_VISITORS + 1)) + MIN_VISITORS;
}

export default function TrustBadges({ hideReviewBadgeOnMobile = false }: { hideReviewBadgeOnMobile?: boolean }) {
  // Začíná na MIN_VISITORS, aby se první vykreslení shodovalo se serverem (žádný hydration mismatch),
  // náhodná hodnota se nastaví až po mountu na klientovi.
  const [visitorCount, setVisitorCount] = useState(MIN_VISITORS);

  useEffect(() => {
    // Náhodná hodnota musí přijít až tady (ne z lazy initializeru useState), jinak by se
    // spočítala i při SSR a lišila se od klientské -> hydration mismatch (viz komentář výše).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisitorCount(randomVisitorCount());
    const interval = setInterval(() => {
      setVisitorCount(randomVisitorCount());
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-1.5">
      <Link
        href="/vytvorit-arch"
        className="bg-black/70 backdrop-blur-sm text-secondary text-[11px] px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:border-white/30 transition-colors"
      >
        <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot shrink-0"></span>
        {visitorCount} návštěvníků právě vytváří kreativní arch
      </Link>
      <div className={`${hideReviewBadgeOnMobile ? 'hidden md:block' : ''} bg-black/70 backdrop-blur-sm text-secondary text-[11px] px-3 py-1.5 rounded-full border border-white/10`}>
        <span className="text-[var(--color-tag-novinka)] mr-1">★★★★★</span>
        Již 1&nbsp;247+ spokojených zákazníků
      </div>
    </div>
  );
}
