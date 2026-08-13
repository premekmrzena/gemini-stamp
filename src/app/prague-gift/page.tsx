import Image from 'next/image';
import Link from 'next/link';

// Kampaňová landing page pro západní turisty v ČR (2026-08-13, viz
// project_prague_gift_landing) - sesterská stránka k /prague-souvenir (ta
// cílí na asijské turisty JP/CN/KR, 5 jazyků). Tahle je jen anglicky, jediná
// cílová skupina = žádný přepínač jazyků potřeba, proto i čistě server
// komponenta (žádná klientská detekce jazyka jako na /prague-souvenir).
// Copy je záměrně TOTOŽNÁ s anglickou variantou /prague-souvenir - jediná
// proměnná v A/B srovnání má být zdroj provozu (kampaň/publikum), ne text.
// Liší se jen hero/showcase obrázky (viz níže).

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

export default function PragueGiftPage() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-black text-secondary">
      {/* TOP BAR - jen logo, žádný jazykový přepínač (jediná cílová skupina) */}
      <div className="layout-container flex items-center py-6">
        <Link href="/" className="shrink-0">
          {/* SVG (viewBox 262×69) je celý wordmark - ikona + text v jednom,
              stejně jako Header.tsx - viz LandingContent.tsx pro plné vysvětlení. */}
          <Image src="/images/creative-stamp_logo.svg" alt="My Creative Stamp" width={180} height={47} />
        </Link>
      </div>

      {/* HERO - hero01.png (rozložený produktový mockup, ne jedna konkrétní
          skupina lidí) - odlišné od /prague-souvenir (hero02.png), ať obě
          stránky nejsou vizuálně identické. */}
      <section className="layout-container grid md:grid-cols-2 gap-10 md:gap-12 items-center pt-4 pb-12 md:pb-20">
        <div className="flex flex-col md:order-1 order-2">
          <h1 className="style-h1 mb-4">Turn your trip into a keepsake no one else has.</h1>
          <p className="style-perex text-secondary/70 mb-8 max-w-[520px]">
            Design your own sheet of postage stamps using your own travel photos — a personal, one-of-a-kind
            souvenir from the Czech Republic.
          </p>
          <div>
            <PrimaryCta>Create Your Stamp Sheet</PrimaryCta>
          </div>
        </div>
        <div className="relative w-full aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden md:order-2 order-1">
          <Image
            src="/images/hero01.png"
            alt="A finished sheet of stamps made from a trip to Prague"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* KROKY */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {[
              { title: 'Choose a template', text: 'Inspired by Czech architecture, castles, and Alphonse Mucha’s art.' },
              { title: 'Upload your photos', text: 'Prague Castle, Charles Bridge, Český Krumlov — today’s photos are perfect.' },
              { title: 'Add your own words', text: 'A short message, a date, a name — whatever makes it yours.' },
            ].map((step, i) => (
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

      {/* UKÁZKA - hero02.png (reálná fotka páru), prohozeno oproti /prague-souvenir */}
      <section>
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px] flex flex-col items-center">
          <div className="relative w-full max-w-[820px] aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden">
            <Image
              src="/images/hero02.png"
              alt="Travelers with their finished stamp sheet in front of Český Krumlov castle"
              fill
              sizes="(max-width: 900px) 100vw, 820px"
              className="object-cover"
            />
          </div>
          <p className="style-body text-secondary/50 mt-6 text-center">A real sheet, filled with a real trip.</p>
        </div>
      </section>

      {/* DOPRAVA / ODBĚR */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">However you’re traveling</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-[760px] mx-auto">
            <div className="bg-black border border-white/5 rounded-[4px] p-6">
              <h3 className="style-h3 mb-2">We ship worldwide</h3>
              <p className="style-body text-secondary/60">Order now, and it will be waiting for you at home.</p>
            </div>
            <div className="bg-black border border-white/5 rounded-[4px] p-6">
              <h3 className="style-h3 mb-2">Or pick it up in Prague</h3>
              <p className="style-body text-secondary/60">
                Buy it in person at our partner shop In Arte Veritas, Malá Strana — a short walk from Charles
                Bridge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PÁS */}
      <section className="bg-[#0B1120] border-t border-white/5">
        <div className="layout-container py-[56px] md:py-[80px] text-center flex flex-col items-center">
          <h2 className="style-h2 mb-4">Start with your own photos.</h2>
          <p className="style-perex text-secondary/70 max-w-[480px] mx-auto mb-10">
            It takes a few minutes to design, and it lasts a lot longer than the trip.
          </p>
          <PrimaryCta>Create Your Stamp Sheet</PrimaryCta>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="layout-container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-black300">
        <p className="style-label">Shipped from Prague, Czech Republic.</p>
        <div className="flex gap-4 style-label">
          <Link href="/obchodni-podminky" className="hover:text-secondary transition-colors">Terms</Link>
          <Link href="/ochrana-osobnich-udaju" className="hover:text-secondary transition-colors">Privacy</Link>
        </div>
      </footer>
    </main>
  );
}
