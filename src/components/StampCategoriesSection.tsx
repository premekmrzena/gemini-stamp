import Image from 'next/image';

const stampCategories = [
  {
    title: 'Česká a evropská historie',
    text: 'Panovníci, události, milníky. Poštovní známky jsou jedinečnými doklady doby, která formovala západní civilizaci.',
    image: 'https://ryp0pkqxrbus98k2.public.blob.vercel-storage.com/products/znamky/stamp_Chram-sv-Vita_dashed_647-Fa6wuxNzh36u296m1dzJHkcTAKCf8h.png',
  },
  {
    title: 'Světoznámí umělci',
    text: 'Kupka, Alfons Mucha, Filla. Umělecká díla přetavená do miniaturních obrazů na poštovních známkách.',
    image: 'https://ryp0pkqxrbus98k2.public.blob.vercel-storage.com/products/znamky/stamp_Ceske-goticke-malby-drak_dashed_1080-Gs7QjWmCkmoVKx6M6ZwRTHwbRW3r70.png',
  },
  {
    title: 'Památky a architektura',
    text: 'Praha, Český Krumlov, Telč, Karlův most. Ikony architektury zachycené na sběratelských exemplářích.',
    image: 'https://ryp0pkqxrbus98k2.public.blob.vercel-storage.com/products/znamky/stamp_Karluv-most_dashed_1080-nMJ8qo9SCdtYZ6KCAqhpREHEwbYYWR.png',
  },
  {
    title: 'Světové kulturní dědictví',
    text: 'Hudba, poezie, divadlo, tradiční řemesla, folklor. Bohatství, které stojí za to uchovat a předávat dalším generacím dál.',
    image: 'https://ryp0pkqxrbus98k2.public.blob.vercel-storage.com/products/znamky/stamp_Shakespeare-Elf_dashed_1080-jO3aeKfJG19uRHCQPxfjWH5Fl7W1lc.png',
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
            <p className="style-body text-secondary/60">{cat.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
