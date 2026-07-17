import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-black500 text-secondary border-t border-black300/30">
      <div className="layout-container py-[40px] flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-0">

        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/images/creative-stamp_logo.svg"
              alt="My Creative Stamp Logo"
              width={250}
              height={69}
              className="h-[40px] w-auto md:h-[52px] lg:h-[62px]"
            />
          </Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-[24px]">
          <nav className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-0 text-[14px] lg:text-[15px] font-medium tracking-[-0.02em] leading-none text-black200">
            <Link href="/jak-nakupovat" className="md:pr-4 hover:text-primary-hover transition">Jak nakupovat</Link>
            <span className="hidden md:block w-px h-4 bg-secondary/30" />
            <Link href="/faq" className="md:px-4 hover:text-primary-hover transition">FaQ</Link>
            <span className="hidden md:block w-px h-4 bg-secondary/30" />
            <Link href="/kontakt" className="md:px-4 hover:text-primary-hover transition">Kontakt</Link>
            <span className="hidden md:block w-px h-4 bg-secondary/30" />
            <Link href="/obchodni-podminky" className="md:px-4 hover:text-primary-hover transition">Obchodní podmínky</Link>
            <span className="hidden md:block w-px h-4 bg-secondary/30" />
            <Link href="/ochrana-osobnich-udaju" className="md:pl-4 hover:text-primary-hover transition text-center">Ochrana osobních údajů</Link>
          </nav>

          <div className="flex items-center gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition">
              <Image src="/images/Instagram.svg" alt="Instagram" width={24} height={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition">
              <Image src="/images/Facebook.svg" alt="Facebook" width={24} height={24} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition">
              <Image src="/images/Youtube.svg" alt="YouTube" width={28} height={28} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
