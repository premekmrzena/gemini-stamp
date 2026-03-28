import Hero from '@/components/Hero';
import ProductList from '@/components/ProductList';
import { supabase } from '@/lib/supabase'; // Import našeho připojení k databázi
// TÍMTO ŘÁDKEM VYPNEME CACHOVÁNÍ - web bude vždy 100% aktuální
export const revalidate = 0;

// Přidali jsme klíčové slovo 'async', abychom mohli čekat (await) na data z databáze
export default async function Home() {
  
  // Zde je to kouzlo: stáhneme všechny aktivní produkty z naší nové tabulky
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true) // Chceme jen ty, co nemají skrytou viditelnost
    .order('created_at', { ascending: false }); // Seřadíme od nejnovějších

  if (error) {
    console.error('Chyba při načítání produktů:', error);
  }

  return (
    // Zde je to kouzlo: gap se stará o mezery MEZI komponentami, py se stará o okraje nahoře a dole
    <main className="flex flex-col bg-[#0F172A] py-[32px] md:py-[54px] lg:py-[64px] gap-[44px] md:gap-[60px] lg:gap-[64px] w-full min-h-screen">
      <Hero />
      
      {/* Předáme stažené produkty do komponenty ProductList */}
      <ProductList products={products || []} />
    </main>
  );
}