'use client';

import Image from 'next/image';
import HeroSlider from '@/components/HeroSlider';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, CONTENT, PARTNER_LANGS, PartnerLang } from './content';
import PartnerForm from './PartnerForm';
import PartnerCategoriesSection from './PartnerCategoriesSection';
import type { PriceRange } from './page';
import { SITE_NAME } from '@/lib/site';

// Tmavý design e-shopu podle vzoru statických stránek (feedback_static_page_pattern):
// pásy se střídají bg-[#0B1120] / bez pozadí. Karty mají vždy opačné pozadí než
// pás, ve kterém stojí (CARD_ON_DARK / CARD_ON_PLAIN).

const SECTION = 'layout-container py-[48px] md:py-[64px] lg:py-[80px]';
const BAND_DARK = 'bg-[#0B1120] border-t border-white/5';
const BAND_PLAIN = 'border-t border-white/5';
const CARD_ON_DARK = 'bg-black border border-white/5 rounded-[4px] p-6';
const CARD_ON_PLAIN = 'bg-[#0B1120] border border-white/5 rounded-[4px] p-6';

// Hosté platí v eurech (anglický e-shop), proto je hlavní cena v EUR v obou
// jazycích. České CK navíc vidí orientační přepočet v Kč.
function formatPriceRange(range: PriceRange, lang: PartnerLang) {
  if (lang === 'cs') {
    return {
      eur: `${range.eur[0]} – ${range.eur[1]} €`,
      czk: `${range.czk[0].toLocaleString('cs-CZ')} – ${range.czk[1].toLocaleString('cs-CZ')} Kč`,
    };
  }
  return { eur: `€${range.eur[0]} – €${range.eur[1]}`, czk: null };
}

function SectionHeading({ title, text }: { title: string; text?: string }) {
  return (
    <>
      <h2 className="style-h2 text-center mb-4">{title}</h2>
      {text && <p className="style-body text-secondary/60 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">{text}</p>}
    </>
  );
}

function Row({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-5 border-b border-white/10 last:border-b-0">
      <h3 className="style-h4 mb-1">{title}</h3>
      <p className="style-body text-secondary/60">{text}</p>
    </div>
  );
}

function Card({ title, text, className }: { title: string; text: string; className: string }) {
  return (
    <div className={className}>
      <h3 className="style-h3 mb-2">{title}</h3>
      <p className="style-body text-secondary/60">{text}</p>
    </div>
  );
}

type Props = { initialLang: PartnerLang; priceRange: PriceRange | null };

export default function PartnerContent({ initialLang, priceRange }: Props) {
  const [lang, setLang] = useState<PartnerLang>(initialLang);
  const [ref, setRef] = useState<string | null>(null);
  const c = CONTENT[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${c.metaTitle} — ${SITE_NAME}`;
  }, [lang, c.metaTitle]);

  useEffect(() => {
    // ?ref=ck-xxx z e-mailu - posílá se s formulářem, ať je jasné, kdo píše.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRef(new URLSearchParams(window.location.search).get('ref'));
  }, []);

  function selectLang(next: PartnerLang) {
    setLang(next);
    // Jen přepis URL (zachová ?ref=), bez navigace - obsah se přepne okamžitě
    // a odkaz zkopírovaný z adresního řádku otevře stejný jazyk.
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  }

  const price = priceRange ? formatPriceRange(priceRange, lang) : null;

  const ctaClass =
    'inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95 text-[16px] md:text-[18px] p-[16px] bg-primary text-black hover:bg-primary-hover';

  return (
    <main className="flex flex-col w-full min-h-screen bg-black text-secondary">
      {/* HORNÍ LIŠTA - logo + přepínač CZ/EN */}
      <header>
        <div className="layout-container flex items-center justify-between py-5">
          <Link href="/" className="shrink-0">
            <Image src="/images/creative-stamp_logo.svg" alt="My Creative Stamp" width={180} height={47} />
          </Link>
          <div className="flex gap-1.5" role="group" aria-label="Language">
            {PARTNER_LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => selectLang(code)}
                aria-pressed={lang === code}
                className={`style-label px-2.5 py-1.5 rounded-[4px] border transition-colors cursor-pointer ${
                  lang === code
                    ? 'bg-primary text-black border-primary'
                    : 'border-black300/30 text-black300 hover:text-secondary hover:border-black300/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="layout-container grid md:grid-cols-2 gap-10 md:gap-12 items-center py-10 md:py-16">
        <div className="flex flex-col order-2 md:order-1">
          <p className="style-label text-primary font-semibold mb-4">{c.badge}</p>
          <h1 className="style-h1 mb-4">{c.heroTitle}</h1>
          <p className="style-perex text-secondary/70 mb-8 max-w-[520px]">
            {c.heroText}
            <strong className="text-secondary">{c.heroTextStrong}</strong>
            {c.heroTextAfter}
          </p>
          <div>
            <a href="#kontakt" className={ctaClass}>
              {c.heroCta}
            </a>
          </div>
        </div>
        <div className="order-1 md:order-2 w-full min-w-0">
          <HeroSlider alt={c.heroImageAlt} sizes="(max-width: 767px) 100vw, 50vw" />
        </div>
      </section>

      {/* 1. CO SI HOSTÉ MOHOU KOUPIT - duplikát PurchaseCategoriesSection */}
      <section className="border-t border-white/5 py-[48px] md:py-[64px] lg:py-[80px]">
        <PartnerCategoriesSection lang={lang} />
      </section>

      {/* 2. JAK TO FUNGUJE - číslované kroky */}
      <section className={BAND_DARK}>
        <div className={SECTION}>
          <SectionHeading title={c.howTitle} text={c.howText} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {c.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-4">
                  {i + 1}
                </div>
                <h3 className="style-h3 mb-2">{step.title}</h3>
                <p className="style-body text-secondary/60 max-w-[26rem]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DORUČENÍ */}
      <section className={BAND_PLAIN}>
        <div className={SECTION}>
          <SectionHeading title={c.deliveryTitle} text={c.deliveryText} />
          <div className="grid sm:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {c.delivery.map((item) => (
              <Card key={item.title} {...item} className={CARD_ON_PLAIN} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CENY A PROVIZE */}
      <section className={BAND_DARK}>
        <div className={SECTION}>
          <SectionHeading title={c.pricingTitle} text={c.pricingText} />
          <div className="grid sm:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-10">
            <div className={CARD_ON_DARK}>
              <h3 className="style-h4 text-secondary/60 mb-2">{c.guestPriceTitle}</h3>
              {price ? (
                <>
                  <p className="style-h2">{price.eur}</p>
                  {price.czk && c.guestPriceCzkApprox && (
                    <p className="style-body text-secondary/60">{c.guestPriceCzkApprox.replace('{czk}', price.czk)}</p>
                  )}
                  <p className="style-body text-secondary/60 mt-2">{c.guestPriceText}</p>
                </>
              ) : (
                <p className="style-body text-secondary/60">{c.guestPriceFallback}</p>
              )}
            </div>
            <div className={CARD_ON_DARK}>
              <h3 className="style-h4 text-secondary/60 mb-2">{c.commissionTitle}</h3>
              <p className="style-h2 text-primary mb-2">{c.commissionValue}</p>
              <p className="style-body text-secondary/60">{c.commissionText}</p>
            </div>
          </div>
          <div className="max-w-[640px] mx-auto">
            {c.pricingRows.map((row) => (
              <Row key={row.title} {...row} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. SLEDOVÁNÍ OBJEDNÁVEK */}
      <section className={BAND_PLAIN}>
        <div className={SECTION}>
          <SectionHeading title={c.trackingTitle} text={c.trackingText} />
          <div className="grid sm:grid-cols-3 gap-6">
            {c.tracking.map((item) => (
              <Card key={item.title} {...item} className={CARD_ON_PLAIN} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. MATERIÁLY */}
      <section className={BAND_DARK}>
        <div className={SECTION}>
          <SectionHeading title={c.materialsTitle} text={c.materialsText} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.materials.map((item) => (
              <div key={item.title} className={CARD_ON_DARK}>
                <h3 className="style-h3 mb-2">{item.title}</h3>
                <p className="style-body text-secondary/60">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="style-body text-secondary/60 text-center mt-8">{c.materialsNote}</p>
        </div>
      </section>

      {/* 7. ČASTÉ DOTAZY */}
      <section className={BAND_PLAIN}>
        <div className={SECTION}>
          <SectionHeading title={c.faqTitle} />
          <div className="max-w-[720px] mx-auto mt-8 md:mt-12 flex flex-col gap-3">
            {c.faq.map((item) => (
              <details key={item.q} className="group bg-[#0B1120] border border-white/5 rounded-[4px] p-5">
                <summary className="style-h4 cursor-pointer list-none flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-primary text-[20px] leading-none transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="style-body text-secondary/60 mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. KONTAKT */}
      <section id="kontakt" className={`${BAND_DARK} scroll-mt-4`}>
        <div className="layout-container py-[56px] md:py-[80px] flex flex-col items-center">
          <h2 className="style-h2 text-center mb-4">{c.contactTitle}</h2>
          <p className="style-perex text-secondary/70 text-center max-w-[480px] mx-auto mb-10">{c.contactText}</p>
          <PartnerForm lang={lang} refCode={ref} ctaClass={ctaClass} />
          <p className="style-body text-secondary/60 text-center mt-10 mb-2">{c.contactOr}</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <a href={CONTACT_PHONE_HREF} className="style-h4 hover:text-primary transition-colors">
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="style-h4 hover:text-primary transition-colors">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="layout-container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-black300">
          <p className="style-label">{c.footerText}</p>
          <div className="flex gap-4 style-label">
            <Link href="/obchodni-podminky" className="hover:text-secondary transition-colors">
              {c.footerTerms}
            </Link>
            <Link href="/ochrana-osobnich-udaju" className="hover:text-secondary transition-colors">
              {c.footerPrivacy}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
