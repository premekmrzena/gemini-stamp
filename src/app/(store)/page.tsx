import Hero from '@/components/Hero';
import ShopInfoStrip from '@/components/ShopInfoStrip';
import ReviewStrip from '@/components/ReviewStrip';
import ProductList from '@/components/ProductList';
import TrustBadges from '@/components/TrustBadges';
import { supabase } from '@/lib/supabase'; // Import našeho připojení k databázi
export const revalidate = 60;

// Přidali jsme klíčové slovo 'async', abychom mohli čekat (await) na data z databáze
export default async function Home() {
  
  // Zde je to kouzlo: stáhneme všechny aktivní produkty z naší nové tabulky
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('show_on_homepage', true)
    .order('tag_top', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false }); // Seřadíme od nejnovějších

  if (error) {
    console.error('Chyba při načítání produktů:', error);
  }

  return (
    // Zde je to kouzlo: gap se stará o mezery MEZI komponentami, py se stará o okraje nahoře a dole
    <main className="flex flex-col bg-[#0F172A] py-[32px] md:py-[54px] lg:py-[64px] gap-[44px] md:gap-[60px] lg:gap-[64px] w-full min-h-screen">
      <Hero />
      <ShopInfoStrip />
      {/* Předáme stažené produkty do komponenty ProductList */}
      <ProductList products={products || []} title="Skvosty, které můžete mít" showCategoryLinks />
      <ReviewStrip />
      <div className="layout-container">
        <TrustBadges />
      </div>
    </main>
  );
}