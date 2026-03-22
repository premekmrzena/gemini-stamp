import Image from 'next/image';
import Button from '@/components/Button';

// Původní kroky - pro desktop/tablet
const desktopSteps = [
  { id: 1, title: 'Vyberte si šablonu', text: 'Vyberte si kompozici a arch se známkami, které vás oslovují.' },
  { id: 2, title: 'Nahrajte svoje fotky', text: 'Přidejte svoje fotky, které jste třeba dnes vyfotili na mobil.' },
  { id: 3, title: 'Napište vlastní text', text: 'Do vybraných šablon můžete dopsat vlastní text.' },
];

// Nové zkrácené kroky - pro mobil
const mobileSteps = [
  { id: 1, title: 'Vyber si šablonu' },
  { id: 2, title: 'Nahraj svoje fotky' },
  { id: 3, title: 'Napiš vlastní text' },
];

export default function Hero() {
  return (
    // CELKOVÝ PADDING je nyní řízen centrálně v page.tsx (Cesta A)
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px] overflow-hidden">
      
      {/* 1. Nadpis - H1 */}
      {/* ÚPRAVA: Použita globální třída style-h1 */}
      <h1 className="style-h1 text-center mb-10 lg:mb-[52px]">
        Vytvoř si vlastní arch se známkami a fotkami
      </h1>

      {/* --- DESKTOP / TABLET BLOK --- */}
      <div className="hidden md:flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-10 lg:gap-6 mx-auto w-full mb-10 lg:mb-0">
        
        {/* KROKY (Steps) */}
        <div className="order-2 lg:order-1 flex flex-row md:flex-row lg:flex-col gap-8 md:gap-4 lg:gap-8 w-full lg:w-auto lg:max-w-[320px] shrink-0 overflow-visible md:mt-0 lg:mt-0">
          {desktopSteps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center w-full">
              <div className="w-10 h-10 rounded-full bg-[#F9B420] text-[#0F172A] flex items-center justify-center font-bold text-[20px] mb-4 shrink-0">
                {step.id}
              </div>
              {/* ÚPRAVA: Použita globální třída style-h3 */}
              <h3 className="style-h3 mb-2">
                {step.title}
              </h3>
              {/* ÚPRAVA: Použita globální třída style-body */}
              <p className="style-body text-white/90 max-w-[280px]">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* OBRÁZEK (Pro desktop/tablet) */}
        <div className="order-1 lg:order-2 w-full max-w-[700px] flex justify-center shrink">
          <Image 
            src="/images/hero-image.png" 
            alt="Vytvoř si vlastní arch se známkami a fotkami" 
            width={700} 
            height={500} 
            priority
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* --- MOBIL BLOK --- */}
      
      {/* 1. OBRÁZEK (PRO MOBIL) */}
      <div className="md:hidden w-full max-w-[700px] flex justify-center mb-[32px]">
        <Image 
          src="/images/hero-image.png" 
          alt="Vytvoř si vlastní arch se známkami a fotkami" 
          width={700} 
          height={500} 
          priority
          className="w-full h-auto object-contain drop-shadow-2xl"
        />
      </div>

      {/* 2. KROKY / STEPPER (PRO MOBIL) */}
      <div className="md:hidden flex flex-row items-start justify-center gap-0 w-full mb-[32px] overflow-visible px-2">
        {mobileSteps.map((step, index) => (
          <div key={`mobile-step-${step.id}`} className="flex items-start">
            
            {/* Krok (Kolečko + Text) */}
            <div className="flex flex-col items-center text-center w-[90px] xs:w-[110px] gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F9B420] text-[#0F172A] flex items-center justify-center font-bold text-[16px] shrink-0 mb-1">
                {step.id}
              </div>
              {/* ÚPRAVA: Zde záměrně NEPOUŽÍVÁME globální styl, zachováno lokální formátování pro mobil */}
              <h3 className="text-[14px] font-medium tracking-normal leading-[1.6] text-[#FDFBF7]">
                {step.title}
              </h3>
            </div>

            {/* Šipka -> (kromě posledního kroku) */}
            {index < mobileSteps.length - 1 && (
              <div className="flex items-center justify-center w-[50px] h-8 shrink-0 overflow-visible mt-0 px-1 opacity-80">
                <Image 
                  src="/images/hand-arrow-stepper.svg" 
                  alt="->" 
                  width={50} 
                  height={15} 
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            
          </div>
        ))}
      </div>

      {/* --- TLAČÍTKA --- */}
      <div className="mt-4 md:mt-10 lg:mt-10 flex justify-center w-full">
        
        {/* Tlačítko Desktop (S dekorativní šipkou) */}
        <div className="hidden lg:inline-flex relative">
          <Image 
            src="/images/handarrow.svg" 
            alt="Ukazatel" 
            width={80} 
            height={80} 
            className="absolute -left-[95px] bottom-[14px] pointer-events-none"
          />
          <Button>Vybrat šablonu</Button>
        </div>

        {/* Tlačítko Mobil/Tablet (Bez šipky) */}
        <div className="flex lg:hidden">
          <Button>Vybrat šablonu</Button>
        </div>

      </div>

    </section>
  );
}