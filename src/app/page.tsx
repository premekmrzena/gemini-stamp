import Hero from '@/components/Hero';

export default function Home() {
  return (
    // Jelikož už máme pozadí hlavičky a patičky vyřešené v layoutu,
    // na homepage stačí jen vložit naše sekce.
    <main className="flex flex-col min-h-screen bg-[#0F172A]">
      <Hero />
      
      {/* Další sekce (např. seznam produktů) přijdou sem později */}
    </main>
  );
}