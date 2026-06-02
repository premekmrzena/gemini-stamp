import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';

const processSteps = [
  {
    id: 1,
    title: 'Nahraj své fotky',
    text: 'Přidej fotografie z mobilu nebo počítače. Klidně ty, které jsi vyfotil dnes.',
  },
  {
    id: 2,
    title: 'Napiš vlastní text',
    text: 'Doplň datum, jméno, vzkaz nebo cokoliv, co arch učiní skutečně tvým.',
  },
  {
    id: 3,
    title: 'Vytiskneme pro tebe',
    text: 'Tvůj návrh profesionálně vytiskneme na kvalitní papír se skutečnými poštovními známkami.',
  },
  {
    id: 4,
    title: 'Zašleme na adresu',
    text: 'Hotový arch zabalíme a doručíme přímo k tobě domů v bezpečném obalu.',
  },
];

const stampCategories = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Česká a evropská historie',
    text: 'Panovníci, události, milníky. Poštovní známky jsou jedinečnými doklady doby, která formovala naši civilizaci.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: 'Světoznámí umělci',
    text: 'Monet, Picasso, Alfons Mucha. Jejich díla přetavená do miniaturních obrazů na poštovních známkách.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
    title: 'Památky světového dědictví',
    text: 'Praha, Český Krumlov, Telč. Ikony architektury a přírody zachycené na sběratelských exemplářích.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Příroda a kultura',
    text: 'Národní parky, tradiční řemesla, folklor. Bohatství, které stojí za to uchovat a předávat dál.',
  },
];

export const metadata = {
  title: 'Co je Kreativní arch? | Gemini Stamp',
  description: 'Unikátní sběratelský produkt spojující krásu poštovních známek s vašimi vlastními fotografiemi a vzpomínkami.',
};

export default function CoJeKreativniArch() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: 'Co je Kreativní arch?' }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-[48px] md:py-[72px] lg:py-[96px] text-center">
        <p className="style-label text-primary uppercase tracking-widest mb-4">Sběratelský unikát</p>
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">
          Kreativní arch — kde skvělé umění potkává tvoje vzpomínky
        </h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto mb-10">
          Arch ze skutečných poštovních známek s českou a evropskou historií, světovými umělci nebo
          památkami — doplněný o tvoje vlastní fotografie. Jedinečný dárek i sběratelský poklad.
        </p>
        <Link href="/vytvorit-arch">
          <Button arrow="right">Vybrat šablonu a začít tvořit</Button>
        </Link>
      </section>

      {/* ——— JAK TO FUNGUJE ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-3">Jak to funguje?</h2>
          <p className="style-body text-secondary/50 text-center mb-12 md:mb-16">
            Hotový arch ve 4 jednoduchých krocích.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {processSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[28px] mb-4 shrink-0">
                  {step.id}
                </div>
                <h3 className="style-h3 mb-2">{step.title}</h3>
                <p className="style-body text-secondary/60">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— UMĚNÍ VE ZNÁMKÁCH ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="max-w-[640px] mb-12 md:mb-16">
            <p className="style-label text-primary uppercase tracking-widest mb-4">Příběhy na dlaní</p>
            <h2 className="style-h2 mb-4">
              Každá známka nese kousek historie
            </h2>
            <p className="style-perex text-secondary/60">
              Poštovní známky jsou miniaturní okna do světa kultury, vědy a umění. Na Kreativním archu
              se setkáš s díly, která přežila staletí — a nyní ožijí vedle tvých vlastních fotek.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {stampCategories.map((cat, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-[4px] border border-white/5 bg-[#0F172A] hover:border-white/10 transition-colors"
              >
                <div className="shrink-0 w-12 h-12 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="style-h4 mb-1">{cat.title}</h3>
                  <p className="style-body text-secondary/60">{cat.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— PRO TURISTY ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-start">
            <div className="flex-1">
              <p className="style-label text-primary uppercase tracking-widest mb-4">Originální suvenýr</p>
              <h2 className="style-h2 mb-5">
                Přijedeš, vyfotíš, odneseš si kus Česka
              </h2>
              <p className="style-perex text-secondary/60 mb-6">
                Kreativní arch je ideální suvenýr pro turisty, kteří chtějí domů přivézt víc než magnetku.
                Nahraj fotky přímo z výletu a my je spojíme s ikonickými českými nebo evropskými
                poštovními známkami do archu, který skutečně vypráví tvůj příběh.
              </p>
              <p className="style-body text-secondary/50">
                Kombinace světoznámých umělců a památek na známkách s tvými vlastními záběry vytváří
                neopakovatelný kus, jaký nenajdeš v žádném obchodě se suvenýry.
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-4">
              {[
                { num: '01', text: 'Vyfotíš Pražský hrad — my ho obklopíme známkami s českou historií.' },
                { num: '02', text: 'Navštívíš galerii s Muchou — my přidáme jeho díla ze sbírek na známkách.' },
                { num: '03', text: 'Projdeš Krkonošemi — my zkomponujeme arch s přírodními motivy.' },
              ].map((item) => (
                <div key={item.num} className="flex gap-4 items-start p-5 rounded-[4px] border border-white/5 bg-[#0B1120]">
                  <span className="style-h2 text-primary/40 font-semibold shrink-0 leading-none">{item.num}</span>
                  <p className="style-body text-secondary/70 mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">Připraven vytvořit svůj arch?</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            Vybereš šablonu, nahraješ fotky, my se postaráme o tisk a doručení.
          </p>
          <Link href="/vytvorit-arch">
            <Button arrow="right">Vybrat šablonu a začít tvořit</Button>
          </Link>
        </div>
      </section>

    </main>
  );
}
