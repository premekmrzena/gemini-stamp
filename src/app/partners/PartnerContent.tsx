'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONTACT_EMAIL, CONTENT, PARTNER_LANGS, PartnerLang } from './content';
import type { PriceRange } from './page';
import { SITE_NAME } from '@/lib/site';

// Světlá varianta vzoru ze statických stránek (feedback_static_page_pattern):
// stejné pásy, typografie a mřížky, jen pozadí bílá / black100 místo tmavých.
// Horní lišta zůstává tmavá jako Header e-shopu - logo SVG je světlé (#d1d6df)
// a na bílé by zmizelo.

const SECTION = 'layout-container py-[48px] md:py-[64px] lg:py-[80px]';
const BAND_GRAY = 'bg-black100 border-t border-black/5';
const BAND_WHITE = 'border-t border-black/5';

function formatPriceRange(range: PriceRange, lang: PartnerLang) {
  if (lang === 'cs') {
    const f = (n: number) => `${n.toLocaleString('cs-CZ')} Kč`;
    return { min: f(range.czk[0]), max: f(range.czk[1]) };
  }
  const f = (n: number) => `€${n.toLocaleString('en-US')}`;
  return { min: f(range.eur[0]), max: f(range.eur[1]) };
}

function SectionHeading({ title, text }: { title: string; text?: string }) {
  return (
    <>
      <h2 className="style-h2 text-center mb-4">{title}</h2>
      {text && <p className="style-body text-black/60 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">{text}</p>}
    </>
  );
}

function Row({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-5 border-b border-black/10 last:border-b-0">
      <h3 className="style-h4 mb-1">{title}</h3>
      <p className="style-body text-black/60">{text}</p>
    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white border border-black/5 rounded-[4px] p-6">
      <h3 className="style-h3 mb-2">{title}</h3>
      <p className="style-body text-black/60">{text}</p>
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
    // ?ref=ck-xxx z e-mailu - přidá se do předmětu odpovědi, ať je jasné, kdo píše.
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

  const subject = ref ? `${c.contactSubject} (${ref})` : c.contactSubject;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(c.contactBody)}`;
  const price = priceRange ? formatPriceRange(priceRange, lang) : null;

  const ctaClass =
    'inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95 text-[16px] md:text-[18px] p-[16px] bg-primary text-black hover:bg-primary-hover';

  return (
    <main className="flex flex-col w-full min-h-screen bg-white text-black">
      {/* HORNÍ LIŠTA - logo + přepínač CZ/EN */}
      <header className="bg-black">
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
          <p className="style-perex text-black/70 mb-8 max-w-[520px]">{c.heroText}</p>
          <div>
            <a href={mailto} className={ctaClass}>
              {c.heroCta}
            </a>
          </div>
        </div>
        <div className="relative w-full aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden order-1 md:order-2">
          <Image src="/images/hero02.png" alt={c.heroImageAlt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" priority />
        </div>
      </section>

      {/* 1. CO TO JE */}
      <section className={BAND_GRAY}>
        <div className={SECTION}>
          <SectionHeading title={c.whatTitle} text={c.whatText} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {c.gallery.map((img) => (
              <div key={img.src} className="relative min-w-0 min-h-0 aspect-[4/3] rounded-[4px] overflow-hidden bg-white">
                <Image src={img.src} alt={img.alt} fill sizes="(max-width: 639px) 100vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. JAK TO FUNGUJE - číslované kroky */}
      <section className={BAND_WHITE}>
        <div className={SECTION}>
          <SectionHeading title={c.howTitle} text={c.howText} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {c.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-4">
                  {i + 1}
                </div>
                <h3 className="style-h3 mb-2">{step.title}</h3>
                <p className="style-body text-black/60 max-w-[26rem]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DORUČENÍ */}
      <section className={BAND_GRAY}>
        <div className={SECTION}>
          <SectionHeading title={c.deliveryTitle} text={c.deliveryText} />
          <div className="grid sm:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {c.delivery.map((item) => (
              <Card key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CENY A PROVIZE */}
      <section className={BAND_WHITE}>
        <div className={SECTION}>
          <SectionHeading title={c.pricingTitle} text={c.pricingText} />
          <div className="grid sm:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-10">
            <div className="bg-black100 rounded-[4px] p-6">
              <h3 className="style-h4 text-black/60 mb-2">{c.guestPriceTitle}</h3>
              {price ? (
                <>
                  <p className="style-h2 mb-2">
                    {price.min} – {price.max}
                  </p>
                  <p className="style-body text-black/60">{c.guestPriceText}</p>
                </>
              ) : (
                <p className="style-body text-black/60">{c.guestPriceFallback}</p>
              )}
            </div>
            <div className="bg-black100 rounded-[4px] p-6">
              <h3 className="style-h4 text-black/60 mb-2">{c.commissionTitle}</h3>
              <p className="style-h2 text-primary mb-2">{c.commissionValue}</p>
              <p className="style-body text-black/60">{c.commissionText}</p>
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
      <section className={BAND_GRAY}>
        <div className={SECTION}>
          <SectionHeading title={c.trackingTitle} text={c.trackingText} />
          <div className="grid sm:grid-cols-3 gap-6">
            {c.tracking.map((item) => (
              <Card key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. MATERIÁLY */}
      <section className={BAND_WHITE}>
        <div className={SECTION}>
          <SectionHeading title={c.materialsTitle} text={c.materialsText} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.materials.map((item) => (
              <div key={item.title} className="bg-black100 rounded-[4px] p-6">
                <h3 className="style-h3 mb-2">{item.title}</h3>
                <p className="style-body text-black/60">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="style-body text-black/60 text-center mt-8">{c.materialsNote}</p>
        </div>
      </section>

      {/* 7. ČASTÉ DOTAZY */}
      <section className={BAND_GRAY}>
        <div className={SECTION}>
          <SectionHeading title={c.faqTitle} />
          <div className="max-w-[720px] mx-auto mt-8 md:mt-12 flex flex-col gap-3">
            {c.faq.map((item) => (
              <details key={item.q} className="group bg-white border border-black/5 rounded-[4px] p-5">
                <summary className="style-h4 cursor-pointer list-none flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-primary text-[20px] leading-none transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="style-body text-black/60 mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. KONTAKT */}
      <section className={BAND_WHITE}>
        <div className="layout-container py-[56px] md:py-[80px] text-center flex flex-col items-center">
          <h2 className="style-h2 mb-4">{c.contactTitle}</h2>
          <p className="style-perex text-black/70 max-w-[480px] mx-auto mb-10">{c.contactText}</p>
          <a href={mailto} className={ctaClass}>
            {c.contactCta}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="style-body text-black/60 hover:text-primary mt-4 transition-colors">
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>

      <footer className="border-t border-black/5">
        <div className="layout-container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-black/50">
          <p className="style-label">{c.footerText}</p>
          <div className="flex gap-4 style-label">
            <Link href="/obchodni-podminky" className="hover:text-black transition-colors">
              {c.footerTerms}
            </Link>
            <Link href="/ochrana-osobnich-udaju" className="hover:text-black transition-colors">
              {c.footerPrivacy}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
