import ProductDetail from '@/components/ProductDetail';

export default function ProductPage() {
  return (
    // Používáme stejný obal (main) jako na tvé domovské stránce, 
    // aby nám zůstalo stejné pozadí a celkové okraje webu (Cesta A)
    <main className="flex flex-col bg-[#0F172A] py-[32px] md:py-[54px] lg:py-[64px] w-full min-h-screen">
      <ProductDetail />
    </main>
  );
}