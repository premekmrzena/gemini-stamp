'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { TEMPLATES } from '@/lib/editorConfig';

const FONT_OPTIONS = [
  { name: 'Výchozí (Sans-serif)', value: 'sans-serif' },
  { name: 'Moderní (Poppins)', value: 'Poppins' },
  { name: 'Elegantní (Playfair Display)', value: 'Playfair Display' },
  { name: 'Psací (Dancing Script)', value: 'Dancing Script' },
  { name: 'Retro (Pacifico)', value: 'Pacifico' },
];

interface PhotoState {
  url: string;
  scale: number;
  x: number;
  y: number;
}

export default function StampEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTemplate = TEMPLATES[0];

  const [photos, setPhotos] = useState<Record<string, PhotoState>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const targetSlotIdRef = useRef<string | null>(null);

  // HYBRIDNÍ MOD: Stav pro mobilního průvodce. 
  // Hodnoty: 0 až (totalSlots - 1) = Úprava slotů. Hodnota (totalSlots) = Náhled.
  const [mobileStep, setMobileStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Nastavení textu
  const [mainText, setMainText] = useState('Vlastní text');
  const [textColor, setTextColor] = useState('#FF6B35');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });

  // Nastavení stínu
  const [useShadow, setUseShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);

  // Interakční reference
  const isDragging = useRef<false | 'photo' | 'text' | 'resize'>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const photoStart = useRef({ x: 0, y: 0 });
  const scaleStart = useRef(1);
  const textPercentStart = useRef({ x: 50, y: 50 });
  const initialTouchDistance = useRef<number | null>(null);

  // Výpočty limitů pro mobilního průvodce
  const totalSlots = activeTemplate.slots.length;
  const isPreviewStep = mobileStep === totalSlots;
  const isLastSlotStep = mobileStep === totalSlots - 1;
  const currentMobileSlot = isPreviewStep ? null : activeTemplate.slots[mobileStep];
  const isMobileTextStep = currentMobileSlot?.id === '1';
  const totalPhotoSlots = activeTemplate.slots.filter(s => s.id !== '1').length;
  const currentPhotoIndex = activeTemplate.slots.slice(0, mobileStep + 1).filter(s => s.id !== '1').length;
  const currentMobilePhoto = currentMobileSlot ? photos[currentMobileSlot.id] : null;

  // Načtení Google fontů
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const linkId = 'google-fonts-stamp-editor';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Dancing+Script:wght@700&family=Pacifico&family=Poppins:wght@600;700&family=Playfair+Display:wght@700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Synchronizace slotu s mobilním krokem
  useEffect(() => {
    if (isPreviewStep) {
      setActiveSlotId(null);
      targetSlotIdRef.current = null;
      return;
    }
    if (currentMobileSlot) {
      setActiveSlotId(currentMobileSlot.id);
      targetSlotIdRef.current = currentMobileSlot.id;
    }
  }, [mobileStep, currentMobileSlot, isPreviewStep]);

  const handleSlotClick = (slotId: string) => {
    targetSlotIdRef.current = slotId;
    setActiveSlotId(slotId);
    if (!photos[slotId]) {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const currentSlotId = targetSlotIdRef.current;
    if (!file || !currentSlotId) return;

    const url = URL.createObjectURL(file);
    setPhotos((prev) => ({
      ...prev,
      [currentSlotId]: { url, scale: 1, x: 0, y: 0 },
    }));
    e.target.value = '';
  };

  const handleDeletePhoto = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
    if (targetSlotIdRef.current === slotId) {
      targetSlotIdRef.current = null;
    }
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // --- MYŠ ---
  const handleMouseDown = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDragging.current = type;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setActiveSlotId(slotId);
    targetSlotIdRef.current = slotId;

    if (type === 'photo' && photos[slotId]) {
      photoStart.current = { x: photos[slotId].x, y: photos[slotId].y };
    } else if (type === 'resize' && photos[slotId]) {
      scaleStart.current = photos[slotId].scale;
    } else if (type === 'text') {
      textPercentStart.current = { x: textPos.x, y: textPos.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !activeSlotId) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (isDragging.current === 'photo' && photos[activeSlotId]) {
      setPhotos((prev) => ({
        ...prev,
        [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + dx, y: photoStart.current.y + dy },
      }));
    } else if (isDragging.current === 'resize' && photos[activeSlotId]) {
      const moveDistance = (dx + dy) * 0.005; 
      setPhotos((prev) => ({
        ...prev,
        [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + moveDistance), 5) },
      }));
    } else if (isDragging.current === 'text' && activeSlotId === '1') {
      const slotEl = containerRef.current?.querySelector(`[data-slot-id="1"]`);
      if (slotEl) {
        const rect = slotEl.getBoundingClientRect();
        const dxPercent = (dx / rect.width) * 100;
        const dyPercent = (dy / rect.height) * 100;
        setTextPos({
          x: Math.min(Math.max(0, textPercentStart.current.x + dxPercent), 100),
          y: Math.min(Math.max(0, textPercentStart.current.y + dyPercent), 100),
        });
      }
    }
  };

  // --- DOTYKY ---
  const handleTouchStart = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    setActiveSlotId(slotId);
    targetSlotIdRef.current = slotId;

    if (e.touches.length === 2 && type === 'photo' && photos[slotId]) {
      isDragging.current = 'photo';
      initialTouchDistance.current = getTouchDistance(e.touches);
      scaleStart.current = photos[slotId].scale;
    } else if (e.touches.length === 1) {
      isDragging.current = type;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (type === 'photo' && photos[slotId]) {
        photoStart.current = { x: photos[slotId].x, y: photos[slotId].y };
      } else if (type === 'resize' && photos[slotId]) {
        scaleStart.current = photos[slotId].scale;
      } else if (type === 'text') {
        textPercentStart.current = { x: textPos.x, y: textPos.y };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !activeSlotId) return;

    if (e.touches.length === 2 && isDragging.current === 'photo' && initialTouchDistance.current !== null && photos[activeSlotId]) {
      const currentDistance = getTouchDistance(e.touches);
      const factor = currentDistance / initialTouchDistance.current;
      setPhotos((prev) => ({
        ...prev,
        [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current * factor), 5) },
      }));
    } else if (e.touches.length === 1 && dragStart.current) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;

      if (isDragging.current === 'photo' && photos[activeSlotId]) {
        setPhotos((prev) => ({
          ...prev,
          [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + dx, y: photoStart.current.y + dy },
        }));
      } else if (isDragging.current === 'resize' && photos[activeSlotId]) {
        const moveDistance = (dx + dy) * 0.005;
        setPhotos((prev) => ({
          ...prev,
          [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + moveDistance), 5) },
        }));
      } else if (isDragging.current === 'text' && activeSlotId === '1') {
        const slotEl = containerRef.current?.querySelector(`[data-slot-id="1"]`);
        if (slotEl) {
          const rect = slotEl.getBoundingClientRect();
          const dxPercent = (dx / rect.width) * 100;
          const dyPercent = (dy / rect.height) * 100;
          setTextPos({
            x: Math.min(Math.max(0, textPercentStart.current.x + dxPercent), 100),
            y: Math.min(Math.max(0, textPercentStart.current.y + dyPercent), 100),
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    initialTouchDistance.current = null;
  };

  // --- SDRUŽENÁ FUNKCE PRO VÝPOČET TISKOVÝCH DAT ---
  const generateCanvasDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const tCanvas = document.createElement('canvas');
      tCanvas.width = activeTemplate.width;
      tCanvas.height = activeTemplate.height;
      const ctx = tCanvas.getContext('2d');
      if (!ctx) return resolve('');

      const isMobile = window.innerWidth < 768;
      const bgImg = new window.Image();
      bgImg.src = activeTemplate.backgroundImage;
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, activeTemplate.width, activeTemplate.height);

        const promises = activeTemplate.slots.map((slot) => {
          const photo = photos[slot.id];
          if (!photo) return Promise.resolve();
          
          return new Promise<void>((res) => {
            const userImg = new window.Image();
            userImg.src = photo.url;
            userImg.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.rect(slot.x, slot.y, slot.width, slot.height);
              ctx.clip();

              const slotEl = document.querySelector(isMobile ? `.mobile-slot-${slot.id}` : `.desktop-slot-${slot.id}`);
              const slotOnScreenWidth = slotEl ? slotEl.getBoundingClientRect().width : slot.width;
              const webToPrintRatio = slot.width / slotOnScreenWidth;

              const baseScale = Math.max(slot.width / userImg.width, slot.height / userImg.height);
              const finalScale = baseScale * photo.scale;
              const w = userImg.width * finalScale;
              const h = userImg.height * finalScale;

              const posX = slot.x + (slot.width - w) / 2 + photo.x * webToPrintRatio;
              const posY = slot.y + (slot.height - h) / 2 + photo.y * webToPrintRatio;

              ctx.drawImage(userImg, posX, posY, w, h);
              ctx.restore();
              res();
            };
          });
        });

        Promise.all(promises).then(() => {
          const textSlot = activeTemplate.slots.find(s => s.id === '1');
          if (textSlot) {
            ctx.save();
            const slotEl = document.querySelector(isMobile ? `.mobile-slot-1` : `.desktop-slot-1`);
            const slotOnScreenWidth = slotEl ? slotEl.getBoundingClientRect().width : textSlot.width;
            const textWebToPrintRatio = textSlot.width / slotOnScreenWidth;

            if (useShadow) {
              ctx.shadowColor = shadowColor;
              ctx.shadowBlur = shadowBlur * textWebToPrintRatio;
              ctx.shadowOffsetX = 2 * textWebToPrintRatio;
              ctx.shadowOffsetY = 2 * textWebToPrintRatio;
            }
            ctx.fillStyle = textColor;
            const finalFontSize = fontSize * textWebToPrintRatio;
            ctx.font = `bold ${finalFontSize}px ${fontFamily}`;
            ctx.textAlign = textAlign;
            ctx.textBaseline = 'middle';

            const textX = textSlot.x + (textPos.x / 100) * textSlot.width;
            const textY = textSlot.y + (textPos.y / 100) * textSlot.height;
            const lines = mainText.split('\n');
            const lineHeight = finalFontSize * 1.05;
            const totalHeight = (lines.length - 1) * lineHeight;
            const startY = textY - totalHeight / 2;

            lines.forEach((line, index) => {
              ctx.fillText(line, textX, startY + index * lineHeight);
            });
            ctx.restore();
          }

          resolve(tCanvas.toDataURL('image/jpeg', 0.95));
        });
      };
    });
  };

  // NATIVNÍ STAŽENÍ FINÁLNÍHO SOUBORU
  const handleExport = async () => {
    const dataUrl = await generateCanvasDataUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = 'creative-stamp-arsik.jpg';
    link.href = dataUrl;
    link.click();
  };

  // MOBILNÍ PŘECHOD DO NÁHLEDU ARCHU
  const handleMobilePreview = async () => {
    setMobileStep(totalSlots);
    setIsGeneratingPreview(true);
    const dataUrl = await generateCanvasDataUrl();
    setPreviewUrl(dataUrl);
    setIsGeneratingPreview(false);
  };

  const textShadowCSS = useShadow ? `2px 2px ${shadowBlur}px ${shadowColor}` : 'none';

  return (
    <div 
      className="flex-1 min-h-0 w-full flex flex-col justify-between relative font-sans text-secondary select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="opacity-0 absolute w-0 h-0 pointer-events-none" 
        accept="image/*" 
      />

      {/* ======================================================== */}
      {/* 🖥️ DESKTOPOVÝ REŽIM (Zobrazí se na md a větších obrazovkách) */}
      {/* ======================================================== */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 w-full justify-between relative">
        <div 
          ref={containerRef} 
          className="flex-1 min-h-0 w-full flex items-center justify-center p-8"
          onClick={() => setActiveSlotId(null)}
        >
          {/* KLÍČOVÝ FIX CSS: height: 100%, maxWidth: 100%, + aspectRatio zajistí dokonalý letterboxing bez kolapsu flexboxu! */}
          <div 
            className="relative shadow-2xl bg-black-custom border border-white/10 shrink-0"
            style={{ aspectRatio: `${activeTemplate.width} / ${activeTemplate.height}`, height: '100%', maxWidth: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={activeTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Šablona" />

            {activeTemplate.slots.map((slot) => {
              const photo = photos[slot.id];
              const leftPct = (slot.x / activeTemplate.width) * 100;
              const topPct = (slot.y / activeTemplate.height) * 100;
              const widthPct = (slot.width / activeTemplate.width) * 100;
              const heightPct = (slot.height / activeTemplate.height) * 100;

              return (
                <div
                  key={slot.id}
                  data-slot-id={slot.id}
                  className={`desktop-slot-${slot.id} absolute border border-dashed cursor-pointer overflow-hidden group transition-colors ${
                    activeSlotId === slot.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                  style={{ left: `${leftPct}%`, top: `${topPct}%`, width: `${widthPct}%`, height: `${heightPct}%`, zIndex: slot.id === '1' ? 10 : 5 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlotClick(slot.id);
                  }}
                >
                  {photo ? (
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden"
                      onMouseDown={(e) => handleMouseDown('photo', slot.id, e)}
                      onTouchStart={(e) => handleTouchStart('photo', slot.id, e)}
                    >
                      <img src={photo.url} className="w-full h-full object-cover origin-center pointer-events-none" style={{ transform: `translate(${photo.x}px, ${photo.y}px) scale(${photo.scale})` }} />
                      <button onClick={(e) => handleDeletePhoto(slot.id, e)} className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 hover:bg-red-600 text-white font-bold rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md">✕</button>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary flex items-center justify-center cursor-se-resize z-20 shadow-md rounded-tl-md" onMouseDown={(e) => handleMouseDown('resize', slot.id, e)} onClick={(e) => e.stopPropagation()}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="9 3 3 3 3 9"></polyline><polyline points="15 21 21 21 21 15"></polyline><line x1="3" y1="3" x2="21" y2="21"></line></svg>
                      </div>
                    </div>
                  ) : (
                    slot.id !== '1' && (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2 text-center font-medium tracking-wide text-black300 text-sm">Vložit fotku</div>
                    )
                  )}

                  {slot.id === '1' && (
                    <div 
                      className="absolute cursor-move select-none p-2 whitespace-pre active:opacity-80 group w-max max-w-full touch-none"
                      style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize}px`, fontFamily: fontFamily, fontWeight: 'bold', textAlign: textAlign, lineHeight: 1.05, textShadow: textShadowCSS, zIndex: 40 }}
                      onMouseDown={(e) => handleMouseDown('text', '1', e)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="relative z-10 border border-transparent group-hover:border-primary p-1 rounded inline-block">{mainText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {activeSlotId === '1' && (
          <div className="absolute bottom-0 left-0 w-full bg-[#131C2E] border-t border-white/5 px-6 lg:px-[84px] py-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-2xl z-50 animate-[fadeIn_0.15s_ease-out]">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white opacity-60 block uppercase tracking-wider">Text do velkého pole</label>
              <textarea value={mainText} onChange={(e) => setMainText(e.target.value)} rows={2} className="w-full bg-black-custom/60 border border-white/10 text-secondary rounded-lg p-2.5 text-sm outline-none focus:border-primary transition resize-none whitespace-pre-wrap" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-black-custom/60 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-primary transition text-secondary font-medium">
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-black-custom">{f.name}</option>)}
                  </select>
                </div>
                <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-black-custom/60 flex items-center justify-center shrink-0">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute w-14 h-14 cursor-pointer bg-transparent border-none p-0 scale-150" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <input type="range" min="16" max="100" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary bg-black-custom/50 h-1 rounded-lg appearance-none cursor-pointer" />
                <div className="flex bg-black-custom/60 p-0.5 rounded-lg border border-white/10 justify-between">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button key={align} type="button" onClick={() => setTextAlign(align)} className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${textAlign === align ? 'bg-primary text-black-custom' : 'text-white/40 hover:text-white'}`}>
                      {align === 'left' ? 'Vlevo' : align === 'center' ? 'Střed' : 'Vpravo'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:items-center">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="shadow-check" checked={useShadow} onChange={(e) => setUseShadow(e.target.checked)} className="w-4 h-4 rounded border-white/10 accent-primary bg-black-custom cursor-pointer" />
                <label htmlFor="shadow-check" className="text-[11px] font-bold text-white opacity-60 cursor-pointer select-none uppercase tracking-wider">Zapnout stín písma</label>
              </div>
              {useShadow && (
                <div className="w-full max-w-[180px]"><input type="range" min="1" max="15" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full accent-primary bg-black-custom/50 h-1 rounded-lg appearance-none cursor-pointer" /></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 📱 MOBILNÍ REŽIM: WIZARD KROK ZA KROKEM (Pod breakpointem md) */}
      {/* ======================================================== */}
      <div className="flex md:hidden flex-col flex-1 min-h-0 w-full justify-between relative overflow-hidden">
        
        <div className="w-full bg-[#1E293B] py-2.5 px-4 text-center border-b border-white/5 shadow-inner shrink-0">
          <span className="text-xs uppercase tracking-widest font-semibold text-black300">
            {isPreviewStep ? 'Náhled finálního archu' : isMobileTextStep ? 'Krok: Úprava hlavního textu' : `Fotografie ${currentPhotoIndex} z ${totalPhotoSlots}`}
          </span>
        </div>

        {isPreviewStep ? (
          <div className="flex-1 min-h-0 w-full flex items-center justify-center p-6 bg-[#0F172A]">
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                <span className="text-xs text-white/50 animate-pulse">Připravuji ostrý náhled...</span>
              </div>
            ) : previewUrl ? (
              <img src={previewUrl} className="max-w-full max-h-full object-contain shadow-2xl border border-white/10" alt="Náhled archu" />
            ) : null}
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-6 bg-[#0F172A]">
            
            {/* KLÍČOVÝ FIX CSS (Mobilní Slot): Opět bezpečný letterboxing */}
            <div 
              data-slot-id={currentMobileSlot?.id}
              className={`mobile-slot-${currentMobileSlot?.id} relative shadow-2xl bg-white/5 border border-primary overflow-hidden shrink-0`}
              style={{ aspectRatio: `${currentMobileSlot?.width} / ${currentMobileSlot?.height}`, height: '100%', maxWidth: '100%' }}
              onClick={() => handleSlotClick(currentMobileSlot?.id as string)}
            >
              {currentMobilePhoto ? (
                <div className="absolute inset-0 w-full h-full overflow-hidden" onTouchStart={(e) => handleTouchStart('photo', currentMobileSlot?.id as string, e)}>
                  <img src={currentMobilePhoto.url} className="absolute inset-0 w-full h-full object-cover origin-center pointer-events-none" style={{ transform: `translate(${currentMobilePhoto.x}px, ${currentMobilePhoto.y}px) scale(${currentMobilePhoto.scale})` }} />
                  <button onClick={(e) => handleDeletePhoto(currentMobileSlot?.id as string, e)} className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white font-bold rounded-full text-xs flex items-center justify-center shadow-lg z-30">✕</button>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary flex items-center justify-center cursor-se-resize z-20 shadow-md" onTouchStart={(e) => handleTouchStart('resize', currentMobileSlot?.id as string, e)} onClick={(e) => e.stopPropagation()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="9 3 3 3 3 9"></polyline><polyline points="15 21 21 21 21 15"></polyline><line x1="3" y1="3" x2="21" y2="21"></line></svg>
                  </div>
                </div>
              ) : (
                !isMobileTextStep && (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">+</div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Nahrát fotografii</span>
                  </div>
                )
              )}

              {isMobileTextStep && (
                <div 
                  className="absolute cursor-move select-none p-2 whitespace-pre active:opacity-80 w-max max-w-full touch-none"
                  style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize * 0.85}px`, fontFamily: fontFamily, fontWeight: 'bold', textAlign: textAlign, lineHeight: 1.05, textShadow: textShadowCSS, zIndex: 40 }}
                  onTouchStart={(e) => handleTouchStart('text', '1', e)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="border border-primary bg-black-custom/30 p-1 rounded inline-block">{mainText}</span>
                </div>
              )}
            </div>
            {isMobileTextStep && <p className="text-[10px] text-black300 mt-3 italic text-center shrink-0">💡 Nápis na známce můžete posouvat tažením prstu</p>}
          </div>
        )}

        {isMobileTextStep && !isPreviewStep && (
          <div className="shrink-0 w-full bg-[#131C2E] border-t border-white/5 p-4 flex flex-col gap-3 shadow-2xl z-50 animate-[fadeIn_0.15s_ease-out]">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white opacity-50 block uppercase tracking-wider">Nápis na známku</label>
              <textarea value={mainText} onChange={(e) => setMainText(e.target.value)} rows={2} className="w-full bg-black-custom/60 border border-white/10 text-secondary rounded-lg p-2 text-xs outline-none focus:border-primary transition resize-none whitespace-pre-wrap" />
            </div>
            <div className="flex items-center gap-2">
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="flex-1 bg-black-custom/60 border border-white/10 rounded-lg p-2 text-xs outline-none text-secondary font-medium">
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-black-custom">{f.name}</option>)}
              </select>
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-black-custom/60 flex items-center justify-center shrink-0">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute w-12 h-12 cursor-pointer bg-transparent border-none p-0 scale-150" />
              </div>
              <div className="flex bg-black-custom/60 p-0.5 rounded-lg border border-white/10 justify-between shrink-0">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button key={align} type="button" onClick={() => setTextAlign(align)} className={`px-2.5 py-1 text-[9px] font-bold rounded transition-all ${textAlign === align ? 'bg-primary text-black-custom' : 'text-white/40 hover:text-white'}`}>
                    {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="mob-shadow" checked={useShadow} onChange={(e) => setUseShadow(e.target.checked)} className="w-3.5 h-3.5 rounded accent-primary bg-black-custom" />
                <label htmlFor="mob-shadow" className="text-[10px] font-bold text-white opacity-50 uppercase tracking-wider">Stín</label>
              </div>
              <input type="range" min="16" max="64" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-24 accent-primary" />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🏁 GLOBÁLNÍ RESPONSIVNÍ PATIČKA (FOOTER) */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#252C3C] border-t border-[#2B3755] h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shrink-0 z-40">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex justify-between items-center">
          
          <Button 
            onClick={() => {
              if (window.innerWidth >= 768) {
                window.history.back();
              } else {
                if (mobileStep > 0) {
                  setMobileStep(prev => prev - 1);
                } else {
                  window.history.back();
                }
              }
            }} 
            variant="outlined" 
            arrow="left"
          >
            Zpět
          </Button>

          <Button 
            onClick={() => {
              if (window.innerWidth >= 768) {
                handleExport();
              } else {
                if (isPreviewStep) {
                  handleExport();
                } else if (isLastSlotStep) {
                  handleMobilePreview();
                } else {
                  setMobileStep(prev => prev + 1);
                }
              }
            }} 
            arrow="right"
          >
            {window.innerWidth >= 768 ? 'Uložit' : isPreviewStep ? 'Uložit' : isLastSlotStep ? 'Náhled archu' : 'Další krok'}
          </Button>

        </div>
      </footer>
    </div>
  );
}