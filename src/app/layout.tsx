import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext'; 

export const metadata: Metadata = {
  title: 'Creative Stamp | E-shop',
  description: 'Objevte ty nejlepší kousky pro vaši sbírku.',
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
      <body className={`${poppins.className} flex flex-col min-h-screen bg-[#0F172A]`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}