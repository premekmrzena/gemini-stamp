'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { CONTENT, HTML_LANG, LANGS, LangCode } from './content';

// Primární CTA - stejné třídy jako Button.tsx (variant="contained"), replikované
// na <Link>, protože <button> uvnitř <a> je neplatné HTML a odkaz musí vést na
// /vytvorit-arch (cesta je mimo next-intl [locale], next/link stačí přímo).
function PrimaryCta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/vytvorit-arch"
      className={`inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95 text-[16px] md:text-[18px] p-[16px] bg-primary text-black hover:bg-primary-hover ${className}`}
    >
      {children}
    </Link>
  );
}

type Props = {
  lang: LangCode;
  /** Kořenová (auto-detekující) stránka: přepínač mění jen lokální state, URL zůstává. */
  onSelectLang?: (lang: LangCode) => void;
  /** Pevné /prague-souvenir/[lang] cesty: přepínač naviguje na sesterskou URL. */
  linkBasePath?: string;
};

export default function LandingContent({ lang, onSelectLang, linkBasePath }: Props) {
  const c = CONTENT[lang];
  // Poppins nemá CJK znaky (viz .font-cjk v globals.css) - anglický obsah zůstává
  // v brandovém Poppins, ostatní 4 jazyky přepnou na systémový CJK stack.
  const contentFontClass = lang === 'en' ? '' : 'font-cjk';

  useEffect(() => {
    // prague-souvenir/layout.tsx má <html lang="en"> natvrdo (sdílený root layout
    // pro všechny jazyky) - dorovnat na skutečně zobrazený jazyk za běhu, hlavně
    // kvůli screen readerům na pevných /[lang] cestách.
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);

  return (
    <main className={`flex flex-col w-full min-h-screen bg-black text-secondary ${contentFontClass}`}>
      {/* TOP BAR - jen logo + přepínač jazyků, žádná plná navigace (fokusovaná
          kampaňová stránka, ne kopie hlavního webu) */}
      <div className="layout-container flex items-center justify-between py-6">
        <Link href="/" className="shrink-0">
          {/* SVG (viewBox 262×69) je celý wordmark - ikona + "My Creative Stamp"
              text v jednom, stejně jako v Header.tsx (tam width=250 height=69).
              Dřív se čtverečkovalo do 28×28 (ořízlo skoro celé) a text se
              přidával ještě jednou ručně vedle - duplicitní a zmáčknuté. */}
          <Image src="/images/creative-stamp_logo.svg" alt="My Creative Stamp" width={180} height={47} />
        </Link>
        {/* font-cjk natvrdo (ne podmíněně) - vlastní název jazyka (日本語, 한국어...)
            musí být čitelný, i když je zrovna aktivní jiný jazyk. */}
        <div className="flex flex-wrap justify-end gap-1.5 font-cjk" role="group" aria-label="Language">
          {LANGS.map(({ code, label }) =>
            onSelectLang ? (
              <button
                key={code}
                onClick={() => onSelectLang(code)}
                aria-pressed={lang === code}
                className={`style-label px-2.5 py-1.5 rounded-[4px] border transition-colors cursor-pointer ${
                  lang === code
                    ? 'bg-primary text-black border-primary'
                    : 'border-black300/30 text-black300 hover:text-secondary hover:border-black300/60'
                }`}
              >
                {label}
              </button>
            ) : (
              <Link
                key={code}
                href={`${linkBasePath}/${code}`}
                aria-current={lang === code ? 'page' : undefined}
                className={`style-label px-2.5 py-1.5 rounded-[4px] border transition-colors ${
                  lang === code
                    ? 'bg-primary text-black border-primary'
                    : 'border-black300/30 text-black300 hover:text-secondary hover:border-black300/60'
                }`}
              >
                {label}
              </Link>
            )
          )}
        </div>
      </div>

      {/* HERO - split layout, stejná barevná logika jako homepage Hero (bg-black,
          text-secondary), obrázek je reálná fotka z hero slideru homepage. */}
      <section className="layout-container grid md:grid-cols-2 gap-10 md:gap-12 items-center pt-4 pb-12 md:pb-20">
        <div className="flex flex-col md:order-1 order-2">
          <h1 className="style-h1 mb-4">{c.heroTitle}</h1>
          <p className="style-perex text-secondary/70 mb-8 max-w-[520px]">{c.heroSubtitle}</p>
          <div>
            <PrimaryCta>{c.heroCta}</PrimaryCta>
            <p className="style-label text-black300 mt-3">{c.heroCtaNote}</p>
          </div>
        </div>
        <div className="relative w-full aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden md:order-2 order-1">
          <Image
            src="/images/hero02.png"
            alt={c.heroImageAlt}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* KROKY - číslovaná mřížka, vzor z feedback_static_page_pattern */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {c.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
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

      {/* UKÁZKA - reálný vyplněný arch, bez pozadí (střídání pásů) */}
      <section>
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px] flex flex-col items-center">
          <div className="relative w-full max-w-[820px] aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden">
            <Image
              src="/images/hero01.png"
              alt={c.showcaseCaption}
              fill
              sizes="(max-width: 900px) 100vw, 820px"
              className="object-contain"
            />
          </div>
          <p className="style-body text-secondary/50 mt-6 text-center">{c.showcaseCaption}</p>
        </div>
      </section>

      {/* DOPRAVA / ODBĚR - dvě rovnocenné karty, ne kroky (bez čísel) */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">{c.trustTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-[760px] mx-auto">
            <div className="bg-black border border-white/5 rounded-[4px] p-6">
              <h3 className="style-h3 mb-2">{c.shipTitle}</h3>
              <p className="style-body text-secondary/60">{c.shipText}</p>
            </div>
            <div className="bg-black border border-white/5 rounded-[4px] p-6">
              <h3 className="style-h3 mb-2">{c.pickupTitle}</h3>
              <p className="style-body text-secondary/60">{c.pickupText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PÁS - poslední, vzor z feedback_static_page_pattern bod 7 */}
      <section className="bg-[#0B1120] border-t border-white/5">
        <div className="layout-container py-[56px] md:py-[80px] text-center flex flex-col items-center">
          <h2 className="style-h2 mb-4">{c.finalTitle}</h2>
          <p className="style-perex text-secondary/70 max-w-[480px] mx-auto mb-10">{c.finalSubtitle}</p>
          <PrimaryCta>{c.finalCta}</PrimaryCta>
        </div>
      </section>

      {/* FOOTER - minimální, jen právní odkazy, žádná plná patička */}
      <footer className="layout-container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-black300">
        <p className="style-label">{c.footerText}</p>
        <div className="flex gap-4 style-label">
          <Link href="/obchodni-podminky" className="hover:text-secondary transition-colors">Terms</Link>
          <Link href="/ochrana-osobnich-udaju" className="hover:text-secondary transition-colors">Privacy</Link>
        </div>
      </footer>
    </main>
  );
}
