import Link from 'next/link';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';

const faqs = [
  {
    question: 'Jak dlouho trvá výroba a doručení kreativního archu?',
    answer:
      'Kreativní arch na míru vyrobíme do 1–5 pracovních dnů od potvrzení objednávky a nahrání fotek. Doba doručení pak závisí na zvoleném způsobu dopravy — v Česku obvykle 1–3 dny, do zahraničí podle destinace.',
  },
  {
    question: 'Jaké platební metody přijímáte?',
    answer:
      'Platit můžete online kartou přes platební bránu (platba i objednávka se potvrdí okamžitě), nebo bankovním převodem — platební pokyny pošleme e-mailem hned po dokončení objednávky.',
  },
  {
    question: 'Můžu si objednávku vyzvednout osobně?',
    answer:
      'Ano, osobní odběr je zdarma na adrese Jindřišská 126/15, Praha 1. Jakmile bude objednávka připravená k vyzvednutí, dáme vám vědět e-mailem.',
  },
];

export const metadata = {
  title: 'Časté otázky',
  description: 'Odpovědi na nejčastější otázky ohledně výroby, dopravy a platby v e-shopu My Creative Stamp.',
  alternates: { canonical: '/faq' },
};

function FaqRow({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="py-6 border-b border-white/10 last:border-b-0">
      <h3 className="style-h4 mb-1">{question}</h3>
      <p className="style-body text-secondary/60">{answer}</p>
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: 'Časté otázky' }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-8 md:py-12 text-center">
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">Časté otázky</h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto">
          Odpovědi na to, co nás zákazníci ptají nejčastěji. Pokud jste svou odpověď nenašli, ozvěte se nám.
        </p>
      </section>

      {/* ——— FAQ ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="max-w-[640px] mx-auto">
            {faqs.map((item) => (
              <FaqRow key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">Nenašli jste odpověď?</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            Napište nám a rádi vám poradíme s čímkoli ohledně objednávky nebo výroby.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/kontakt">
              <Button arrow="right">Kontaktujte nás</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
