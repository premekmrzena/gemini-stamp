'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import EditorHeader from '@/components/Editor/EditorHeader';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), { 
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-black-custom text-white">Načítám studio...</div>
});

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [createdStampId, setCreatedStampId] = useState<string | null>(null);
  
  // Připojení tvého stávajícího košíku
  const { addToCart } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileLandscape(window.innerWidth < 1024 && window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextStep = () => setCurrentStep(prev => prev + 1);

  // LOGIKA INTEGRACE DO TVÉHO KOŠÍKU
  const handleEditorComplete = async (stampId?: string) => {
    if (stampId) {
      setCreatedStampId(stampId);
      
      try {
        // 1. Stáhneme data právě vytvořeného archu a připojíme k němu informace o ceně a váze z hlavní tabulky produktů
        const { data, error } = await supabase
          .from('custom_stamps')
          .select(`
            id,
            preview_url,
            products (
              name,
              price,
              weight_grams
            )
          `)
          .eq('id', stampId)
          .single();

        if (error) throw error;

        // 2. Vytvoříme objekt ve formátu, který tvůj košík očekává, a vložíme ho tam
        if (data && data.products) {
          // Type casting pro jistotu, protože Supabase joins vrací typově pole nebo objekt
          const productInfo = Array.isArray(data.products) ? data.products[0] : data.products;

          addToCart({
            id: data.id, // Použijeme unikátní ID z custom_stamps (každý design je originál)
            name: `Vlastní návrh: ${productInfo.name}`,
            price: productInfo.price,
            image_url: data.preview_url, // Zákazník v košíku uvidí svůj design!
            quantity: 1,
            weight_grams: productInfo.weight_grams
          });
        }
      } catch (err) {
        console.error("Chyba při přidávání archu do košíku:", err);
      }
    }
    
    setCurrentStep(3);
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-black-custom overflow-hidden">
      
      {!isMobileLandscape && <EditorHeader currentStep={currentStep} />}
      
      <main className={`flex-1 min-h-0 w-full flex flex-col relative overflow-y-auto ${isMobileLandscape ? 'pb-0' : 'pb-[80px] lg:pb-[116px]'}`}>
        
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 animate-fadeIn">
            <h1 className="style-h1 text-secondary text-center">Vyberte si šablonu archu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
              <div 
                className="bg-[#1E293B] border-2 border-primary p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform shadow-2xl shadow-primary/10"
                onClick={handleNextStep}
              >
                <div className="aspect-[4/3] bg-black-custom rounded mb-4 flex items-center justify-center text-black300 uppercase tracking-widest font-bold text-xs">Náhled šablony 1</div>
                <h3 className="style-h3 text-white text-center">Klasický arch (8 známek)</h3>
              </div>
              <div className="bg-[#1E293B] border border-white/10 opacity-50 p-6 rounded-2xl cursor-not-allowed">
                <div className="aspect-[4/3] bg-black-custom rounded mb-4" />
                <h3 className="style-h3 text-white text-center">Brzy doplníme...</h3>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <StampEditor onComplete={handleEditorComplete} isMobileLandscape={isMobileLandscape} />
        )}

        {currentStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 animate-fadeIn text-center">
            <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-white text-5xl shadow-xl shadow-success/20">✓</div>
            <div className="space-y-4">
              <h1 className="style-h1 text-secondary">Váš arch byl vložen do košíku!</h1>
              <p className="style-body text-black300 max-w-lg mx-auto">
                Skvělá práce. Váš grafický návrh je připraven k tisku a bezpečně uložen v košíku. Počet kusů si můžete upravit před zaplacením.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <Button onClick={() => window.location.reload()} variant="outlined">
                Vytvořit další arch
              </Button>
              <Button onClick={() => window.location.href = '/kosik'}>
                Přejít do košíku
              </Button>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}