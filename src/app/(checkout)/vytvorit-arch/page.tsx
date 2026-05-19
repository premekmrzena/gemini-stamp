'use client';

import dynamic from 'next/dynamic';
import EditorHeader from '@/components/Editor/EditorHeader';

// Dynamický import grafického studia s vypnutým SSR
const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), { 
  ssr: false,
  loading: () => (
    <div className="w-full min-h-screen flex items-center justify-center bg-black-custom">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF6B35]"></div>
        <p className="text-white/50 animate-pulse font-sans text-sm">Připravuji tvůrčí studio...</p>
      </div>
    </div>
  )
});

export default function EditorPage() {
  return (
    <div className="w-full h-screen flex flex-col bg-black-custom overflow-hidden">
      
      {/* 1. Jednotný Header na úplném vrchu stránky */}
      <EditorHeader />
      
      {/* 2. Zbytek viewportu vyplní StampEditor, který si vnitřně řídí plátno, kontextový panel i patičku */}
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <StampEditor />
      </div>

    </div>
  );
}