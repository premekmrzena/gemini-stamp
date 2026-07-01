'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import Stepper from '@/components/checkout/Stepper';
import Footer from '@/components/Footer';
import { TEMPLATES } from '@/lib/editorConfig';

const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-black text-secondary style-body-bold">Načítám studio...</div>
});

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { addToCart } = useCart();

  // Příchod z karty/detailu produktu ("Začít tvořit") – rovnou do editoru dané šablony
  useEffect(() => {
    const productId = new URLSearchParams(window.location.search).get('productId');
    if (!productId) return;
    const template = TEMPLATES.find((t) => t.productId === productId);
    if (template) {
      setSelectedTemplateId(template.id);
      setCurrentStep(2);
    }
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentStep(prev => prev + 1);
  };

  // LOGIKA INTEGRACE DO KOŠÍKU
  const handleEditorComplete = async (stampId?: string) => {
    if (stampId) {
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
      <div className="sticky top-0 z-40 w-full"><CheckoutHeader
        center={currentStep === 2 ? <h3 className="style-h4 text-secondary">{TEMPLATES.find(t => t.id === selectedTemplateId)?.name}</h3> : undefined}
        right={<Stepper currentStep={currentStep} />}
      /></div>
      
      <main className={`flex-1 min-h-0 w-full flex flex-col relative overflow-y-auto ${currentStep !== 1 ? 'pb-[64px]' : ''}`}>
        
        {/* === KROK 1: VÝBĚR ŠABLONY === */}
        {currentStep === 1 && (
          <>
          <div className="layout-container py-8 md:py-[64px] flex flex-col items-center animate-fadeIn">
            <h1 className="style-h1 text-secondary text-center mb-2">Vyberte si šablonu</h1>
            <p className="style-body text-secondary text-center mb-3">Zvolte rozvržení pro Váš kreativní arch s vlastními fotografiemi.</p>
            <Link href="/co-je-kreativni-arch" className="inline-flex items-center gap-[6px] style-body text-black200 hover:text-primary transition-colors mb-8 md:mb-[48px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" />
                <line x1="12" y1="12" x2="12" y2="16" />
              </svg>
              Co je kreativní arch?
            </Link>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-[24px]">
              {TEMPLATES.map((tpl) => {
                const photoCount = tpl.slots.filter((s) => s.type === 'photo').length;

                return (
                  <div
                    key={tpl.id}
                    className="group relative border border-black300/30 bg-[#0F172A] rounded-[4px] p-[24px] flex flex-col hover:bg-black500 hover:border-black300/60 hover:shadow-xl hover:scale-[1.02] hover:z-10 transition-all duration-300 select-none"
                  >
                    {/* Náhled šablony */}
                    <div
                      className="relative w-full aspect-[4130/2550] bg-black400 rounded-[4px] overflow-hidden cursor-zoom-in mb-[20px] flex-shrink-0"
                      onClick={() => setLightboxImg(tpl.stampPreviews[0] ?? tpl.backgroundImage)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image
                        src={tpl.stampPreviews[0] ?? tpl.backgroundImage}
                        alt={tpl.name}
                        fill
                        className="object-contain pointer-events-none group-hover:scale-[1.03] transition-transform duration-500"
                        onDragStart={(e) => e.preventDefault()}
                      />
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>

                    {/* Obsah */}
                    <div className="flex flex-col flex-grow items-center text-center">
                      <h3 className="style-h4 text-secondary mb-[8px]">{tpl.name}</h3>

                      {/* Pill */}
                      <div className="inline-flex items-center gap-[6px] bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 mb-[12px]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black200 shrink-0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="style-label text-black200 whitespace-nowrap">
                          {photoCount} {photoCount < 5 ? 'fotografie' : 'fotografií'} • {tpl.stampCount} {tpl.stampCount === 1 ? 'známka' : tpl.stampCount < 5 ? 'známky' : 'známek'}
                        </span>
                      </div>

                      <p className="style-body text-secondary/70 mb-[24px]">{tpl.description}</p>

                      <div className="mt-auto flex flex-col items-center gap-[12px]">
                        {tpl.shopUrl && (
                          <Link
                            href={tpl.shopUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="style-body text-black200 underline hover:text-primary transition-colors"
                          >
                            Detail šablony
                          </Link>
                        )}

                        {/* CTA */}
                        <Button onClick={() => handleSelectTemplate(tpl.id)}>
                          Vybrat šablonu
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Footer />
          </>
        )}

        {/* === KROK 2: EDITOR NÁVRHU === */}
        {currentStep === 2 && (
          <StampEditor onComplete={handleEditorComplete} templateId={selectedTemplateId} />
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
            
            <div className="relative w-full max-w-[1080px] max-h-[90vh] aspect-video md:aspect-auto md:h-full">
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

    </div>
  );
}