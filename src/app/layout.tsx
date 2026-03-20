import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // <-- Importujeme Footer

export const metadata: Metadata = {
  title: 'Creative Stamp | E-shop',
  description: 'Objevte ty nejlepší kousky pro váš šatník.',
};

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      {/* Přidal jsem flex a min-h-screen, aby patička zůstala dole i při nedostatku obsahu */}
      <body className={`${poppins.className} flex flex-col min-h-screen`}>
        <Header /> 
        
        {/* flex-grow roztáhne hlavní obsah, aby odtlačil patičku dolů */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer /> {/* <-- A tady ji vložíme */}
      </body>
    </html>
  );
}