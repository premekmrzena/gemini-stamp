import Hero from '@/components/Hero';
import ProductList from '@/components/ProductList';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0F172A]">
      <Hero />
      
      {/* Tady renderujeme náš nový seznam produktů, který si sám sáhne do databáze */}
      <ProductList />
    </main>
  );
}