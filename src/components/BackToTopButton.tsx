'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function checkAtBottom() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setVisible(atBottom);
    }
    checkAtBottom();
    window.addEventListener('scroll', checkAtBottom, { passive: true });
    window.addEventListener('resize', checkAtBottom);
    return () => {
      window.removeEventListener('scroll', checkAtBottom);
      window.removeEventListener('resize', checkAtBottom);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Nahoru"
      className="md:hidden fixed bottom-6 left-4 z-40 w-[44px] h-[44px] rounded-full bg-primary hover:bg-primary-hover text-black flex items-center justify-center shadow-lg transition-all cursor-pointer animate-slideUp"
    >
      <ArrowUp size={20} />
    </button>
  );
}
