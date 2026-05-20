'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import EditorHeader from '@/components/Editor/EditorHeader';
import Button from '@/components/Button';
import Link from 'next/link';

const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), { 
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-black-custom text-white">Načítám studio...</div>
});

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep(prev => prev + 1);

  return (
    <div className="w-full h-screen flex flex-col bg-black-custom overflow-hidden">
      <EditorHeader currentStep={currentStep} />
      
      <main className="flex-1 min-h-0 w-full flex flex-col">
        
        {/* KROK 1: VÝBĚR ŠABLONY */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 animate-fadeIn">
            <h1 className="style-h1 text-secondary text-center">Vyberte si šablonu archu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
              <div 
                className="bg-[#1E293B] border-2 border-primary p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                onClick={handleNextStep}
              >
                <div className="aspect-[4/3] bg-black-custom rounded mb-4 flex items-center justify-center text-black300">NÁHLED ŠABLONY 1</div>
                <h3 className="style-h3 text-white">Klasický arch (8 známek)</h3>
              </div>
              <div className="bg-[#1E293B] border border-white/10 opacity-50 p-6 rounded-2xl cursor-not-allowed">
                <div className="aspect-[4/3] bg-black-custom rounded mb-4" />
                <h3 className="style-h3 text-white">Brzy doplníme...</h3>
              </div>
            </div>
          </div>
        )}

        {/* KROK 2: EDITOR */}
        {currentStep === 2 && (
          <StampEditor onComplete={handleNextStep} />
        )}

        {/* KROK 3: ÚSPĚCH A KOŠÍK */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 animate-fadeIn text-center">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center text-white text-4xl shadow-xl shadow-success/20">✓</div>
            <div className="space-y-4">
              <h1 className="style-h1 text-secondary">Právě jste vytvořili svůj první arch!</h1>
              <p className="style-body text-black300 max-w-lg mx-auto">
                Skvělá práce. Váš grafický návrh je připraven k tisku. Co chcete udělat nyní?
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => window.location.href = '/vytvorit-arch'} variant="outlined">
                Vložit do košíku a vytvořit další arch
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Vložit do košíku a zpět na homepage
              </Button>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}