'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import Stepper from '@/components/checkout/Stepper';
import Footer from '@/components/Footer';
import TrustBadges from '@/components/TrustBadges';
import { TEMPLATES, Template } from '@/lib/editorConfig';
import { getSalePrice, getEffectivePrice } from '@/lib/pricing';

type TemplateInfo = { name: string; short_description: string | null; price: number; sale_price: number | null; sold_count: number; is_active: boolean };

// Název a popis se editují v adminu u produktu a mají přednost před texty natvrdo v editorConfig.ts
// (ty slouží jen jako záskok, než se data ze Supabase načtou).
function nameOf(tpl: Template, infos: Record<string, TemplateInfo>): string {
  return infos[tpl.productId]?.name ?? tpl.name;
}

function descriptionOf(tpl: Template, infos: Record<string, TemplateInfo>): string {
  return infos[tpl.productId]?.short_description || tpl.description;
}

// Popisky (label) žijí v messages/*.json pod checkout.createArch.sortOptions (klíč = stejný jako tady) - tady zůstává jen řadicí logika.
const SORT_OPTIONS = {
  doporucene: { labelKey: 'recommended', compare: null },
  price_asc: { labelKey: 'priceAsc', compare: (a: Template, b: Template, infos: Record<string, TemplateInfo>) => priceOf(a, infos) - priceOf(b, infos) },
  price_desc: { labelKey: 'priceDesc', compare: (a: Template, b: Template, infos: Record<string, TemplateInfo>) => priceOf(b, infos) - priceOf(a, infos) },
  name_asc: { labelKey: 'nameAsc', compare: (a: Template, b: Template, infos: Record<string, TemplateInfo>) => nameOf(a, infos).localeCompare(nameOf(b, infos), 'cs') },
  bestseller: { labelKey: 'bestseller', compare: (a: Template, b: Template, infos: Record<string, TemplateInfo>) => (infos[b.productId]?.sold_count ?? 0) - (infos[a.productId]?.sold_count ?? 0) },
} as const satisfies Record<string, { labelKey: string; compare: ((a: Template, b: Template, infos: Record<string, TemplateInfo>) => number) | null }>;

type SortKey = keyof typeof SORT_OPTIONS;

function priceOf(tpl: Template, infos: Record<string, TemplateInfo>): number {
  const info = infos[tpl.productId];
  return info ? getEffectivePrice(info.price, info.sale_price) : Infinity;
}

function LoadingStudio() {
  const t = useTranslations('checkout.createArch');
  return <div className="flex-1 flex items-center justify-center bg-black text-secondary style-body-bold">{t('loadingStudio')}</div>;
}

const StampEditor = dynamic(() => import('@/components/Editor/StampEditor'), {
  ssr: false,
  loading: () => <LoadingStudio />
});

export default function EditorPage() {
  const t = useTranslations('checkout.createArch');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);

  const [productInfo, setProductInfo] = useState<Record<string, TemplateInfo>>({});
  const [productInfoLoaded, setProductInfoLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('doporucene');

  const { addToCart } = useCart();

  // Příchod z karty/detailu produktu ("Začít tvořit") – rovnou do editoru dané šablony
  useEffect(() => {
    // window.location.search je dostupné jen na klientovi (nejde přesunout do
    // render/lazy initializeru, to by při SSR spadlo).
    const productId = new URLSearchParams(window.location.search).get('productId');
    if (!productId) return;
    const template = TEMPLATES.find((tpl) => tpl.productId === productId);
    if (template) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTemplateId(template.id);
      setCurrentStep(2);
    }
  }, []);

  // Název, popis a cena šablon dotažené ze Supabase (stejný zdroj jako kategorie/detail produktu) –
  // mají přednost před texty natvrdo v editorConfig.ts, aby se úpravy v adminu propsaly i sem.
  useEffect(() => {
    async function fetchProductInfo() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, short_description, price, sale_price, sold_count, is_active')
        .in('id', TEMPLATES.map((tpl) => tpl.productId));

      if (error || !data) { setProductInfoLoaded(true); return; }

      const byId: Record<string, TemplateInfo> = {};
      for (const row of data) {
        byId[row.id] = { name: row.name, short_description: row.short_description, price: row.price, sale_price: row.sale_price, sold_count: row.sold_count, is_active: row.is_active };
      }
      setProductInfo(byId);
      setProductInfoLoaded(true);
    }
    fetchProductInfo();
  }, []);

  // Neaktivní produkt (vypnuto v adminu) se ve výběru šablon skrývá, stejně jako všude jinde v e-shopu.
  // Dokud se stav is_active nedotáhne ze Supabase, šablona se v gridu vůbec nevykresluje (viz productInfoLoaded
  // níže) – jinak by neaktivní šablona krátce problikla a pak zase zmizela.
  const visibleTemplates = useMemo(
    () => TEMPLATES.filter((tpl) => productInfo[tpl.productId]?.is_active !== false),
    [productInfo]
  );

  const sortedTemplates = useMemo(() => {
    const compare = SORT_OPTIONS[sortKey].compare;
    return compare ? [...visibleTemplates].sort((a, b) => compare(a, b, productInfo)) : visibleTemplates;
  }, [sortKey, productInfo, visibleTemplates]);

  const selectedTemplate = TEMPLATES.find((tpl) => tpl.id === selectedTemplateId);

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
            name: `${t('customDesignPrefix')}${productInfo.name}`,
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
        center={currentStep === 2 && selectedTemplate ? <h3 className="style-h4 text-secondary">{nameOf(selectedTemplate, productInfo)}</h3> : undefined}
        right={<Stepper currentStep={currentStep} />}
      /></div>
      
      <main className={`flex-1 min-h-0 w-full flex flex-col relative overflow-y-auto ${currentStep !== 1 ? 'pb-[64px]' : ''}`}>
        
        {/* === KROK 1: VÝBĚR ŠABLONY === */}
        {currentStep === 1 && (
          <>
          <section className="py-8 md:py-12">
            <div className="layout-container flex flex-col items-center text-center animate-fadeIn">
              <h1 className="style-h1 text-secondary mb-6 lowercase first-letter:uppercase leading-tight">{t('chooseTemplate')}</h1>
              <p className="style-body text-secondary/70 max-w-[43rem]">{t('introText')}</p>
              <Link href="/co-je-kreativni-arch" className="inline-flex items-center gap-[6px] style-body text-primary hover:text-primary-hover transition-colors mt-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                </svg>
                {t('whatIsLink')}
              </Link>
            </div>
          </section>

          <div className="layout-container pb-8 md:pb-[64px]">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-3 mb-4">
              <TrustBadges hideReviewBadgeOnMobile />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="hidden md:block bg-black400 border border-black300/30 rounded-[8px] px-3 h-[40px] style-body text-secondary outline-none focus:border-primary transition-all cursor-pointer"
              >
                {Object.entries(SORT_OPTIONS).map(([value, { labelKey }]) => (
                  <option key={value} value={value}>{t(`sortOptions.${labelKey}`)}</option>
                ))}
              </select>
            </div>
            {!productInfoLoaded ? (
              <div className="w-full py-20 flex items-center justify-center style-body text-secondary/70">{t('loadingTemplates')}</div>
            ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-[24px]">
              {sortedTemplates.map((tpl) => {
                // Slot typu "text" vždy nese i fotku (zákazník do něj vkládá foto i vlastní text zároveň) – počítá se tedy taky.
                const photoCount = tpl.slots.length;
                const priceInfo = productInfo[tpl.productId];
                const salePrice = priceInfo ? getSalePrice(priceInfo.price, priceInfo.sale_price) : null;
                const name = nameOf(tpl, productInfo);
                const description = descriptionOf(tpl, productInfo);

                return (
                  <div
                    key={tpl.id}
                    className="group relative border border-black300/30 bg-[#0F172A] rounded-[4px] p-[24px] flex flex-col active:bg-black500 active:border-black300/60 active:scale-[0.98] active:z-10 md:hover:bg-black500 md:hover:border-black300/60 md:hover:shadow-xl md:hover:scale-[1.02] md:hover:z-10 transition-all duration-300 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {/* Celá karta směřuje na detail produktu */}
                    <Link
                      href={`/produkt/${tpl.productId}`}
                      className="absolute inset-0 z-20 rounded-[4px] cursor-pointer"
                      aria-label={t('templateDetailAria', { name })}
                    />

                    {/* Náhled šablony */}
                    <div className="relative w-full aspect-[4130/2550] bg-black400 rounded-[4px] overflow-hidden mb-[20px] flex-shrink-0 pointer-events-none">
                      <Image
                        src={tpl.stampPreviews[0] ?? tpl.backgroundImage}
                        alt={name}
                        fill
                        className="object-contain group-active:scale-[1.03] md:group-hover:scale-[1.03] transition-transform duration-500"
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </div>

                    {/* Obsah */}
                    <div className="flex flex-col flex-grow items-center text-center pointer-events-none">
                      <h3 className="style-h4 text-secondary mb-[8px] line-clamp-2 min-h-[2.8em]">{name}</h3>

                      {/* Pill */}
                      <div className="inline-flex items-center gap-[6px] bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 mb-[12px]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black200 shrink-0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="style-label text-black200 whitespace-nowrap">
                          {t('photoCount', { count: photoCount })} • {t('stampCount', { count: tpl.stampCount })}
                        </span>
                      </div>

                      <p className="style-body text-secondary/70 mb-[16px] line-clamp-4 min-h-[5.6em]">{description}</p>

                      {/* Vizuální nápověda, že celá karta vede na detail šablony (klik zachytí obalující Link výše) */}
                      <div className="inline-flex items-center gap-[6px] style-label text-secondary/70 mb-[16px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" />
                          <line x1="12" y1="12" x2="12" y2="16" />
                        </svg>
                        {t('templateInfo')}
                      </div>

                      <div className="mt-auto flex flex-col items-center gap-[12px] relative z-30 pointer-events-auto">
                        <div>
                          {priceInfo ? (
                            salePrice ? (
                              <span className="style-product-price flex items-center gap-2">
                                <span className="text-black300 line-through">{priceInfo.price} Kč</span>
                                <span className="text-success">{salePrice} Kč</span>
                              </span>
                            ) : (
                              <span className="style-product-price text-success">
                                {t('priceLabel', { price: priceInfo.price })}
                              </span>
                            )
                          ) : (
                            <span className="style-product-price text-transparent select-none" aria-hidden="true">
                              {t('priceLabel', { price: '000' })}
                            </span>
                          )}
                        </div>
                        {/* CTA */}
                        <Button onClick={() => handleSelectTemplate(tpl.id)}>
                          {t('selectTemplate')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
          <Footer />
          </>
        )}

        {/* === KROK 2: EDITOR NÁVRHU === */}
        {currentStep === 2 && (
          <StampEditor
            onComplete={handleEditorComplete}
            templateId={selectedTemplateId}
            templateName={selectedTemplate ? nameOf(selectedTemplate, productInfo) : undefined}
          />
        )}

        {/* === KROK 3: ÚSPĚCH A PŘESUN DO KOŠÍKU === */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 animate-[fadeIn_0.2s_ease-out] text-center">
            <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-secondary text-5xl shadow-xl shadow-success/20 font-light">✓</div>
            <div className="space-y-4">
              <h1 className="style-h1 text-secondary">{t('successTitle')}</h1>
              <p className="style-body text-black300 max-w-lg mx-auto">
                {t('successText')}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-4 w-full md:w-auto">
              <Button onClick={() => window.location.reload()} variant="outlined" className="w-full md:w-auto">
                {t('createAnother')}
              </Button>
              <Button onClick={() => window.location.href = '/kosik'} className="w-full md:w-auto">
                {t('goToCart')}
              </Button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}