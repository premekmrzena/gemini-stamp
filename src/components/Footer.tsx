import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    // Používáme stejnou barvu pozadí jako v hlavičce. Odsazení odpovídá tvému návrhu.
    <footer className="bg-[#1E2330] text-white px-4 lg:px-[84px] py-[40px] w-full mt-auto">
      
      {/* Vnitřní kontejner - na mobilu sloupce, na desktopu řádek s mezerou mezi stranami */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-0">
        
        {/* Levá část - Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image 
              src="/images/creative-stamp_logo.svg" 
              alt="Creative Stamp Logo" 
              width={250} 
              height={69} 
              className="w-[200px] md:w-[250px] h-auto" 
            />
          </Link>
        </div>

        {/* Pravá část - Odkazy a Sociální sítě */}
        <div className="flex flex-col items-center md:items-end gap-[24px]">
          
          {/* Navigace patičky */}
          <nav className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-0 text-[14px] lg:text-[15px] font-medium tracking-[-0.02em] leading-none text-gray-300">
            <Link href="/kontakt" className="md:pr-4 hover:text-white transition">Kontakt</Link>
            <span className="hidden md:block w-px h-4 bg-white/30"></span> {/* Vertikální oddělovač (skrytý na mobilu) */}
            
            <Link href="/obchodni-podminky" className="md:px-4 hover:text-white transition">Obchodní podmínky</Link>
            <span className="hidden md:block w-px h-4 bg-white/30"></span>
            
            <Link href="/ochrana-osobnich-udaju" className="md:pl-4 hover:text-white transition text-center">Ochrana osobních údajů</Link>
          </nav>

          {/* Sociální sítě */}
          <div className="flex items-center gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition">
              <Image src="/images/Instagram.svg" alt="Instagram" width={24} height={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition">
              <Image src="/images/Facebook.svg" alt="Facebook" width={24} height={24} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition">
              <Image src="/images/Youtube.svg" alt="YouTube" width={28} height={28} /> {/* YouTube ikona bývá občas pocitově menší, dal jsem jí 28px pro vyrovnání */}
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}