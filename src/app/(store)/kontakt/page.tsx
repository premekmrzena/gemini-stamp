import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Kontakt | Gemini Stamp',
  description: 'Kontaktujte nás — rádi zodpovíme vaše dotazy ohledně Kreativního archu.',
};

export default function KontaktPage() {
  return (
    <main className="bg-[#0F172A] text-secondary w-full min-h-screen">
      <Breadcrumbs items={[{ label: 'Kontakt' }]} />
      <div className="layout-container py-[48px] md:py-[72px] lg:py-[96px]">

        <div className="max-w-[720px]">
          <p className="style-label text-primary uppercase tracking-widest mb-4">Jsme tu pro vás</p>
          <h1 className="style-h1 mb-5">Kontakt</h1>
          <p className="style-perex text-secondary/60 mb-14">
            Máte dotaz k objednávce, reklamaci nebo jen chcete vědět víc o Kreativním archu?
            Napište nám — odpovíme zpravidla do jednoho pracovního dne.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">

          <div className="p-6 rounded-[4px] border border-white/5 bg-[#0B1120]">
            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="style-h4 mb-1">E-mail</h2>
            <a
              href="mailto:info@gemini-stamp.cz"
              className="style-body text-primary hover:text-primary-hover transition-colors"
            >
              info@gemini-stamp.cz
            </a>
          </div>

          <div className="p-6 rounded-[4px] border border-white/5 bg-[#0B1120]">
            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h2 className="style-h4 mb-1">Sídlo</h2>
            <p className="style-body text-secondary/60">
              Gemini Stamp s.r.o.<br />
              Václavské náměstí 1<br />
              110 00 Praha 1
            </p>
          </div>

          <div className="p-6 rounded-[4px] border border-white/5 bg-[#0B1120]">
            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h2 className="style-h4 mb-1">IČO</h2>
            <p className="style-body text-secondary/60">
              12345678<br />
              DIČ: CZ12345678
            </p>
          </div>

        </div>

        <div className="max-w-[640px] p-6 md:p-8 rounded-[4px] border border-white/5 bg-[#0B1120]">
          <h2 className="style-h3 mb-1">Provozní doba zákaznické podpory</h2>
          <p className="style-body text-secondary/50 mb-6">Na e-maily odpovídáme v pracovní dny.</p>
          <div className="flex flex-col gap-3">
            {[
              { day: 'Pondělí – pátek', hours: '9:00 – 17:00' },
              { day: 'Sobota – neděle', hours: 'Zavřeno' },
            ].map(({ day, hours }) => (
              <div key={day} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                <span className="style-body text-secondary/70">{day}</span>
                <span className="style-body-bold text-secondary">{hours}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
