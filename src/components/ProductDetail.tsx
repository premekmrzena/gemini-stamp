'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext'; // <-- PŘIDANÝ IMPORT KONTEXTU KOŠÍKU

// MOCK DATA
const product = {
  id: '30dbee72-34c2-44ac-9731-62de02b17ca9',
  name: '750. výročí založení kláštera Zlatá Koruna (Český Krumlov)',
  perex: 'Vinotéka - energetická třída G, samostatně stojící s kompresorem, pro 33 lahví uskladněných v 2 zónách po 15 a 18 lahvích, nastavení teploty nezávisle pro každou zónu...',
  description: 'Zde je detailní textový popis produktu. Vinotéka - energetická třída G, samostatně stojící s kompresorem, pro 33 lahví uskladněných v 2 zónách po 15 a 18 lahvích, nastavení teploty nezávisle pro každou zónu 5-18°C, celkem 5 polic s dřevěným dekorem a spodní úložný prostor, hloubka polic 33 cm, objem 88 l, modrý LED displeje, LED osvětlení, třída hlučnosti C max. 39 dB, černá barva, rozměry 84,8 × 49,5 × 43 cm (V×Š×H), hmotnost 27 kg, délka kabelu přívodního kabelu 170 cm, 3 roky záruka.',
  price: 355,
  stockCount: 5,
  images: [
    '/images/product-image_0001.jpg',
    '/images/product-image_0002.jpg',
    '/images/product-image_0003.jpg',
  ]
};

const relatedProducts = [
  { id: 'rel1', name: 'Související produkt 1', price: 150, image_url: '/images/product-image_0001.jpg' },
  { id: 'rel2', name: 'Související produkt 2', price: 290, image_url: '/images/product-image_0001.jpg' },
  { id: 'rel3', name: 'Související produkt 3', price: 85, image_url: '/images/product-image_0001.jpg' },
];

export default function ProductDetail() {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState(product.images[0]);
  
  // <-- VYTÁHNUTÍ FUNKCE PRO PŘIDÁNÍ DO KOŠÍKU -->
  const { addToCart } = useCart();

  return (
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px] py-[32px]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Nadpis pro mobil */}
        <h1 className="style-h2 mb-6 text-center lg:hidden w-full">
          {product.name}
        </h1>

        <div className="flex flex-col lg:flex-row gap-[32px] md:gap-[48px] lg:gap-[64px] mb-[64px]">
          
          {/* LEVÝ SLOUPEC: OBRÁZKY */}
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
            
            {/* Náhledy */}
            <div className="flex justify-center lg:justify-start gap-4 overflow-x-auto pb-2 w-full">
              {product.images.map((img, idx) => (
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

          {/* PRAVÝ SLOUPEC: INFORMACE O PRODUKTU */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left gap-0">
            
            {/* Nadpis pro desktop */}
            <h1 className="style-h2 mb-4 hidden lg:block">
              {product.name}
            </h1>
            
            <p className="style-perex text-white/80 mb-6">{product.perex}</p>

            {/* CENA, SKLAD A BUTTON */}
            <div className="w-full flex flex-col items-center lg:items-start mb-6 pt-2">
              <div className="mb-2">
                <span className="style-product-price text-[#059669]">
                  Cena {product.price} Kč
                </span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 pointer-events-none mb-6 w-full">
                <span className="style-body text-[#FDFBF7]">Skladem</span>
                <span className="style-product-tag bg-[#2B3755] text-white px-2 py-1 rounded-full">
                  {product.stockCount > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                </span>
              </div>

              {/* <-- NAPOJENÍ BUTTONU NA KOŠÍK --> */}
              <Button 
                className="w-full md:w-[320px]"
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image_url: mainImage
                  });
                }}
              >
                Do košíku
              </Button>
            </div>

            {/* DETAILNÍ POPIS (Accordion) */}
            <div className="w-full border-t border-[#8B95AC]/30 pt-6 text-left">
              <button 
                className="w-full flex items-center justify-between lg:cursor-auto text-left group"
                onClick={() => setIsDescOpen(!isDescOpen)}
              >
                <h2 className="style-h4 group-hover:text-[#FF7F51] transition-colors">Detailní popis známky</h2>
                <svg 
                  className={`lg:hidden w-6 h-6 transition-transform duration-300 ${isDescOpen ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`${isDescOpen ? 'block' : 'hidden'} lg:block mt-4`}>
                <p className="style-body text-white/70 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SPODNÍ ČÁST: SOUVISEJÍCÍ PRODUKTY */}
        <div className="border-t border-[#8B95AC]/30 pt-16">
          <h2 className="style-h2 text-center mb-12">Mohlo by vás také zajímat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {relatedProducts.map((relProd) => (
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

      </div>

      {/* MODAL / LIGHTBOX */}
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