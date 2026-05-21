'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';


const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), { 
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-black-custom text-secondary style-body-bold">Načítám studio...</div>
});

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [createdStampId, setCreatedStampId] = useState<string | null>(null);
  // NOVÝ STAV PRO LIGHTBOX
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  // Zástupný stav pro vybranou šablonu (pro designové účely zatím provázaný s duplicitními položkami)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('templateA-1'); 

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
    <div className="w-full h-[100dvh] flex flex-col bg-black-custom overflow-hidden text-secondary select-none font-sans antialiased">
      
      {/* --- HLAVIČKA ZE STRÁNKY KOŠÍKU SE STEPPEREM --- */}
      {!isMobileLandscape && (
        <header className="shrink-0 w-full bg-black500 border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center z-40 relative shadow-md">
          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-between">
            <Link href="/" className="flex-shrink-0 flex items-center h-full">
              <Image src="/images/creative-stamp_logo.svg" alt="Logo" width={250} height={69} priority className="hidden md:block w-[250px] h-auto object-contain" />
              <Image src="/images/logo-black200_basked-mobile.svg" alt="Logo Mobile" width={40} height={40} priority className="block md:hidden h-[40px] w-auto object-contain" />
            </Link>
            <div className="flex items-center">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center rounded-full style-body-bold transition-colors w-[32px] h-[32px] md:w-[36px] md:h-[36px] ${currentStep >= step ? 'bg-primary text-black-custom' : 'bg-transparent text-black300 border border-black300'}`}>
                    {step}
                  </div>
                  {index < 2 && (
                    <div className={`h-[1px] w-[10px] md:w-[16px] mx-1 md:mx-2 transition-colors ${currentStep > index + 1 ? 'bg-primary' : 'bg-black300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>
      )}
      
      <main className={`flex-1 min-h-0 w-full flex flex-col relative overflow-y-auto ${isMobileLandscape ? 'pb-0' : 'pb-[80px] lg:pb-[116px]'}`}>
        

        {/* === KROK 1: VÝBĚR ŠABLONY === */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 animate-[fadeIn_0.2s_ease-out]">
            <h1 className="style-h1 text-secondary text-center">Vyberte si šablonu</h1>
            
            <div className="flex flex-col gap-8 w-full max-w-5xl space-y-8">
              {/* Položka šablony - ID: templateA-1 (zástupná položka) */}
              <div className="template_item flex flex-col gap-6 cursor-pointer" onClick={() => setSelectedTemplate('templateA-1')}>
                {/* Header položky: Checkbox + Titul, Oddělovač, Popisek */}
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTemplate === 'templateA-1'} 
                    onChange={() => setSelectedTemplate('templateA-1')} 
                    className="w-5 h-5 accent-primary cursor-pointer rounded-[4px] shrink-0"
                  />
                  <h4 className="style-h4 text-secondary">Šablona A</h4>
                  <span className="text-secondary opacity-50 px-1">|</span>
                  <span className="style-body text-black300">6 fotografií, 6 známek</span>
                </div>
                
                {/* Náhledový obrázek s LIGHTBOXEM a OCHRANOU */}
                <div 
                  className="relative flex justify-center w-full h-auto cursor-zoom-in group select-none" 
                  onClick={(e) => { e.stopPropagation(); setLightboxImg('/images/template-preview-a.jpg'); }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image 
                    src="/images/template-preview-a.jpg" // Obrázek nahraj do public/images/
                    alt="Náhled šablony A" 
                    width={800} height={600} 
                    className="max-w-full h-auto object-contain shadow-2xl border border-black300/30 rounded-[4px] pointer-events-none group-hover:border-primary/50 transition-colors" 
                    onDragStart={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 z-10 bg-transparent" />
                </div>
                
                {/* Sekce s použitými známkami */}
                <div className="flex flex-col gap-3">
                  <span className="style-body text-secondary">Známky na Vašem archu</span>
                  <div className="flex row items-center gap-4">
                    {/* Zástupné obrázky známek s LIGHTBOXEM a OCHRANOU */}
                    <div 
                      className="relative cursor-zoom-in group select-none" 
                      onClick={(e) => { e.stopPropagation(); setLightboxImg('/images/stamp-1.jpg'); }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image src="/images/stamp-1.jpg" alt="Známka 1" width={100} height={100} className="w-[80px] h-[80px] object-cover rounded-[4px] border border-black300/30 pointer-events-none group-hover:border-primary/50 transition-colors" onDragStart={(e) => e.preventDefault()} />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                    <div 
                      className="relative cursor-zoom-in group select-none" 
                      onClick={(e) => { e.stopPropagation(); setLightboxImg('/images/stamp-2.jpg'); }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image src="/images/stamp-2.jpg" alt="Známka 2" width={100} height={100} className="w-[80px] h-[80px] object-cover rounded-[4px] border border-black300/30 pointer-events-none group-hover:border-primary/50 transition-colors" onDragStart={(e) => e.preventDefault()} />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Duplicitní položka - ID: templateA-2 (designová zástupná položka) */}
              <div className="template_item flex flex-col gap-6 cursor-pointer" onClick={() => setSelectedTemplate('templateA-2')}>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTemplate === 'templateA-2'} 
                    onChange={() => setSelectedTemplate('templateA-2')} 
                    className="w-5 h-5 accent-primary cursor-pointer rounded-[4px] shrink-0"
                  />
                  <h4 className="style-h4 text-secondary">Šablona B</h4>
                  <span className="text-secondary opacity-50 px-1">|</span>
                  <span className="style-body text-black300">6 fotografií, 6 známek</span>
                </div>
                
                <div 
                  className="relative flex justify-center w-full h-auto cursor-zoom-in group select-none" 
                  onClick={(e) => { e.stopPropagation(); setLightboxImg('/images/template-preview-a.jpg'); }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image src="/images/template-preview-a.jpg" alt="Náhled šablony B" width={800} height={600} className="max-w-full h-auto object-contain shadow-2xl border border-black300/30 rounded-[4px] pointer-events-none group-hover:border-primary/50 transition-colors" onDragStart={(e) => e.preventDefault()}/>
                  <div className="absolute inset-0 z-10 bg-transparent" />
                </div>
                
                <div className="flex flex-col gap-3">
                  <span className="style-body text-secondary">Známky na Vašem archu</span>
                  <div className="flex row items-center gap-4">
                    <div className="relative cursor-zoom-in group select-none" onClick={(e) => { e.stopPropagation(); setLightboxImg('/images/stamp-1.jpg'); }} onContextMenu={(e) => e.preventDefault()}>
                      <Image src="/images/stamp-1.jpg" alt="Známka 1" width={100} height={100} className="w-[80px] h-[80px] object-cover rounded-[4px] border border-black300/30 pointer-events-none group-hover:border-primary/50 transition-colors" onDragStart={(e) => e.preventDefault()} />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                    <div className="relative cursor-zoom-in group select-none" onClick={(e) => { e.stopPropagation(); setLightboxImg('/images/stamp-2.jpg'); }} onContextMenu={(e) => e.preventDefault()}>
                      <Image src="/images/stamp-2.jpg" alt="Známka 2" width={100} height={100} className="w-[80px] h-[80px] object-cover rounded-[4px] border border-black300/30 pointer-events-none group-hover:border-primary/50 transition-colors" onDragStart={(e) => e.preventDefault()} />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* === KROK 2: EDITOR NÁVRHU === */}
        {currentStep === 2 && (
          <StampEditor onComplete={handleEditorComplete} isMobileLandscape={isMobileLandscape} />
        )}

        {/* === KROK 3: ÚSPĚCH A PŘESUN DO KOŠÍKU === */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 animate-[fadeIn_0.2s_ease-out] text-center">
            <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-secondary text-5xl shadow-xl shadow-success/20 font-light">✓</div>
            <div className="space-y-4">
              <h1 className="style-h1 text-secondary">Váš arch byl vložen do košíku!</h1>
              <p className="style-body text-black300 max-w-lg mx-auto">
                Skvělá práce. Váš grafický návrh je připraven k tisku a bezpečně uložen v košíku. Počet kusů si můžete upravit před zaplacením.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mt-4 w-full md:w-auto">
              <Button onClick={() => window.location.reload()} variant="outlined" className="w-full md:w-auto">
                Vytvořit další arch
              </Button>
              <Button onClick={() => window.location.href = '/kosik'} className="w-full md:w-auto">
                Přejít do košíku
              </Button>
            </div>
          </div>
        )}
        {/* OCHRANA V LIGHTBOXU - STEJNÁ JAKO V DETAILU PRODUKTU */}
        {lightboxImg && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black-custom/90 backdrop-blur-sm p-4 cursor-zoom-out select-none"
            onClick={() => setLightboxImg(null)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button 
              className="absolute top-6 right-6 text-secondary hover:text-primary transition-colors z-[110]"
              onClick={() => setLightboxImg(null)}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="relative w-full max-w-[90vw] max-h-[90vh] aspect-video md:aspect-auto md:h-full">
              <Image 
                src={lightboxImg} 
                alt="Detailní náhled" 
                fill 
                className="object-contain pointer-events-none" 
                onDragStart={(e) => e.preventDefault()}
              />
              {/* ŠTÍT V LIGHTBOXU */}
              <div className="absolute inset-0 z-[105] bg-transparent" />
            </div>
          </div>
        )}
        </main>

      {/* --- FIXNÍ PATIČKA PRO KROK 1 (Sjednocený design s editorem) --- */}
      {currentStep === 1 && (
        <footer className={`bg-black500 fixed bottom-0 left-0 w-full border-t border-black300/30 h-[80px] lg:h-[116px] flex items-center justify-center z-50 transition-transform ${isMobileLandscape ? 'pb-0' : 'pb-safe'}`} >
          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex justify-between items-center">
            <Button onClick={() => window.history.back()} variant="outlined" arrow="left">Zpět</Button>
            <Button onClick={() => handleNextStep()} arrow="right" disabled={!selectedTemplate}>
              {"Další krok"}
            </Button>
          </div>
        </footer>
      )}

    </div>
  );
}