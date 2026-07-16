import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';

const categories = [
  {
    href: '/kategorie/znamky',
    title: 'Poštovní známky',
    text: 'Sběratelské i klasické známky s českou a evropskou historií, uměním nebo přírodou.',
    image: '/images/jak-nakupovat_znamky.jpg',
  },
  {
    href: '/vytvorit-arch',
    title: 'Kreativní archy',
    text: 'Arch ze skutečných poštovních známek doplněný o vaše vlastní fotografie a text.',
    image: '/images/jak-nakupovat_kreativni-archy.jpg',
  },
  {
    href: '/kategorie/fdc',
    title: 'First Day Cover (FDC)',
    text: 'Obálky prvního dne vydání se známkou a razítkem k datu, kdy známka poprvé vyšla.',
    image: '/images/jak-nakupovat_FDC.jpg',
  },
  {
    href: '/kategorie/plakety',
    title: 'Dárkové plakety',
    text: 'Reprezentativní plakety k darování nebo jako doplněk sběratelské kolekce.',
    image: '/images/jak-nakupovat_plakety.jpg',
  },
];

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
  },
  {
    title: 'Bankovní převod',
    text: 'Platební pokyny pošleme e-mailem hned po dokončení objednávky. Objednávku realizujeme po připsání platby na náš účet.',
  },
];

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
  title: 'Jak nakupovat | Gemini Stamp',
  description: 'Co si u nás můžete koupit, jaké jsou možnosti dopravy, osobního odběru, platby a jak dlouho trvá výroba.',
};

function Row({
  index,
  title,
  price,
  text,
  href,
}: {
  index?: string;
  title: string;
  price?: string;
  text: string;
  href?: string;
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

function CategoryImage({
  src,
  alt,
  className = 'w-full',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`${className} relative min-w-0 min-h-0 aspect-[4/3] rounded-[4px] overflow-hidden`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-cover" />
    </div>
  );
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
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">Co si u nás můžete koupit</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Čtyři kategorie produktů pro sběratele i milovníky originálních dárků.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat, i) => (
              <Link key={cat.href} href={cat.href} className="group flex flex-col items-center text-center">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-3 shrink-0">
                  {i + 1}
                </div>
                <h3 className="style-h3 mb-4 group-hover:text-primary transition-colors">{cat.title}</h3>
                <CategoryImage src={cat.image} alt={cat.title} className="w-[80%] mb-4" />
                <p className="style-body text-secondary/60">{cat.text}</p>
              </Link>
            ))}
          </div>

          <p className="style-body text-secondary/60 text-center mt-10 md:mt-12">
            Chcete arch s vlastními fotkami?{' '}
            <Link href="/co-je-kreativni-arch" className="style-body-bold text-primary hover:underline">
              Zjistěte, jak Kreativní arch funguje →
            </Link>
          </p>
        </div>
      </section>

      {/* ——— DOPRAVA A OSOBNÍ ODBĚR ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">Doprava a osobní odběr</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Vyberte si způsob doručení, který vám vyhovuje.
          </p>

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
          <h2 className="style-h2 text-center mb-4">Jak dlouho to trvá?</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Dodací lhůta se liší podle toho, jestli objednáváte produkty skladem, nebo vytváříte Kreativní arch.
          </p>

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
          <h2 className="style-h2 text-center mb-4">Jak zaplatit</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            Vyberte si způsob platby, který vám vyhovuje. Platbu kartou potvrdíme okamžitě.
          </p>

          <div className="max-w-[640px] mx-auto">
            {paymentOptions.map((opt) => (
              <Row key={opt.title} title={opt.title} text={opt.text} />
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
