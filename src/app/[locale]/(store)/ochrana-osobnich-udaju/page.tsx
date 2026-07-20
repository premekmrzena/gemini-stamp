import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Ochrana osobních údajů',
  description: 'Zásady ochrany osobních údajů a informace o zpracování dat dle GDPR.',
  alternates: { canonical: '/ochrana-osobnich-udaju' },
};

const sections = [
  {
    title: '1. Správce osobních údajů',
    content: `Správcem vašich osobních údajů je společnost My Creative Stamp s.r.o., IČO: 14248328, se sídlem Václavské náměstí 1, 110 00 Praha 1 (dále jen „správce"). Kontaktní e-mail: info@mycreativestamp.com.`,
  },
  {
    title: '2. Jaké údaje zpracováváme',
    content: `Zpracováváme pouze údaje nezbytné pro splnění objednávky a provoz e-shopu:

• Identifikační a kontaktní údaje: jméno, příjmení, e-mailová adresa, telefonní číslo.
• Doručovací adresa: ulice, město, PSČ, stát.
• Platební informace: platební transakce zpracovává přímo platební brána Stripe — čísla karet ani citlivé platební údaje neukládáme.
• Fotografie a obsah Kreativního archu: fotografie, které nahrajete při tvorbě Kreativního archu, a vámi zadané texty. Tato data jsou ukládána výhradně za účelem výroby objednaného produktu.`,
  },
  {
    title: '3. Účel a právní základ zpracování',
    content: `Vaše osobní údaje zpracováváme na základě:

• Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR) — zpracování objednávky, výroba a doručení zboží, zákaznická podpora.
• Plnění právní povinnosti (čl. 6 odst. 1 písm. c) GDPR) — vedení účetnictví a daňová evidence po dobu stanovenou zákonem (10 let).
• Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR) — ochrana před podvody a technická bezpečnost.`,
  },
  {
    title: '4. Doba uchování',
    content: `Osobní údaje spojené s objednávkou uchováváme po dobu trvání smluvního vztahu a po dobu 3 let od jeho ukončení pro účely případných reklamací. Účetní doklady jsou archivovány po dobu 10 let dle zákona. Fotografie a obsah Kreativního archu mažeme do 90 dnů od doručení objednávky.`,
  },
  {
    title: '5. Příjemci a předávání dat',
    content: `Vaše osobní údaje neprodáváme ani neposkytujeme třetím stranám pro jejich marketingové účely. Údaje sdílíme pouze se zpracovateli nezbytně nutnými pro provoz:

• Přepravní společnosti (doručení zásilky).
• Stripe, Inc. (zpracování plateb).
• Supabase, Inc. (cloudová databáze a úložiště).
• Vercel, Inc. (hosting aplikace).

Všichni zpracovatelé jsou vázáni smluvní ochranou dat v souladu s GDPR.`,
  },
  {
    title: '6. Vaše práva',
    content: `Máte právo na přístup ke svým osobním údajům, jejich opravu, výmaz („právo být zapomenut"), omezení zpracování a přenositelnost. Máte rovněž právo vznést námitku proti zpracování a právo podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz).

Žádost o uplatnění práv zasílejte e-mailem na info@mycreativestamp.com. Odpovíme do 30 dnů.`,
  },
  {
    title: '7. Cookies',
    content: `Webové stránky používají technické cookies nezbytné pro fungování aplikace (přihlášení, košík). Analytické ani marketingové cookies v tuto chvíli nepoužíváme.`,
  },
  {
    title: '8. Změny zásad',
    content: `Tyto zásady mohou být průběžně aktualizovány. O zásadních změnách vás budeme informovat e-mailem. Aktuální verze je vždy dostupná na této stránce.

Platné od 1. 1. 2025.`,
  },
];

export default function OchranaOsobnichUdajuPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full min-h-screen">
      <Breadcrumbs items={[{ label: 'Ochrana osobních údajů' }]} />
      <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">

        <div className="max-w-[760px]">
          <h1 className="style-h1 mb-3">Ochrana osobních údajů</h1>
          <p className="style-body text-secondary/40 mb-14">Platné od 1. 1. 2025 · GDPR</p>

          <div className="flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.title} className="border-t border-white/5 pt-8">
                <h2 className="style-h3 mb-4">{section.title}</h2>
                {section.content.split('\n\n').map((para, i) => (
                  <p key={i} className="style-body text-secondary/60 mb-3 last:mb-0 whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
