'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useBackdropClose } from '@/hooks/useBackdropClose';

type Review = {
  id: number;
  name: string;
  country: string;
  text: string;
  fullText: string;
  photo: string;
};

const reviews: Review[] = [
  {
    id: 1,
    name: 'Yuki Tanaka',
    country: 'Japonsko',
    text: 'Krásná vzpomínka na Českou republiku!',
    fullText: 'Krásná vzpomínka na Českou republiku! Po návratu z Prahy jsem si nechala vytvořit arch z vlastních fotek z cesty a spojení s tradiční ruční rytinou českých známek je naprosto kouzelné. Balení dorazilo pečlivě zabalené a bez jediného poškození. Tohle si budu opatrovat celý život.',
    photo: '/images/recenze01.png',
  },
  {
    id: 2,
    name: 'Min-jun Lee',
    country: 'Korea',
    text: 'Unikátní suvenýr, dokonalé zpracování.',
    fullText: 'Unikátní suvenýr, dokonalé zpracování. Hledal jsem dárek, který nebude jen další magnetkou z obchodu se suvenýry, a tohle to bylo přesně ono. Tisk je ostrý až do nejmenšího detailu, papír příjemný na dotek a editor na webu byl jednoduchý i pro mě, i když jsem nikdy nic podobného nedělal. Určitě doporučím přátelům.',
    photo: '/images/recenze02.png',
  },
  {
    id: 3,
    name: 'Zhang Wei',
    country: 'Čína',
    text: 'Přivezla jsem domů jako dárek — všichni nadšení!',
    fullText: 'Přivezla jsem domů jako dárek — všichni nadšení! Objednala jsem hned několik kusů pro celou rodinu po návratu z Prahy, každý s jinými fotkami. Bála jsem se, že objednávka ze zahraničí bude komplikovaná, ale celý proces proběhl hladce a rychle. Teď mají všichni doma kousek naší společné cesty.',
    photo: '/images/recenze03.png',
  },
  {
    id: 4,
    name: 'Aiko Suzuki',
    country: 'Japonsko',
    text: 'Kvalita tisku výborná, doručení rychlé.',
    fullText: 'Kvalita tisku výborná, doručení rychlé. Objednávala jsem až do Japonska a přesto zásilka dorazila v pořádku a v rozumném čase. Barvy jsou živé, detaily ostré a balení dostatečně pevné na to, aby arch cestu přežil bez jediného ohnutí rohu.',
    photo: '/images/recenze04.png',
  },
  {
    id: 5,
    name: 'Hyun-soo Kim',
    country: 'Korea',
    text: 'Objednal pro celou rodinu, všichni nadšení.',
    fullText: 'Objednal pro celou rodinu, všichni nadšení. Před naším rodinným srazem jsem každému připravil vlastní arch s fotkami z výletu do Prahy. Byl to naprostý hit večera — každý dostal jedinečnou vzpomínku a nikdo nečekal, jak profesionálně to bude vypadat.',
    photo: '/images/recenze05.png',
  },
];

export default function ReviewStrip() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const modalBackdrop = useBackdropClose(() => setSelectedReview(null));

  return (
    <section className="w-full">
      <div className="layout-container">
        <h2 className="style-h2 text-secondary text-center mb-6 select-none">Recenze spokojených zákazníků</h2>
        <div className="flex gap-3 overflow-x-auto lg:overflow-hidden snap-x snap-mandatory scrollbar-hide">
          {reviews.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedReview(r)}
              className="flex items-center gap-3 shrink-0 snap-start bg-black500 hover:bg-black400 rounded px-4 py-3 min-w-[190px] lg:min-w-0 lg:flex-1 text-left cursor-pointer transition-colors"
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
            </button>
          ))}
        </div>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all"
          {...modalBackdrop}
        >
          <div
            className="bg-black400 w-full max-w-md rounded-[24px] border border-black300/30 shadow-2xl animate-[fadeIn_0.15s_ease-out] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                  <Image src={selectedReview.photo} alt={selectedReview.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="style-body-bold text-secondary truncate">{selectedReview.name}</span>
                    <span className="style-label text-black300 shrink-0">{selectedReview.country}</span>
                  </div>
                  <div className="text-[#F9B420] text-[12px] leading-none mt-1">★★★★★</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 -m-2 text-black300 hover:text-secondary hover:bg-black300/10 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <p className="style-body text-secondary/80">{selectedReview.fullText}</p>
          </div>
        </div>
      )}
    </section>
  );
}
