'use client';

import Image from 'next/image';
import Button from '@/components/Button';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useEffect, useRef } from 'react';

const sliderImages = [
  '/images/hero01.png',
  '/images/hero02.png',
  '/images/hero03.png',
];

export default function Hero() {
  const t = useTranslations('home.hero');
  const steps = [
    { id: 1, title: t('step1Title'), mobileTitle: t('step1MobileTitle'), text: t('step1Text') },
    { id: 2, title: t('step2Title'), mobileTitle: t('step2MobileTitle'), text: t('step2Text') },
    { id: 3, title: t('step3Title'), mobileTitle: t('step3MobileTitle'), text: t('step3Text') },
  ];
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
    <div className={`relative w-full aspect-[7/5] lg:aspect-[4/3] ${className ?? ''}`}>
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
              alt={t('sliderAlt')}
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
          {t('title')}
        </h1>

        <p className="hidden md:block style-perex text-center text-secondary/70 mb-8 lg:mb-8 max-w-[620px] mx-auto">
          {t('perex')}
        </p>

        {/* Desktop / Tablet */}
        <div className="hidden md:flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mx-auto w-full mb-10 lg:mb-0">

          <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-6 md:gap-4 lg:gap-8 w-full lg:w-auto lg:max-w-[320px] shrink-0">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center flex-1 lg:flex-none">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-success text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-3 shrink-0">
                  {step.id}
                </div>
                <h3 className="style-h4 mb-1">{step.title}</h3>
                <p className="style-body text-secondary/80 max-w-[240px]">{step.text}</p>
              </div>
            ))}
          </div>

          <Link
            href="/vytvorit-arch"
            className="order-1 lg:order-2 block w-full max-w-[700px] lg:max-w-[525px] shrink relative"
          >
            {renderSlider('desktop')}
          </Link>
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full flex flex-col items-center mt-6 mb-8">
          <Link href="/vytvorit-arch" className="block w-full max-w-[500px]">
            {renderSlider('mobile', 'max-w-[500px]')}
          </Link>
        </div>

        <div className="hidden flex flex-row items-start justify-center w-full mb-8 gap-2">
          {steps.map((step) => (
            <div key={`mobile-${step.id}`} className="flex flex-col items-center text-center flex-1 min-w-0 gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-success text-black flex items-center justify-center font-semibold text-[18px] shrink-0">
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
                alt={t('arrowAlt')}
                width={60}
                height={60}
                className="absolute -left-[70px] bottom-3 pointer-events-none md:w-[70px] md:-left-[84px] md:bottom-[14px] lg:w-[80px] lg:-left-[95px] lg:bottom-[14px]"
              />
              <Link href="/vytvorit-arch">
                <Button>{t('cta')}</Button>
              </Link>
            </div>
            <Link
              href="/co-je-kreativni-arch"
              className="style-body text-secondary/60 hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/30 hover:decoration-secondary/60"
            >
              {t('whatIsLink')}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
