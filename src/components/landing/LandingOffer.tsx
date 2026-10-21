'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getEffectivePrice } from '@/lib/pricing';
import { formatPrice } from '@/lib/currency';

// Ceny a upoutávka na známky pro kampaňové landing pages (docs/14-plan-marketing-2026-10.md,
// body 3 a 5). Ceny se čtou živě z DB, ať po skončení slevy (sale_price_eur = null) samy
// přejdou na běžnou cenu a poznámka o slevě zmizí. Landing pages vedou na anglický
// checkout, ten účtuje v EUR - proto jen EUR.

// Aršík "Karlův most - 650 let" (kategorie znamkove-archy) jako náhled známek.
const STAMPS_TEASER_PRODUCT_ID = '0f953f08-ff41-4641-996b-47385b983aa1';

type PriceFrom = { price: number; regular: number | null };

type Row = { id: string; category: string; price_eur: number | null; sale_price_eur: number | null; image_url: string | null };

function cheapest(rows: Row[], category: string): PriceFrom | null {
  let best: PriceFrom | null = null;
  for (const row of rows) {
    if (row.category !== category || row.price_eur == null) continue;
    const price = getEffectivePrice(row.price_eur, row.sale_price_eur);
    if (!best || price < best.price) best = { price, regular: price < row.price_eur ? row.price_eur : null };
  }
  return best;
}

function useLandingPrices() {
  const [data, setData] = useState<{ sheet: PriceFrom | null; stamp: PriceFrom | null; teaserImage: string | null } | null>(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, category, price_eur, sale_price_eur, image_url')
      .eq('is_active', true)
      .in('category', ['kreativni-archy', 'znamky', 'znamkove-archy'])
      .then(({ data: rows, error }) => {
        // Při chybě se blok s cenou jen nevykreslí, stránka nespadne.
        if (error || !rows) return;
        setData({
          sheet: cheapest(rows, 'kreativni-archy'),
          stamp: cheapest(rows, 'znamky'),
          teaserImage: rows.find((r) => r.id === STAMPS_TEASER_PRODUCT_ID)?.image_url ?? null,
        });
      });
  }, []);

  return data;
}

function Price({ value }: { value: PriceFrom }) {
  return (
    <>
      <span className="text-secondary">{formatPrice(value.price, 'EUR')}</span>
      {value.regular != null && <span className="line-through text-black300 ml-2">{formatPrice(value.regular, 'EUR')}</span>}
    </>
  );
}

export type LandingOfferText = {
  priceFrom: string;
  saleNote: string;
  stampsTitle: string;
  stampsText: string;
  stampsCta: string;
  stampsPriceFrom: string;
  stampsImageAlt: string;
};

/** "From €42 €56" + poznámka o slevě, pod hero CTA. */
export function LandingPriceFrom({ text }: { text: LandingOfferText }) {
  const prices = useLandingPrices();
  if (!prices?.sheet) return null;
  return (
    <div className="mb-6">
      <p className="style-h4">
        <span className="text-secondary/70 mr-2">{text.priceFrom}</span>
        <Price value={prices.sheet} />
      </p>
      {prices.sheet.regular != null && <p className="style-label text-primary mt-1">{text.saleNote}</p>}
    </div>
  );
}

/** Pás s náhledem aršíku Karlův most a odkazem do kategorie známek. */
export function LandingStampsTeaser({ text }: { text: LandingOfferText }) {
  const prices = useLandingPrices();
  return (
    <section className="border-t border-white/5">
      <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px] grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div className="relative w-full max-w-[420px] mx-auto aspect-square min-w-0 min-h-0">
          {prices?.teaserImage && (
            <Image src={prices.teaserImage} alt={text.stampsImageAlt} fill sizes="(max-width: 767px) 100vw, 420px" className="object-contain" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <h2 className="style-h2 mb-4">{text.stampsTitle}</h2>
          <p className="style-perex text-secondary/70 mb-6 max-w-[480px]">{text.stampsText}</p>
          {prices?.stamp && (
            <p className="style-h4 mb-6">
              <span className="text-secondary/70 mr-2">{text.stampsPriceFrom}</span>
              <Price value={prices.stamp} />
            </p>
          )}
          <Link
            href="/kategorie/znamky"
            className="inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-colors text-[16px] p-[16px] border border-secondary/40 text-secondary hover:border-secondary"
          >
            {text.stampsCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
