import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';

const categories = [
  {
    href: '/kategorie/znamky',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: 'Poštovní známky',
    text: 'Sběratelské i klasické známky s českou a evropskou historií, uměním nebo přírodou.',
  },
  {
    href: '/vytvorit-arch',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: 'Kreativní archy',
    text: 'Arch ze skutečných poštovních známek doplněný o vaše vlastní fotografie a text.',
  },
  {
    href: '/kategorie/fdc',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: 'First Day Cover (FDC)',
    text: 'Obálky prvního dne vydání se známkou a razítkem k datu, kdy známka poprvé vyšla.',
  },
  {
    href: '/kategorie/plakety',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M9 14l-2 8 5-3 5 3-2-8" />
      </svg>
    ),
    title: 'Dárkové plakety',
    text: 'Reprezentativní plakety pro darování nebo jako doplněk ke sběratelské kolekci.',
  },
];

const shippingOptions = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Osobní odběr (Praha)',
    price: 'Zdarma',
    text: 'Vyzvednutí na adrese Jindřišská 126/15, Praha 1.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Česká republika',
    price: '40–120 Kč',
    text: 'Cena se odvíjí od hmotnosti zásilky (obyčejné psaní, doporučené psaní nebo balíček).',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: 'Mezinárodní doprava',
    price: '150–300 Kč',
    text: 'Zemi doručení zvolíte při objednávce, cena záleží na hmotnosti zásilky.',
  },
];

const paymentOptions = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Online platba kartou',
    text: 'Rychlá a bezpečná platba přes Stripe, peníze potvrdíme okamžitě.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="5 6 12 3 19 6" />
        <line x1="4" y1="10" x2="4" y2="21" />
        <line x1="20" y1="10" x2="20" y2="21" />
        <line x1="8" y1="14" x2="8" y2="17" />
        <line x1="12" y1="14" x2="12" y2="17" />
        <line x1="16" y1="14" x2="16" y2="17" />
      </svg>
    ),
    title: 'Bankovní převod',
    text: 'Platební pokyny vám pošleme e-mailem hned po dokončení objednávky.',
  },
];

const deliveryTimes = [
  { title: 'Standardní objednávka', time: '3–7 pracovních dnů', text: 'Od potvrzení objednávky do expedice.' },
  { title: 'Kreativní arch na míru', time: '5–10 pracovních dnů', text: 'Delší lhůta je daná tiskem a kompletací archu s vašimi fotografiemi.' },
];

export const metadata = {
  title: 'Jak nakupovat | Gemini Stamp',
  description: 'Co si u nás můžete koupit, jak vytvořit Kreativní arch, jaké jsou možnosti dopravy, osobního odběru, platby a jak dlouho trvá výroba.',
};

export default function JakNakupovatPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: 'Jak nakupovat' }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-[48px] md:py-[72px] lg:py-[96px] text-center">
        <p className="style-label text-primary uppercase tracking-widest mb-4">Váš průvodce nákupem</p>
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">Jak u nás nakupovat</h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto">
          Od výběru známek a vlastního Kreativního archu přes dopravu a osobní odběr až po platbu —
          všechno důležité na jednom místě.
        </p>
      </section>

      {/* ——— CO SI MŮŽETE KOUPIT ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-3">Co si u nás můžete koupit</h2>
          <p className="style-body text-secondary/50 text-center mb-12 md:mb-16">
            Čtyři kategorie produktů pro sběratele i milovníky originálních dárků.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex gap-5 p-6 rounded-[4px] border border-white/5 bg-[#0F172A] hover:border-white/10 transition-colors"
              >
                <div className="shrink-0 w-12 h-12 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="style-h4 mb-1">{cat.title}</h3>
                  <p className="style-body text-secondary/60">{cat.text}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 md:mt-16 p-6 md:p-8 rounded-[4px] border border-white/5 bg-[#0F172A] text-center sm:text-left">
            <div>
              <h3 className="style-h4 mb-1">Chcete arch s vlastními fotkami?</h3>
              <p className="style-body text-secondary/60">
                Zjistěte, jak Kreativní arch funguje a co všechno si do něj můžete přidat.
              </p>
            </div>
            <Link href="/co-je-kreativni-arch" className="shrink-0">
              <Button variant="outlined" arrow="right">Zjistit více</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ——— DOPRAVA A OSOBNÍ ODBĚR ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-3">Doprava a osobní odběr</h2>
          <p className="style-body text-secondary/50 text-center mb-12 md:mb-16">
            Vyberte si způsob doručení, který vám vyhovuje.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {shippingOptions.map((opt) => (
              <div key={opt.title} className="p-6 rounded-[4px] border border-white/5 bg-[#0B1120]">
                <div className="w-12 h-12 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {opt.icon}
                </div>
                <h3 className="style-h4 mb-1">{opt.title}</h3>
                <p className="style-body-bold text-primary mb-2">{opt.price}</p>
                <p className="style-body text-secondary/60">{opt.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— DOBA VÝROBY ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-3">Jak dlouho to trvá</h2>
          <p className="style-body text-secondary/50 text-center mb-12 md:mb-16">
            Dodací lhůta se liší podle toho, jestli objednáváte skladem, nebo na míru.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-[760px] mx-auto">
            {deliveryTimes.map((item) => (
              <div key={item.title} className="p-6 rounded-[4px] border border-white/5 bg-[#0F172A]">
                <div className="w-12 h-12 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="style-h4 mb-1">{item.title}</h3>
                <p className="style-body-bold text-primary mb-2">{item.time}</p>
                <p className="style-body text-secondary/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— PLATBA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-3">Jak zaplatit</h2>
          <p className="style-body text-secondary/50 text-center mb-12 md:mb-16">
            Vyberte si platbu, která vám vyhovuje.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-[760px] mx-auto">
            {paymentOptions.map((opt) => (
              <div key={opt.title} className="flex gap-5 p-6 rounded-[4px] border border-white/5 bg-[#0B1120]">
                <div className="shrink-0 w-12 h-12 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                  {opt.icon}
                </div>
                <div>
                  <h3 className="style-h4 mb-1">{opt.title}</h3>
                  <p className="style-body text-secondary/60">{opt.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">Máte všechny informace?</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            Pojďme na to — vyberte si známky, archy nebo plakety a objednejte během pár minut.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button arrow="right">Přejít do obchodu</Button>
            </Link>
            <Link href="/kontakt">
              <Button variant="outlined" arrow="right">Mám ještě dotaz</Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
