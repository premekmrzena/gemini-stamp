'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export const HERO_SLIDER_IMAGES = ['/images/hero01.png', '/images/hero02.png', '/images/hero03.png'];

type Props = {
  alt: string;
  className?: string;
  sizes?: string;
};

// Prolínací slider s Ken Burns efektem z homepage Hero. Vytažený do samostatné
// komponenty bez next-intl, aby šel použít i na stránkách mimo [locale]
// (/partners). Odkaz kolem si řeší volající.
export default function HeroSlider({ alt, className, sizes = '(max-width: 767px) 535px, 750px' }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const kenburnsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDER_IMAGES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Restart Ken Burns on newly active slide and keep inactive slides paused,
  // so a hidden slide never finishes zooming in (and freezing zoomed) before it's shown
  useEffect(() => {
    kenburnsRefs.current.forEach((el, index) => {
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
  }, [currentSlide]);

  return (
    <div className={`relative w-full aspect-[7/5] lg:aspect-[4/3] ${className ?? ''}`}>
      {HERO_SLIDER_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity ease-in-out duration-[1500ms] ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            ref={(el) => {
              kenburnsRefs.current[index] = el;
            }}
            className="absolute inset-0 animate-kenburns"
          >
            <Image src={src} alt={alt} fill sizes={sizes} preload={index === 0} className="object-contain drop-shadow-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
