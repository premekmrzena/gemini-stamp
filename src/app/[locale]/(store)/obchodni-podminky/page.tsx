import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Obchodní podmínky',
  description: 'Obchodní podmínky internetového obchodu My Creative Stamp.',
  alternates: { canonical: '/obchodni-podminky' },
};

const sections = [
  {
    title: '1. Provozovatel a základní údaje',
    content: `Provozovatelem internetového obchodu na adrese mycreativestamp.com je společnost My Creative Stamp s.r.o., IČO: 14248328, se sídlem Václavské náměstí 1, 110 00 Praha 1 (dále jen „prodávající").

Kontaktní e-mail: info@mycreativestamp.com`,
  },
  {
    title: '2. Objednávka a uzavření smlouvy',
    content: `Objednávka zboží probíhá prostřednictvím online editoru (Kreativní arch) nebo výběrem produktu v e-shopu a jeho přidáním do košíku. Odesláním objednávky kupující potvrzuje, že se seznámil s těmito obchodními podmínkami a souhlasí s nimi.

Smlouva je uzavřena okamžikem odeslání potvrzovacího e-mailu prodávajícím. Prodávající si vyhrazuje právo odmítnout objednávku v případě vyprodání zásob nebo technické chyby.`,
  },
  {
    title: '3. Cena a platba',
    content: `Ceny v e-shopu jsou uvedeny včetně DPH. Prodávající si vyhrazuje právo na změnu cen. Pro kupujícího je závazná cena platná v okamžiku odeslání objednávky.

Platba je realizována prostřednictvím platební brány Stripe (platební karta). Objednávka je zpracována po přijetí platby.`,
  },
  {
    title: '4. Doprava a dodací lhůty',
    content: `Zboží zasíláme na adresu v České republice i do zahraničí. Standardní dodací lhůta je 3–7 pracovních dnů od potvrzení objednávky. U personalizovaných produktů (Kreativní arch) je lhůta 5–10 pracovních dnů z důvodu výroby.

Doprava je zpoplatněna dle aktuálního ceníku zobrazovaného při výběru dopravy v košíku.`,
  },
  {
    title: '5. Odstoupení od smlouvy',
    content: `Kupující — spotřebitel má právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů od převzetí zboží, s výjimkou zboží vyrobeného na míru (personalizované produkty, jako je Kreativní arch s vlastními fotografiemi), u nichž právo na odstoupení nevzniká dle § 1837 písm. d) občanského zákoníku.

Odstoupení zasílejte e-mailem na info@mycreativestamp.com. Zboží vraťte nepoškozené na vlastní náklady.`,
  },
  {
    title: '6. Reklamace a odpovědnost za vady',
    content: `Na veškeré zboží se vztahuje záruční doba 24 měsíců. Reklamaci uplatňujte e-mailem s fotografií vady a číslem objednávky. Reklamace bude vyřízena nejpozději do 30 dnů.

V případě oprávněné reklamace máte nárok na opravu, výměnu nebo vrácení peněz.`,
  },
  {
    title: '7. Ochrana osobních údajů',
    content: `Zpracování osobních údajů se řídí Zásadami ochrany osobních údajů dostupnými na stránce /ochrana-osobnich-udaju.`,
  },
  {
    title: '8. Závěrečná ustanovení',
    content: `Tyto obchodní podmínky jsou platné od 1. 1. 2025. Prodávající si vyhrazuje právo podmínky kdykoli změnit. Vztahy neupravené těmito podmínkami se řídí zákonem č. 89/2012 Sb., občanský zákoník, a zákonem č. 634/1992 Sb., o ochraně spotřebitele.

Případné spory lze řešit mimosoudně prostřednictvím České obchodní inspekce (www.coi.cz).`,
  },
];

export default function ObchodniPodminkyPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full min-h-screen">
      <Breadcrumbs items={[{ label: 'Obchodní podmínky' }]} />
      <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">

        <div className="max-w-[760px]">
          <h1 className="style-h1 mb-3">Obchodní podmínky</h1>
          <p className="style-body text-secondary/40 mb-14">Platné od 1. 1. 2025</p>

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
