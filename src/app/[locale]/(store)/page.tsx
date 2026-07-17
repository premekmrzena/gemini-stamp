import Hero from '@/components/Hero';
import ShopInfoStrip from '@/components/ShopInfoStrip';
import ReviewStrip from '@/components/ReviewStrip';
import TrustBadges from '@/components/TrustBadges';
import StampCategoriesSection from '@/components/StampCategoriesSection';
import PurchaseCategoriesSection from '@/components/PurchaseCategoriesSection';

// Homepage title/description dědí z výchozí hodnoty v app/layout.tsx (title.default).
export const metadata = {
  alternates: { canonical: '/' },
};

export const revalidate = 60;

export default function Home() {
  return (
    // Zde je to kouzlo: gap se stará o mezery MEZI komponentami, py se stará o okraje nahoře a dole
    <main className="flex flex-col bg-[#0F172A] py-[32px] md:py-[54px] lg:py-[64px] gap-[44px] md:gap-[60px] lg:gap-[64px] w-full min-h-screen">
      <Hero />
      <ShopInfoStrip />
      <StampCategoriesSection />
      {/* ProductList na HP dočasně skrytý (probíhá rozhodování o rozvržení pásů) */}
      <PurchaseCategoriesSection />
      <ReviewStrip />
      <div className="layout-container">
        <TrustBadges />
      </div>
    </main>
  );
}