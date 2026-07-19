import Image from 'next/image';
import Link from 'next/link';
import { Paintbrush } from 'lucide-react';

const stampCategories = [
  {
    title: 'Česká a evropská historie',
    text: 'Panovníci, události, milníky které formovaly západní civilizaci.',
    image: '/images/kreativni-archy_komponenta01.png',
  },
  {
    title: 'Světoznámí umělci',
    text: 'Alfons Mucha, Kupka, Filla a jejich umělecká díla.',
    image: '/images/kreativni-archy_komponenta02.png',
  },
  {
    title: 'Památky a architektura',
    text: 'Praha, Český Krumlov, Telč, Karlův most. Ikony české architektury.',
    image: '/images/kreativni-archy_komponenta03.png',
  },
  {
    title: 'Světové kulturní dědictví',
    text: 'Hudba, poezie, divadlo, bohatství, které duchovně formovalo Evropu.',
    image: '/images/kreativni-archy_komponenta04.png',
  },
];

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
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-contain" />
    </div>
  );
}

// Sdílený pás "Kreativní arch s kouskem historie" - žije na /co-je-kreativni-arch
// (obalený section+border tam na místě) i na homepage nad ProductList (bez
// section wrapperu, mezera řeší gap na homepage), viz docs pro rozhodnutí.
export default function StampCategoriesSection() {
  return (
    <div className="layout-container">
      <h2 className="style-h2 text-secondary text-center mb-4">Kreativní arch s kouskem historie</h2>
      <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-8">
        Poštovní známky na archu jsou miniaturní okna do světa kultury, vědy a umění. Na Kreativním archu
        se setkáte s díly, která přežila staletí — a nyní ožijí vedle vašich vlastních fotek.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stampCategories.map((cat, i) => (
          <div key={i} className="flex flex-col items-center text-center p-6 rounded-[4px] border border-white/15 bg-[#0B1120]">
            <h3 className="style-h3 text-secondary mb-4">{cat.title}</h3>
            <CategoryImage src={cat.image} alt={cat.title} className="w-[80%] mb-4" />
            <p className="style-body text-secondary/60 mb-4">{cat.text}</p>
            <Link
              href="/vytvorit-arch"
              className="group/btn style-body font-bold flex items-center justify-center gap-2 p-2 mt-auto text-[#FF6B35] hover:text-[#FF7F51] cursor-pointer"
            >
              <Paintbrush size={18} className="group-hover/btn:scale-110 transition-transform" />
              Prozkoumat šablony
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
