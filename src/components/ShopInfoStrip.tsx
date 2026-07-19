import Link from 'next/link';

const items = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Doprava',
    text: 'Do celého světa',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Osobní odběr',
    text: 'Zdarma v Praze',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Rychlá výroba',
    text: '2–7 pracovních dnů',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Bezpečná platba',
    text: 'Kartou nebo převodem',
  },
];

export default function ShopInfoStrip() {
  return (
    <section className="w-full">
      <div className="layout-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <Link
              key={item.title}
              href="/jak-nakupovat"
              className="flex items-center gap-3 bg-black500 rounded px-4 py-3 hover:bg-black400 transition-colors"
            >
              <div className="shrink-0 text-success">
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="style-body-bold text-secondary truncate">{item.title}</span>
                <span className="style-label text-secondary/60 truncate">{item.text}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
