import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';
import { BANK_ACCOUNT_NUMBER, BANK_NAME, BANK_IBAN, BANK_SWIFT } from '@/lib/czechQrPayment';

const contactRows = [
  {
    title: 'Odběrné místo',
    text: 'Jindřišská 126/15, 110 00 Praha 1',
    map: true,
    icon: 'home',
  },
  {
    title: 'Kontaktní údaje',
    lines: [
      { label: 'E-mail', value: 'info@mycreativestamp.com', href: 'mailto:info@mycreativestamp.com' },
      { label: 'Web', value: 'mycreativestamp.com', href: '/' },
      { label: 'Telefon', value: '+420 123 456 789', href: 'tel:+420123456789' },
    ],
    icon: 'mail',
  },
  {
    title: 'Fakturační údaje',
    text: 'DVKS s.r.o., Nad Studánkou 393, 251 01 Světice, IČ: 14248328',
    icon: 'invoice',
  },
  {
    title: 'Bankovní spojení',
    text: `Číslo účtu: ${BANK_ACCOUNT_NUMBER}\nBanka: ${BANK_NAME}\nIBAN: ${BANK_IBAN.replace(/(.{4})/g, '$1 ').trim()}\nSWIFT/BIC: ${BANK_SWIFT}`,
    icon: 'bank',
  },
];

const officeHours = [
  {
    title: 'Pondělí – pátek',
    price: '9:00 – 17:00',
    text: 'Na e-maily odpovídáme průběžně během dne.',
  },
  {
    title: 'Sobota – neděle',
    price: 'Zavřeno',
    text: 'O víkendu zákaznickou podporu nezajišťujeme.',
  },
];

export const metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte nás — rádi zodpovíme vaše dotazy ohledně Kreativního archu.',
  alternates: { canonical: '/kontakt' },
};

const contactIcons: Record<string, React.ReactNode> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  invoice: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  bank: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  ),
};

function Row({
  title,
  price,
  text,
  href,
  lines,
  icon,
  children,
}: {
  title: string;
  price?: string;
  text?: string;
  href?: string;
  lines?: { label: string; value: string; href?: string }[];
  icon?: string;
  children?: React.ReactNode;
}) {
  const inner = (
    <div className="flex-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className={`style-h4 ${href ? 'group-hover:text-primary transition-colors' : ''}`}>{title}</h3>
        {price && <span className="style-body-bold text-primary">{price}</span>}
        {icon && <span className="text-primary shrink-0 flex items-center leading-none p-0">{contactIcons[icon]}</span>}
      </div>
      {text && <p className="style-body text-secondary/60 mt-1 whitespace-pre-line">{text}</p>}
      {lines && (
        <div className="style-body text-secondary/60 mt-1 flex flex-col gap-0.5">
          {lines.map((line) => (
            <div key={line.label}>
              {line.label}:{' '}
              {line.href ? (
                <a href={line.href} className="hover:text-primary hover:underline transition-colors">
                  {line.value}
                </a>
              ) : (
                line.value
              )}
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
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

// Skutečný náhled mapy přes Google Maps embed (bez API klíče, klasické /maps?...&output=embed).
// Iframe je sám o sobě interaktivní (drag/zoom), proto odkaz na Google Maps vede jen přes lištu pod ním.
function MapPreview({ address }: { address: string }) {
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="w-full max-w-[360px] mt-3 rounded-[8px] overflow-hidden border border-black300/30 bg-black400">
      <iframe
        src={embedUrl}
        className="w-full h-[160px] grayscale-[0.3] contrast-[1.1]"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Mapa: ${address}`}
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group/map flex items-center justify-between gap-2 bg-black/70 px-3 py-2 hover:bg-black/90 transition-colors"
      >
        <span className="style-label text-secondary/80">Otevřít v Google Maps</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/80 shrink-0 group-hover/map:translate-x-0.5 transition-transform">
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </a>
    </div>
  );
}

export default function KontaktPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: 'Kontakt' }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-8 md:py-12 text-center">
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">Obraťte se na nás!</h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto">
          Máte dotaz k objednávce, reklamaci nebo jen chcete vědět víc o Kreativním archu?
          Napište nám — odpovíme zpravidla do jednoho pracovního dne.
        </p>
      </section>

      {/* ——— KONTAKTNÍ ÚDAJE ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="max-w-[640px] mx-auto">
            {contactRows.map((row) => (
              <Row key={row.title} title={row.title} text={row.text} lines={row.lines} icon={row.icon}>
                {row.map && row.text && <MapPreview address={row.text} />}
              </Row>
            ))}
          </div>
        </div>
      </section>

      {/* ——— PROVOZNÍ DOBA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">Provozní doba zákaznické podpory</h2>

          <div className="max-w-[640px] mx-auto">
            {officeHours.map((item) => (
              <Row key={item.title} title={item.title} price={item.price} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">Potřebujete poradit?</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            Napište nám na e-mail a ozveme se zpravidla do jednoho pracovního dne.
          </p>
          <Link href="mailto:info@mycreativestamp.com">
            <Button arrow="right">Napsat e-mail</Button>
          </Link>
        </div>
      </section>

    </main>
  );
}
