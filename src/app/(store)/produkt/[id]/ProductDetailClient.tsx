'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';

export default function ProductDetailClient({ product, relatedProducts }: any) {
  // Výchozí stavy
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isParamsOpen, setIsParamsOpen] = useState(true); 
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  const allImages = [product.image_url, ...(product.gallery_images || [])];
  const [mainImage, setMainImage] = useState(allImages[0]);
  
  const { addToCart } = useCart();

  // Logika pro zavření akordeonů na mobilu/tabletu po načtení
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsParamsOpen(false);
      setIsDescOpen(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const productParameters = [
    { label: 'Kategorie', value: product.category },
    { label: 'Katalogové číslo', value: product.catalog_number },
    { label: 'Typ známky', value: product.stamp_type },
    { label: 'Datum vydání', value: formatDate(product.release_date) },
    { label: 'Tiskové listy', value: product.print_sheets },
    { label: 'Rozměr', value: product.dimensions_mm ? `${product.dimensions_mm} mm` : null },
    { label: 'Výtvarný návrh', value: product.designer },
    { label: 'Autor rytiny', value: product.engraver },
    { label: 'Hmotnost', value: product.weight_grams ? `${product.weight_grams} g` : null },
  ].filter(param => param.value);

  return (
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px] pt-[32px] md:pt-[54px] lg:pt-[64px] pb-[64px] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        
        <h1 className="style-h2 mb-6 text-center lg:hidden w-full">
          {product.name}
        </h1>

        <div className="flex flex-col lg:flex-row gap-[32px] md:gap-[48px] lg:gap-[64px] mb-[64px]">
          
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start gap-4">
            <div 
              className="relative w-full h-[262px] md:h-[423px] flex items-start justify-center cursor-zoom-in overflow-hidden"
              onClick={() => setLightboxImg(mainImage)}
            >
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                priority
                className="object-contain object-top" 
              />
            </div>
            
            <div className="flex justify-center lg:justify-start gap-4 overflow-x-auto pb-2 w-full">
              {allImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] shrink-0 border rounded-[8px] overflow-hidden cursor-pointer transition-colors ${mainImage === img ? 'border-[#FF6B35]' : 'border-[#8B95AC] hover:border-[#D1D6DF]'}`}
                  onClick={() => setMainImage(img)}
                >
                  <Image src={img} alt={`Náhled ${idx + 1}`} fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left gap-0">
            
            <h1 className="style-h2 mb-4 hidden lg:block">
              {product.name}
            </h1>
            
            <p className="style-perex text-white/80 mb-6">{product.short_description}</p>

            <div className="w-full flex flex-col items-center lg:items-start mb-6 pt-2">
              <div className="mb-2">
                <span className="style-product-price text-[#059669]">
                  Cena {product.price} Kč
                </span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 pointer-events-none mb-6 w-full">
                <span className="style-body text-[#FDFBF7]">Skladem</span>
                <span className="style-product-tag bg-[#2B3755] text-white px-2 py-1 rounded-full">
                  {product.stock_quantity > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                </span>
              </div>

              <Button 
                className="w-full md:w-[320px]"
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image_url: mainImage,
                    weight_grams: product.weight_grams // <--- TENTO ŘÁDEK PŘIDEJ (nezapomeň na čárku nad ním)
                  });
                }}
              >
                Do košíku
              </Button>
            </div>

            {/* --- 1. ACCORDION: PARAMETRY PRODUKTU --- */}
            {productParameters.length > 0 && (
              <div className="w-full border-t border-[#8B95AC]/30 pt-6 mt-2 text-left">
                <button 
                  className="w-full flex items-center justify-between cursor-pointer text-left group"
                  onClick={() => setIsParamsOpen(!isParamsOpen)}
                >
                  <h2 className="style-h4 group-hover:text-[#FF7F51] transition-colors">Parametry</h2>
                  <svg 
                    className={`w-6 h-6 transition-transform duration-300 ${isParamsOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`${isParamsOpen ? 'block' : 'hidden'} mt-4`}>
                  <div className="flex flex-col gap-2">
                    {productParameters.map((param, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#8B95AC]/10 pb-2">
                        <span className="style-body text-[#8B95AC]">{param.label}</span>
                        <span className="style-body text-[#FDFBF7] text-right font-medium">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- 2. ACCORDION: DETAILNÍ POPIS --- */}
            {product.detailed_description && (
              <div className="w-full border-t border-[#8B95AC]/30 pt-6 mt-6 text-left">
                <button 
                  className="w-full flex items-center justify-between cursor-pointer text-left group"
                  onClick={() => setIsDescOpen(!isDescOpen)}
                >
                  <h2 className="style-h4 group-hover:text-[#FF7F51] transition-colors">Detailní popis známky</h2>
                  <svg 
                    className={`w-6 h-6 transition-transform duration-300 ${isDescOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`${isDescOpen ? 'block' : 'hidden'} mt-4`}>
                  <p className="style-body text-white/70 whitespace-pre-line">
                    {product.detailed_description}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SOUVISEJÍCÍ PRODUKTY */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="border-t border-[#8B95AC]/30 pt-16">
            <h2 className="style-h2 text-center mb-12">Mohlo by vás také zajímat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
              {relatedProducts.map((relProd: any) => (
                <div key={relProd.id} className="group relative bg-[#0F172A] border border-[#8B95AC] rounded-[16px] p-[24px] flex flex-col hover:bg-[#2B3755] transition-all duration-300">
                  <Link href={`/produkt/${relProd.id}`} className="absolute inset-0 z-0 rounded-[16px]" aria-label={`Detail produktu ${relProd.name}`}></Link>
                  <div className="relative w-full h-[120px] bg-transparent mb-6 flex-shrink-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
                    <Image src={relProd.image_url} alt={relProd.name} fill className="object-contain" />
                  </div>
                  <div className="flex flex-col items-center text-center relative z-10 pointer-events-none">
                    <h3 className="style-h4 mb-4 line-clamp-2 h-[48px] flex items-center">{relProd.name}</h3>
                    <span className="style-product-price text-[#059669]">Cena {relProd.price} Kč</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX PRO DETAILNÍ NÁHLED OBRÁZKU */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-[#FF6B35] transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="relative w-full max-w-[90vw] max-h-[90vh] aspect-square md:aspect-auto md:h-full">
            <Image 
              src={lightboxImg} 
              alt="Detailní náhled" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}
    </section>
  );
}