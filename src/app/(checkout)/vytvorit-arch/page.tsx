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

// Zástupná data pro vykreslení mřížky v Kroku 1 (3 šablony podle náhledu)
const TEMPLATE_OPTIONS = [
  { id: 'templateA-1', name: 'Šablona A', desc: '6 fotografií, 6 známek', img: '/images/template-preview-a.jpg', stamps: ['/images/stamp-1.jpg', '/images/stamp-2.jpg'] },
  { id: 'templateA-2', name: 'Šablona A', desc: '6 fotografií, 6 známek', img: '/images/template-preview-a.jpg', stamps: ['/images/stamp-1.jpg', '/images/stamp-2.jpg'] },
  { id: 'templateA-3', name: 'Šablona A', desc: '6 fotografií, 6 známek', img: '/images/template-preview-a.jpg', stamps: ['/images/stamp-1.jpg', '/images/stamp-2.jpg'] }
];

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [createdStampId, setCreatedStampId] = useState<string | null>(null);
  
  // LIGHTBOX
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  // Vybraná šablona
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('templateA-1'); 

  // Připojení košíku
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

  // LOGIKA INTEGRACE DO KOŠÍKU
  const handleEditorComplete = async (stampId?: string) => {
    if (stampId) {
      setCreatedStampId(stampId);
      
      try {
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

        if (data && data.products) {
          const productInfo = Array.isArray(data.products) ? data.products[0] : data.products;

          addToCart({
            id: data.id, 
            name: `Vlastní návrh: ${productInfo.name}`,
            price: productInfo.price,
            image_url: data.preview_url, 
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
      
      {/* --- HLAVIČKA ZE STRÁNKY KOŠÍKU SE STEPPEREM (NEDOTČENO) --- */}
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
        
        {/* === KROK 1: VÝBĚR ŠABLONY (Nový Grid Layout) === */}
        {currentStep === 1 && (
          <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-[84px] py-8 md:py-[64px] flex flex-col items-center animate-[fadeIn_0.2s_ease-out]">
            <h1 className="style-h1 text-secondary text-center mb-8 md:mb-[64px]">Vyberte si šablonu</h1>
            
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEMPLATE_OPTIONS.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                
                return (
                  <div 
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`flex flex-col p-6 rounded-[8px] border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-black300/50 bg-black400' 
                        : 'border-black300/30 bg-transparent hover:border-black300/60'
                    }`}
                  >
                    {/* Checkbox a Nadpis */}
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected ? 'bg-primary border-primary' : 'border-secondary bg-transparent'
                      }`}>
                        {isSelected && (
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                            <path d="M1 5L4.5 8.5L11 1.5" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <h4 className="style-h4 text-secondary">{tpl.name}</h4>
                    </div>
                    
                    <p className="style-body text-black300 mb-6">{tpl.desc}</p>
                    
                    {/* Hlavní náhled šablony */}
                    <div 
                      className="w-full aspect-[4/3] bg-black200 rounded-[4px] overflow-hidden mb-6 relative cursor-zoom-in group select-none"
                      onClick={(e) => { e.stopPropagation(); setLightboxImg(tpl.img); }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image 
                        src={tpl.img} 
                        alt={tpl.name} 
                        fill 
                        className="object-contain pointer-events-none group-hover:scale-105 transition-transform duration-300" 
                        onDragStart={(e) => e.preventDefault()}
                      />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                    
                    {/* Známky v archu */}
                    <div className="mt-auto border-t border-black300/10 pt-4">
                      <h3 className="style-body text-secondary mb-3">Známky v archu</h3>
                      <div className="flex gap-3">
                        {tpl.stamps.map((stampImg, idx) => (
                          <div 
                            key={idx}
                            className="w-[60px] h-[48px] bg-black200 rounded-[2px] overflow-hidden relative border border-black300/20 cursor-zoom-in group select-none"
                            onClick={(e) => { e.stopPropagation(); setLightboxImg(stampImg); }}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            <Image 
                              src={stampImg} 
                              alt={`Známka ${idx + 1}`} 
                              fill 
                              className="object-cover pointer-events-none group-hover:scale-110 transition-transform" 
                              onDragStart={(e) => e.preventDefault()}
                            />
                            <div className="absolute inset-0 z-10 bg-transparent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <div className="absolute inset-0 z-[105] bg-transparent" />
            </div>
          </div>
        )}
      </main>

      {/* --- FIXNÍ PATIČKA PRO KROK 1 (Sjednocený design s editorem) (NEDOTČENO) --- */}
      {currentStep === 1 && (
        <footer className="w-full shrink-0 bg-black500 border-t border-black300/30 h-[80px] md:h-[116px] flex items-center justify-center z-[100] pb-safe">
          <div className="w-full md:max-w-[1440px] mx-auto px-[24px] md:px-[84px] flex justify-end items-center">
            <Button 
              onClick={() => handleNextStep()} 
              disabled={!selectedTemplate} 
              arrow="right"
              className="w-full md:w-auto h-[48px]"
            >
              Další krok
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}