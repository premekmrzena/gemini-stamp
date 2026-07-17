'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Paintbrush } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getSalePrice } from '@/lib/pricing';
import { sanitizeDescriptionHtml } from '@/lib/sanitize';

export default function ProductDetailClient({ product, relatedProducts }: any) {
  const salePrice = getSalePrice(product.price, product.sale_price);
  const isCreativeArch = product.category === 'kreativni-archy';
  const router = useRouter();
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isParamsOpen, setIsParamsOpen] = useState(true); 
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  const allImages = [product.image_url, ...(product.gallery_images || [])];
  const [mainImage, setMainImage] = useState(allImages[0]);
  
  const { addToCart } = useCart();

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
    { label: 'Datum vydání', value: formatDate(product.release_date) },
    { label: 'Rozměr', value: product.dimensions_mm ? `${product.dimensions_mm} mm` : null },
    { label: 'Výtvarný návrh', value: product.designer },
    { label: 'Autor rytiny', value: product.engraver },
    { label: 'Hmotnost', value: product.weight_grams ? `${product.weight_grams} g` : null },
  ]
    .filter(param => param.value)
    .filter(param => !isCreativeArch || ['Kategorie', 'Katalogové číslo', 'Rozměr', 'Hmotnost'].includes(param.label));

  return (
    <section className="bg-black text-secondary w-full pt-[32px] md:pt-[54px] lg:pt-[64px] pb-[64px] min-h-screen">
      <div className="layout-container">
        
        <h1 className="style-h2 mb-6 text-center lg:hidden w-full select-none">
          {product.name}
        </h1>

        <div className="flex flex-col lg:flex-row gap-[32px] md:gap-[29px] lg:gap-[42px] mb-[64px]">
          
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start gap-4">
            {/* OCHRANA HLAVNÍHO OBRÁZKU */}
            <div 
              className="relative w-full h-[262px] md:h-[423px] flex items-start justify-center cursor-zoom-in overflow-hidden select-none"
              onClick={() => setLightboxImg(mainImage)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                priority
                className="object-contain object-top pointer-events-none" 
                onDragStart={(e) => e.preventDefault()}
              />
              {/* ŠTÍT PROTI STAŽENÍ */}
              <div className="absolute inset-0 z-10 bg-transparent" />
            </div>
            
            {/* OCHRANA NÁHLEDŮ V GALERII */}
            <div className="flex justify-start gap-4 overflow-x-auto pb-2 w-full select-none">
              {allImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] shrink-0 border rounded-[8px] overflow-hidden cursor-pointer transition-colors ${mainImage === img ? 'border-primary' : 'border-black300 hover:border-black200'}`}
                  onClick={() => setMainImage(img)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image 
                    src={img} 
                    alt={`Náhled ${idx + 1}`} 
                    fill 
                    className="object-contain p-2 pointer-events-none" 
                    onDragStart={(e) => e.preventDefault()}
                  />
                  {/* ŠTÍT PRO NÁHLED */}
                  <div className="absolute inset-0 z-10 bg-transparent" />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left gap-0">
            <h1 className="style-h2 mb-4 hidden lg:block select-none">
              {product.name}
            </h1>
            
            <p className="style-perex text-white/80 mb-4 select-none">{product.short_description}</p>

            {/* TAGY */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-1 mb-6 select-none pointer-events-none">
              {!!product.tag_top && (
                <span className="style-product-tag bg-tag-top text-black px-3 py-1 rounded-full shadow-sm">
                  TOP {product.tag_top}
                </span>
              )}
              {product.tag_new && (
                <span className="style-product-tag bg-tag-novinka text-black px-3 py-1 rounded-full shadow-sm">
                  novinka
                </span>
              )}
              {product.tag_last_pieces && (
                <span className="style-product-tag bg-tag-posledni-kusy text-black px-3 py-1 rounded-full shadow-sm">
                  poslední kusy
                </span>
              )}
              {!product.tag_top && !product.tag_new && !product.tag_last_pieces && (
                <span className="style-product-tag bg-black200 text-black px-3 py-1 rounded-full shadow-sm">
                  jen u nás
                </span>
              )}
            </div>

            <div className="w-full flex flex-col items-center lg:items-start mb-6 pt-2">
              <div className="mb-6 select-none">
                {salePrice ? (
                  <span className="style-product-price flex items-center gap-2">
                    <span className="text-black300 line-through">{product.price} Kč</span>
                    <span className="text-success">{salePrice} Kč</span>
                  </span>
                ) : (
                  <span className="style-product-price text-success">
                    Cena {product.price} Kč
                  </span>
                )}
              </div>

              {isCreativeArch ? (
                <Button
                  className="w-full md:w-[320px] relative z-20"
                  onClick={() => router.push(`/vytvorit-arch?productId=${product.id}`)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Paintbrush size={20} />
                    Začít tvořit
                  </span>
                </Button>
              ) : (
                <Button
                  className="w-full md:w-[320px] relative z-20"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: salePrice ?? product.price,
                      quantity: 1,
                      image_url: mainImage,
                      weight_grams: product.weight_grams,
                      item_type: 'product',
                    });
                  }}
                >
                  Do košíku
                </Button>
              )}
            </div>

            {/* PARAMETRY */}
            {productParameters.length > 0 && (
              <div className="w-full border-t border-black300/30 pt-6 mt-2 text-left">
                <button 
                  className="w-full flex items-center justify-between cursor-pointer text-left group"
                  onClick={() => setIsParamsOpen(!isParamsOpen)}
                >
                  <h2 className="style-h4 group-hover:text-primary-hover transition-colors">Parametry</h2>
                  <svg 
                    className={`w-6 h-6 transition-transform duration-300 ${isParamsOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`${isParamsOpen ? 'block' : 'hidden'} mt-4 select-none`}>
                  <div className="flex flex-col gap-2">
                    {productParameters.map((param, idx) => (
                      <div key={idx} className="flex justify-between border-b border-black300/10 pb-2">
                        <span className="style-body text-[#8B95AC]">{param.label}</span>
                        <span className="style-body text-secondary text-right font-medium">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* POPIS */}
            {product.detailed_description && (
              <div className="w-full border-t border-black300/30 pt-6 mt-6 text-left">
                <button 
                  className="w-full flex items-center justify-between cursor-pointer text-left group"
                  onClick={() => setIsDescOpen(!isDescOpen)}
                >
                  <h2 className="style-h4 group-hover:text-primary-hover transition-colors">Detailní popis</h2>
                  <svg 
                    className={`w-6 h-6 transition-transform duration-300 ${isDescOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div
                  className={`${isDescOpen ? 'block' : 'hidden'} mt-4 select-none rich-description style-body text-white/70 whitespace-pre-line`}
                  dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(product.detailed_description) }}
                />
              </div>
            )}

          </div>
        </div>

        {/* SOUVISEJÍCÍ PRODUKTY S OCHRANOU */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="border-t border-black300/30 pt-16">
            <h2 className="style-h2 text-center mb-12 select-none">Mohlo by vás také zajímat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
              {relatedProducts.map((relProd: any) => {
                const relSalePrice = getSalePrice(relProd.price, relProd.sale_price);
                return (
                <div
                  key={relProd.id}
                  className="group relative bg-[#0F172A] border border-black300/30 rounded p-[24px] flex flex-col active:bg-black500 active:scale-[0.98] active:z-10 md:hover:bg-black500 md:hover:scale-[1.02] md:hover:z-10 transition-all duration-300"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Link href={`/produkt/${relProd.id}`} className="absolute inset-0 z-20 rounded" aria-label={`Detail produktu ${relProd.name}`}></Link>
                  <div
                    className="relative w-full h-[120px] bg-transparent mb-6 flex-shrink-0 z-10 overflow-hidden flex items-center justify-center select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <Image
                        src={relProd.image_url}
                        alt={relProd.name}
                        fill
                        className="object-contain pointer-events-none"
                        onDragStart={(e) => e.preventDefault()}
                    />
                    {/* ŠTÍT PRO SOUVISEJÍCÍ */}
                    <div className="absolute inset-0 z-10 bg-transparent" />
                  </div>
                  <div className="flex flex-col items-center text-center relative z-10 pointer-events-none select-none">
                    <h3 className="style-h4 mb-4 line-clamp-2 h-[48px] flex items-center">{relProd.name}</h3>
                    {relSalePrice ? (
                      <span className="style-product-price flex items-center gap-2">
                        <span className="text-black300 line-through">{relProd.price} Kč</span>
                        <span className="text-success">{relSalePrice} Kč</span>
                      </span>
                    ) : (
                      <span className="style-product-price text-success">Cena {relProd.price} Kč</span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* OCHRANA V LIGHTBOXU */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out select-none"
          onClick={() => setLightboxImg(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-[#FF6B35] transition-colors z-[60]"
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
              className="object-contain pointer-events-none" 
              onDragStart={(e) => e.preventDefault()}
            />
            {/* ŠTÍT V LIGHTBOXU */}
            <div className="absolute inset-0 z-[55] bg-transparent" />
          </div>
        </div>
      )}
    </section>
  );
}