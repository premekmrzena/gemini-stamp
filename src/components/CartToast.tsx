'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartToast() {
  const { toast, dismissToast } = useCart();

  if (!toast.visible || !toast.item) return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] animate-slideUp">
      <Link
        href="/kosik"
        onClick={dismissToast}
        className="bg-secondary shadow-xl rounded-[4px] p-4 flex flex-col gap-[10px] min-w-[320px] max-w-[450px] cursor-pointer hover:opacity-90 transition-opacity border border-transparent hover:border-primary block"
      >
        <div className="flex items-center gap-[10px]">
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            className="text-success shrink-0"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h4 className="style-h4 text-success m-0">Přidáno do košíku</h4>
        </div>

        <hr className="border-black200 w-full m-0" />

        <div className="flex items-center gap-[10px]">
          <div className="relative w-12 h-12 border border-black200 rounded-[4px] overflow-hidden bg-white p-1 shrink-0">
            <Image src={toast.item.image_url} alt={toast.item.name} fill className="object-contain" />
          </div>
          <p className="style-body text-black m-0 line-clamp-2">{toast.item.name}</p>
        </div>
      </Link>
    </div>
  );
}
