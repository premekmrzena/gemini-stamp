'use client';

import Link from 'next/link';
import { Paintbrush } from 'lucide-react';

type StartCreatingButtonProps = {
  productId: string;
};

export default function StartCreatingButton({ productId }: StartCreatingButtonProps) {
  return (
    <Link
      href={`/vytvorit-arch?productId=${productId}`}
      onClick={(e) => e.stopPropagation()}
      className="style-body font-bold flex items-center justify-center gap-2 p-2 relative z-50 transition-all duration-300 w-40 text-[#FF6B35] hover:text-[#FF7F51] group/btn cursor-pointer"
    >
      <Paintbrush size={20} className="group-hover/btn:scale-110 transition-transform" />
      Začít tvořit
    </Link>
  );
}
