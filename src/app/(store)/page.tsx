import Hero from '@/components/Hero';
import ProductList from '@/components/ProductList';

export default function Home() {
  return (
    // Zde je to kouzlo: gap se stará o mezery MEZI komponentami, py se stará o okraje nahoře a dole
    <main className="flex flex-col bg-[#0F172A] py-[32px] md:py-[54px] lg:py-[64px] gap-[44px] md:gap-[60px] lg:gap-[64px] w-full min-h-screen">
      <Hero />
      <ProductList />
    </main>
  );
}