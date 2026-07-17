import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';

const contactRows = [
  {
    title: 'E-mail',
    text: 'info@mycreativestamp.com',
    href: 'mailto:info@mycreativestamp.com',
  },
  {
    title: 'Odběrné místo',
    text: 'Jindřišská 126/15, 110 00 Praha 1',
  },
  {
    title: 'Sídlo',
    text: 'My Creative Stamp s.r.o., Václavské náměstí 1, 110 00 Praha 1',
  },
  {
    title: 'IČ / DIČ',
    text: '12345678 / CZ12345678',
  },
  {
    title: 'Číslo účtu',
    text: '123456789/0100',
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

function Row({
  title,
  price,
  text,
  href,
}: {
  title: string;
  price?: string;
  text: string;
  href?: string;
}) {
  const inner = (
    <div className="flex-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className={`style-h4 ${href ? 'group-hover:text-primary transition-colors' : ''}`}>{title}</h3>
        {price && <span className="style-body-bold text-primary">{price}</span>}
      </div>
      <p className="style-body text-secondary/60 mt-1">{text}</p>
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
          <h2 className="style-h2 text-center mb-4">Kontaktní údaje</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Napište nám e-mailem, nebo si zjistěte fakturační údaje.
          </p>

          <div className="max-w-[640px] mx-auto">
            {contactRows.map((row) => (
              <Row key={row.title} title={row.title} text={row.text} href={row.href} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— PROVOZNÍ DOBA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">Provozní doba zákaznické podpory</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Na e-maily odpovídáme v pracovní dny.
          </p>

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
