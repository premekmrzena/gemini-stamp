'use client';

import Image from 'next/image';
import Button from '@/components/Button';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const sliderImages = [
  '/images/hero01_1400x788.png',
  '/images/hero02_1400x788.png',
  '/images/hero03_1400x788.png',
];

const steps = [
  { id: 1, title: 'Vyber si šablonu', mobileTitle: 'Vyber šablonu', text: 'Z historie, umění nebo známé památky.' },
  { id: 2, title: 'Nahraj svoje fotky', mobileTitle: 'Nahraj fotky', text: 'Přidejte vlastní fotky, které jste třeba dnes vyfotili na mobil.' },
  { id: 3, title: 'Napiš vlastní text', mobileTitle: 'Napiš text', text: 'Na kreativní arch si můžete dopsat vlastní vzkaz.' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const kenburnsRefs = useRef<Record<string, (HTMLDivElement | null)[]>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Restart Ken Burns on newly active slide and keep inactive slides paused,
  // so a hidden slide never finishes zooming in (and freezing zoomed) before it's shown
  useEffect(() => {
    Object.values(kenburnsRefs.current).forEach((refs) => {
      refs.forEach((el, index) => {
        if (!el) return;
        if (index === currentSlide) {
          el.style.animation = 'none';
          void el.offsetHeight; // force reflow
          el.style.animation = '';
          el.style.animationPlayState = 'running';
        } else {
          el.style.animationPlayState = 'paused';
        }
      });
    });
  }, [currentSlide]);

  const renderSlider = (variant: 'desktop' | 'mobile', className?: string) => (
    <div className={`relative w-full aspect-[7/5] lg:aspect-[16/9] ${className ?? ''}`}>
      {sliderImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity ease-in-out duration-[1500ms] ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            ref={(el) => {
              if (!kenburnsRefs.current[variant]) kenburnsRefs.current[variant] = [];
              kenburnsRefs.current[variant][index] = el;
            }}
            className="absolute inset-0 animate-kenburns"
          >
            <Image
              src={src}
              alt="Vytvoř si vlastní arch se známkami a fotkami"
              fill
              sizes="(max-width: 767px) 535px, 750px"
              preload={index === 0}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      ))}
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
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-3 shrink-0">
                  {step.id}
                </div>
                <h3 className="style-h4 mb-1">{step.title}</h3>
                <p className="style-body text-secondary/80 max-w-[240px]">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2 w-full max-w-[700px] shrink relative">
            {renderSlider('desktop')}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full flex flex-col items-center mb-4">
          {renderSlider('mobile', 'max-w-[500px]')}
        </div>

        <div className="hidden flex flex-row items-start justify-center w-full mb-8 gap-2">
          {steps.map((step) => (
            <div key={`mobile-${step.id}`} className="flex flex-col items-center text-center flex-1 min-w-0 gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[18px] shrink-0">
                {step.id}
              </div>
              <p className="text-[11px] sm:text-[13px] font-medium leading-[1.5] text-secondary">
                {step.mobileTitle}
              </p>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-4 md:mt-10 flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
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
            <Link
              href="/co-je-kreativni-arch"
              className="style-body text-secondary/60 hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/30 hover:decoration-secondary/60"
            >
              Co je Kreativní arch?
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
