import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';
import PurchaseCategoriesSection from '@/components/PurchaseCategoriesSection';

const shippingOptions = [
  {
    title: 'Osobní odběr (Praha)',
    price: 'Zdarma',
    text: 'Vyzvednutí na adrese Jindřišská 126/15, Praha 1.',
  },
  {
    title: 'Česká republika',
    price: '40–120 Kč',
    text: 'Cena podle hmotnosti zásilky — obyčejné psaní, doporučené psaní nebo balíček.',
  },
  {
    title: 'Mezinárodní doprava',
    price: '150–300 Kč',
    text: 'Zemi doručení zvolíte při objednávce, cena záleží na hmotnosti zásilky.',
  },
];

const paymentOptions = [
  {
    title: 'Online platba kartou',
    text: 'Rychlá a bezpečná platba přes oblíbenou platební bránu Stripe, objednávku i platbu potvrdíme okamžitě.',
    logos: true,
  },
  {
    title: 'Bankovní převod',
    text: 'Platební pokyny pošleme e-mailem hned po dokončení objednávky. Objednávku realizujeme po připsání platby na náš účet.',
  },
];

function PayBadge({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-black300/30 text-black300 style-label font-semibold">
      {icon}
      {children}
    </span>
  );
}

function ApplePayBadge() {
  return (
    <PayBadge
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 5.8c1.6-1.9 1.4-3.9 1.4-3.9s-1.9.1-3.3 1.7c-1.3 1.4-1.5 3.3-1.5 3.3s1.9.1 3.4-1.1z" />
          <path d="M17.6 12.5c0-2.9 2.4-4.3 2.5-4.4-1.4-2-3.5-2.3-4.2-2.3-1.8-.2-3.5 1-4.4 1-.9 0-2.3-1-3.8-1-2 0-3.8 1.1-4.8 2.9-2.1 3.6-.5 8.9 1.5 11.8 1 1.4 2.1 3 3.6 2.9 1.5-.1 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.5-2.8.9-1.3 1.5-2.7 1.6-2.8-1.7-.7-3.5-3.6-3.9-6.3z" />
        </svg>
      }
    >
      Pay
    </PayBadge>
  );
}

function GooglePayBadge() {
  return (
    <PayBadge
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12a8 8 0 1 1-2.9-6.2" />
          <path d="M20 12h-7" />
        </svg>
      }
    >
      Pay
    </PayBadge>
  );
}

const deliveryTimes = [
  {
    title: 'Standardní objednávka',
    price: '1–2 pracovních dnů',
    text: 'Od potvrzení objednávky do expedice.',
  },
  {
    title: 'Kreativní arch na míru',
    price: '1–5 pracovních dnů',
    text: 'Delší lhůta je daná tiskem a kompletací archu s vašimi fotografiemi.',
  },
];

export const metadata = {
  title: 'Jak nakupovat',
  description: 'Co si u nás můžete koupit, jaké jsou možnosti dopravy, osobního odběru, platby a jak dlouho trvá výroba.',
  alternates: { canonical: '/jak-nakupovat' },
};

function Row({
  index,
  title,
  price,
  text,
  href,
  children,
}: {
  index?: string;
  title: string;
  price?: string;
  text: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const inner = (
    <>
      {index && <span className="style-label text-primary/40 sm:w-8 sm:pt-1 shrink-0">{index}</span>}
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className={`style-h4 ${href ? 'group-hover:text-primary transition-colors' : ''}`}>{title}</h3>
          {price && <span className="style-body-bold text-primary">{price}</span>}
        </div>
        <p className="style-body text-secondary/60 mt-1">{text}</p>
        {children}
      </div>
    </>
  );

  const rowClasses = 'flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-8 py-6 border-b border-white/10 last:border-b-0';

  if (href) {
    return (
      <Link href={href} className={`group block ${rowClasses}`}>
        {inner}
      </Link>
    );
  }

  return <div className={rowClasses}>{inner}</div>;
}

export default function JakNakupovatPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: 'Jak nakupovat' }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-8 md:py-12 text-center">
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">Jak u nás můžete nakupovat?</h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto">
          Co si u nás můžete koupit a jak probíhá výroba, doprava a platba? Zde najdete všechny potřebné informace na jednom místě.
        </p>
      </section>

      {/* ——— CO SI MŮŽETE KOUPIT ——— */}
      <section className="border-t border-white/5 bg-[#0B1120] py-[48px] md:py-[64px] lg:py-[80px]">
        <PurchaseCategoriesSection />
      </section>

      {/* ——— DOPRAVA A OSOBNÍ ODBĚR ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">Doprava a osobní odběr</h2>

          <div className="max-w-[640px] mx-auto">
            {shippingOptions.map((opt) => (
              <Row key={opt.title} title={opt.title} price={opt.price} text={opt.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— DOBA VÝROBY ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">Jak dlouho to trvá?</h2>

          <div className="max-w-[640px] mx-auto">
            {deliveryTimes.map((item) => (
              <Row key={item.title} title={item.title} price={item.price} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— PLATBA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">Jak zaplatit?</h2>

          <div className="max-w-[640px] mx-auto">
            {paymentOptions.map((opt) => (
              <Row key={opt.title} title={opt.title} text={opt.text}>
                {opt.logos && (
                  <div className="flex items-center gap-2 mt-3">
                    <ApplePayBadge />
                    <GooglePayBadge />
                  </div>
                )}
              </Row>
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
