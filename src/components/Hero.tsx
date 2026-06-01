'use client';

import Image from 'next/image';
import Button from '@/components/Button';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const sliderImages = [
  '/images/hero-image.png',
  '/images/hero-image02.png',
  '/images/hero-image03.png',
];

const steps = [
  { id: 1, title: 'Vyber si šablonu', mobileTitle: 'Vyber si\nšablonu', text: 'Vytvořte si kreativní arch se známkami, které vám učarují.' },
  { id: 2, title: 'Napiš vlastní text', mobileTitle: 'Napiš\nvlastní text', text: 'Na kreativní arch si můžete dopsat vlastní vzkaz.' },
  { id: 3, title: 'Nahraj svoje fotky', mobileTitle: 'Nahraj\nsvoje fotky', text: 'Přidejte vlastní fotky, které jste třeba dnes vyfotili na mobil.' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const kenburnsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Restart Ken Burns on newly active slide without remounting Image
  useEffect(() => {
    const el = kenburnsRefs.current[currentSlide];
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight; // force reflow
    el.style.animation = '';
  }, [currentSlide]);

  const renderSlider = (className?: string) => (
    <div className={`relative w-full ${className ?? ''}`} style={{ aspectRatio: '7 / 5' }}>
      {sliderImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity ease-in-out duration-[1500ms] ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            ref={(el) => { kenburnsRefs.current[index] = el; }}
            className="absolute inset-0 animate-kenburns"
          >
            <Image
              src={src}
              alt="Vytvoř si vlastní arch se známkami a fotkami"
              fill
              priority={index === 0}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      ))}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-start">
        <div className="bg-black/70 backdrop-blur-sm text-secondary text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-[var(--color-tag-novinka)] mr-1">★★★★☆</span>
          Již 1&nbsp;247+ spokojených zákazníků
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-black text-secondary w-full overflow-hidden">
      <div className="layout-container">

        <h1 className="style-h1 text-center mb-3 lg:mb-4">
          Proměň svoje zážitky v krásný sběratelský poklad!
        </h1>

        <p className="hidden md:block style-perex text-center text-secondary/70 mb-6 lg:mb-8 max-w-[620px] mx-auto">
          Kreativní arch s významnými umělci nebo památkami na poštovních známkách!
        </p>

        {/* Desktop / Tablet */}
        <div className="hidden md:flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-12 mx-auto w-full mb-10 lg:mb-0">

          <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-6 md:gap-4 lg:gap-8 w-full lg:w-auto lg:max-w-[320px] shrink-0">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center flex-1 lg:flex-none">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[26px] lg:text-[32px] mb-3 shrink-0">
                  {step.id}
                </div>
                <h3 className="style-h3 mb-2">{step.title}</h3>
                <p className="style-body text-secondary/80 max-w-[240px]">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2 w-full max-w-[700px] shrink">
            {renderSlider()}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full flex justify-center mb-4">
          {renderSlider('max-w-[500px]')}
        </div>

        <div className="md:hidden flex flex-row items-start justify-center w-full mb-8 gap-2">
          {steps.map((step) => (
            <div key={`mobile-${step.id}`} className="flex flex-col items-center text-center flex-1 min-w-0 gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] shrink-0">
                {step.id}
              </div>
              <p className="text-[11px] sm:text-[13px] font-medium leading-[1.5] text-secondary whitespace-pre-line">
                {step.mobileTitle}
              </p>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-4 md:mt-10 flex justify-center w-full">
          <div className="inline-flex relative">
            <Image
              src="/images/handarrow.svg"
              alt="Ukazatel"
              width={60}
              height={60}
              className="absolute -left-[70px] bottom-3 pointer-events-none md:w-[70px] md:-left-[84px] md:bottom-[14px] lg:w-[80px] lg:-left-[95px] lg:bottom-[14px]"
            />
            <Link href="/vytvorit-arch">
              <Button>Vybrat šablonu a začít tvořit</Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
