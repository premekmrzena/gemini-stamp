import Image from 'next/image';
import Button from '@/components/Button';

const steps = [
  {
    id: 1,
    title: 'Vyberte si šablonu',
    text: 'Vyberte si kompozici a arch se známkami, které vás oslovují.',
  },
  {
    id: 2,
    title: 'Nahrajte svoje fotky',
    text: 'Přidejte svoje fotky, které jste třeba dnes vyfotili na mobil.',
  },
  {
    id: 3,
    title: 'Napište vlastní text',
    text: 'Do vybraných šablon můžete dopsat vlastní text.',
  },
];

export default function Hero() {
  return (
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px] py-10 lg:py-16 overflow-hidden">
      
      {/* 1. BLOK: Hlavní Nadpis (Zmenšená mezera dole na lg:mb-10) */}
      <h1 className="text-[32px] lg:text-[48px] font-semibold tracking-[-0.01em] lg:tracking-[-0.02em] leading-[1.1] text-center mb-10 lg:mb-10">
        Známkový arch s vlastními fotkami
      </h1>

      {/* 2. BLOK: Obsah (Zvětšená mezera na lg:gap-6) */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-6 mx-auto w-full">
        
        <div className="order-2 lg:order-1 flex flex-col md:flex-row lg:flex-col gap-8 md:gap-4 lg:gap-8 w-full lg:w-auto lg:max-w-[320px] shrink-0">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center w-full">
              <div className="w-10 h-10 rounded-full bg-[#F9B420] text-[#0F172A] flex items-center justify-center font-bold text-[20px] mb-4 shrink-0">
                {step.id}
              </div>
              <h3 className="text-[20px] lg:text-[21px] font-semibold tracking-[-0.02em] leading-[1.1] mb-2">
                {step.title}
              </h3>
              <p className="text-[14px] lg:text-[15px] font-normal leading-[1.6] text-white/90 max-w-[280px]">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="order-1 lg:order-2 w-full max-w-[700px] flex justify-center shrink">
          <Image 
            src="/images/hero-image.png" 
            alt="Známkový arch s vlastními fotkami" 
            width={700} 
            height={500} 
            priority
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>

      </div>

      {/* 3. BLOK: Tlačítko (Zmenšená mezera nahoře na lg:mt-10) */}
      <div className="mt-12 lg:mt-10 flex justify-center w-full">
        
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

        <div className="flex lg:hidden">
          <Button arrow="right">Vybrat šablonu</Button>
        </div>

      </div>

    </section>
  );
}