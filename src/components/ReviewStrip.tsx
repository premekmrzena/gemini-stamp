const reviews = [
  { id: 1, name: 'Yuki Tanaka', country: 'Japonsko', text: 'Krásná vzpomínka na Českou republiku!', photo: '/images/recenze01.png' },
  { id: 2, name: 'Min-jun Lee', country: 'Korea', text: 'Unikátní suvenýr, dokonalé zpracování.', photo: '/images/recenze02.png' },
  { id: 3, name: 'Zhang Wei', country: 'Čína', text: 'Přivezla jsem domů jako dárek — všichni nadšení!', photo: '/images/recenze03.png' },
  { id: 4, name: 'Aiko Suzuki', country: 'Japonsko', text: 'Kvalita tisku výborná, doručení rychlé.', photo: '/images/recenze04.png' },
  { id: 5, name: 'Hyun-soo Kim', country: 'Korea', text: 'Objednal pro celou rodinu, všichni nadšení.', photo: '/images/recenze05.png' },
];

import Image from 'next/image';

export default function ReviewStrip() {
  return (
    <section className="w-full">
      <div className="layout-container">
        <div className="flex gap-3 overflow-x-auto lg:overflow-hidden snap-x snap-mandatory scrollbar-hide">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 shrink-0 snap-start bg-black500 rounded px-4 py-3 min-w-[190px] lg:min-w-0 lg:flex-1"
            >
              <div className="relative w-9 h-9 rounded overflow-hidden shrink-0">
                <Image src={r.photo} alt={r.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="style-body-bold text-secondary truncate">{r.name}</span>
                  <span className="style-label text-black300 shrink-0">{r.country}</span>
                </div>
                <div className="text-[#F9B420] text-[10px] leading-none mb-1">★★★★★</div>
                <p className="style-label text-secondary/60 truncate">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
