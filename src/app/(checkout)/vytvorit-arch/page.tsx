'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import Stepper from '@/components/checkout/Stepper';
import { TEMPLATES } from '@/lib/editorConfig';

const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-black text-secondary style-body-bold">Načítám studio...</div>
});

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [createdStampId, setCreatedStampId] = useState<string | null>(null);
  
  // LIGHTBOX
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].id);

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
            weight_grams: productInfo.weight_grams,
            item_type: 'custom',
          });
        }
      } catch (err) {
        console.error("Chyba při přidávání archu do košíku:", err);
      }
    }
    
    setCurrentStep(3);
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-black overflow-hidden text-secondary select-none font-sans antialiased">
      
      {/* --- HLAVIČKA ZE STRÁNKY KOŠÍKU SE STEPPEREM (NEDOTČENO) --- */}
      {!isMobileLandscape && (
        <div className="sticky top-0 z-40 w-full"><CheckoutHeader right={<Stepper currentStep={currentStep} />} /></div>
      )}
      
      <main className={`flex-1 min-h-0 w-full flex flex-col relative overflow-y-auto ${isMobileLandscape ? 'pb-0' : 'pb-[80px] lg:pb-[116px]'}`}>
        
        {/* === KROK 1: VÝBĚR ŠABLONY === */}
        {currentStep === 1 && (
          <div className="layout-container py-8 md:py-[64px] flex flex-col items-center animate-fadeIn">
            <h1 className="style-h1 text-secondary text-center mb-2">Vyberte si šablonu</h1>
            <p className="style-body text-black300 text-center mb-8 md:mb-[48px]">Zvolte rozvržení pro Váš kreativní arch s vlastními fotografiemi.</p>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[860px]">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                const photoCount = tpl.slots.filter((s) => s.type === 'photo').length;
                const previewsToShow = tpl.stampPreviews.slice(0, 2);
                const overflow = tpl.stampCount - previewsToShow.length;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`group flex flex-col rounded-[12px] border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:z-10 select-none
                      ${isSelected
                        ? 'border-primary bg-black500 shadow-lg shadow-primary/20'
                        : 'border-black300/30 bg-black500 hover:border-black300/60 hover:shadow-xl'
                      }`}
                  >
                    {/* Náhled šablony */}
                    <div
                      className="relative w-full aspect-[16/10] bg-black400 overflow-hidden cursor-zoom-in"
                      onClick={(e) => { e.stopPropagation(); setLightboxImg(tpl.backgroundImage); }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image
                        src={tpl.backgroundImage}
                        alt={tpl.name}
                        fill
                        className="object-contain pointer-events-none group-hover:scale-[1.03] transition-transform duration-500"
                        onDragStart={(e) => e.preventDefault()}
                      />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                      {isSelected && (
                        <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Obsah */}
                    <div className="flex flex-col gap-3 p-5">
                      <div>
                        <h3 className="style-h4 text-secondary mb-1">{tpl.name}</h3>
                        <p className="style-body text-black300 leading-snug">{tpl.description}</p>
                      </div>

                      {/* Pill */}
                      <div className="inline-flex items-center gap-2 self-start bg-black400 rounded-full px-3 py-[6px]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black200 shrink-0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="style-body text-black200 whitespace-nowrap text-[13px]">
                          {photoCount} {photoCount < 5 ? 'fotografie' : 'fotografií'} • {tpl.stampCount} {tpl.stampCount === 1 ? 'známka' : tpl.stampCount < 5 ? 'známky' : 'známek'}
                        </span>
                      </div>

                      {/* Známky v archu */}
                      <div className="border-t border-black300/20 pt-3">
                        <div className="flex justify-between items-center mb-3">
                          <span className="style-body text-secondary/70 text-[13px]">Známky v archu</span>
                          {tpl.shopUrl && (
                            <a
                              href={tpl.shopUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="style-body text-primary hover:text-primary-hover transition-colors flex items-center gap-1 text-[13px]"
                            >
                              Zobrazit v e-shopu
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {previewsToShow.map((src, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-[4px] overflow-hidden bg-black400 border border-black300/20 shrink-0 relative cursor-zoom-in"
                              onClick={(e) => { e.stopPropagation(); setLightboxImg(src); }}
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <Image src={src} alt="" fill className="object-cover pointer-events-none" onDragStart={(e) => e.preventDefault()} />
                              <div className="absolute inset-0 z-10 bg-transparent" />
                            </div>
                          ))}
                          {previewsToShow.length === 0 && (
                            <>
                              <div className="w-10 h-10 rounded-[4px] bg-black400 border border-black300/20 shrink-0" />
                              <div className="w-10 h-10 rounded-[4px] bg-black400 border border-black300/20 shrink-0" />
                            </>
                          )}
                          {overflow > 0 && (
                            <div className="w-10 h-10 rounded-[4px] bg-black300/20 border border-black300/20 flex items-center justify-center shrink-0">
                              <span className="text-black200 font-semibold text-[13px]">+{overflow}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tlačítko */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTemplate(tpl.id); }}
                        className={`w-full mt-1 inline-flex items-center justify-center gap-2 font-medium tracking-[-0.02em] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95 text-[16px] p-[14px]
                          ${isSelected
                            ? 'bg-primary text-black hover:bg-primary-hover'
                            : 'bg-transparent border border-primary text-primary hover:bg-white/5 hover:border-primary-hover hover:text-primary-hover'
                          }`}
                      >
                        {isSelected && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {isSelected ? 'Vybráno' : 'Vybrat'}
                      </button>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out select-none"
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

      {/* FIXNÍ PATIČKA — KROK 1 */}
      {currentStep === 1 && (
        <footer className="w-full shrink-0 bg-black500 border-t border-black300/30 h-[80px] md:h-[116px] flex items-center justify-center z-[100] pb-safe">
          <div className="layout-container flex justify-between items-center">
            <Button onClick={() => window.history.back()} variant="outlined" arrow="left">Zpět</Button>
            <Button onClick={() => handleNextStep()} arrow="right">Pokračovat</Button>
          </div>
        </footer>
      )}
    </div>
  );
}