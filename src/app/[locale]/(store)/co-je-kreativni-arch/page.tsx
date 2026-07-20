import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';
import StampCategoriesSection from '@/components/StampCategoriesSection';

const processSteps = [
  {
    id: 1,
    title: 'Nahrajte své fotky',
    text: 'Přidejte svoje fotografie z mobilu nebo počítače. Klidně ty, které jste vyfotili právě dnes.',
  },
  {
    id: 2,
    title: 'Napište vlastní text',
    text: 'Doplňte datum, jméno, vzkaz nebo cokoliv, co arch učiní skutečně originálním.',
  },
  {
    id: 3,
    title: 'Tisk a výroba',
    text: 'Vaše fotky dotiskneme k šabloně a doplníme skutečnými poštovními známkami.',
  },
  {
    id: 4,
    title: 'Odeslání na adresu',
    text: 'Hotový arch pečlivě zabalíme a doručíme přímo k vám domů. Nebo si ho vyzvednete osobně v Praze.',
  },
];

export const metadata = {
  title: 'Co je Kreativní arch?',
  description: 'Unikátní sběratelský produkt spojující krásu poštovních známek s vašimi vlastními fotografiemi a vzpomínkami.',
  alternates: { canonical: '/co-je-kreativni-arch' },
};

export default function CoJeKreativniArch() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: 'Co je Kreativní arch?' }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-8 md:py-12 text-center">
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">
          Co je Kreativní arch?
        </h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto mb-10">
          Jedinečný dárek i sběratelský poklad. Vybrané poštovní známky se světovými umělci, českou a evropskou historií nebo
          památkami, doplněný o vaše vlastní fotografie a text. 
        </p>
        <Link href="/vytvorit-arch">
          <Button arrow="right">Vybrat šablonu a začít tvořit</Button>
        </Link>
      </section>

      {/* ——— JAK TO FUNGUJE ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">Jak si vytořit vlastní Kreativní arch?</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Nejprve si vyberte šablonu a pak můžete v našem on-line editoru začít tvořit.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {processSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-3 shrink-0">
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
      <section className="border-t border-white/5 py-[48px] md:py-[64px] lg:py-[80px]">
        <StampCategoriesSection />
      </section>

      {/* ——— PRO TURISTY ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">Přijedete, vyfotíte, odnesete si kus Česka</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Kreativní arch je ideální památka pro turisty, kteří chtějí domů přivézt víc než magnetku.
            Nahrajte fotky přímo z výletu a vyprávějte svůj vlastní příběh.
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-[640px] mx-auto">
            {[
              { num: '01', text: 'Vyfotíte Pražský hrad — my ho doplníme známkami s českou historií.' },
              { num: '02', text: 'Navštívíte galerii s Muchou — my přidáme jeho díla ze sbírek na známkách.' },
              { num: '03', text: 'Okouzlí vás Český Krumlov? — máme připravené památky z Krumlova a okolí.' },
            ].map((item) => (
              <div key={item.num} className="flex gap-4 items-start p-5 rounded-[4px] border border-white/5 bg-[#0B1120]">
                <span className="style-h2 text-primary/40 font-semibold shrink-0 leading-none">{item.num}</span>
                <p className="style-body text-secondary/70 mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">Připraveni vytvořit svůj arch?</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            Vyberte šablonu, nahrajte fotky a my se postaráme o tisk a doručení.
          </p>
          <Link href="/vytvorit-arch">
            <Button arrow="right">Vybrat šablonu a začít tvořit</Button>
          </Link>
        </div>
      </section>

    </main>
  );
}
