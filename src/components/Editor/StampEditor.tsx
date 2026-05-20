'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/Button';
import { TEMPLATES } from '@/lib/editorConfig';

const FONT_OPTIONS = [
  { name: 'Výchozí (Sans-serif)', value: 'sans-serif' },
  { name: 'Moderní (Poppins)', value: 'Poppins' },
  { name: 'Elegantní (Playfair Display)', value: 'Playfair Display' },
  { name: 'Psací (Dancing Script)', value: 'Dancing Script' },
  { name: 'Retro (Pacifico)', value: 'Pacifico' },
];

interface PhotoState { url: string; scale: number; x: number; y: number; }

interface StampEditorProps {
  onComplete: () => void;
  isMobileLandscape?: boolean;
}

export default function StampEditor({ onComplete, isMobileLandscape = false }: StampEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTemplate = TEMPLATES[0];

  const [photos, setPhotos] = useState<Record<string, PhotoState>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const targetSlotIdRef = useRef<string | null>(null);

  // Bezpečný výpočet šířky textového slotu pro dokonalý export i při změně pohledu
  const textSlotWidthRef = useRef<number>(activeTemplate.width);

  const [mobileStep, setMobileStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showLandscapeHint, setShowLandscapeHint] = useState(false);

  // Nastavení textu
  const [mainText, setMainText] = useState('Vlastní text');
  const [textColor, setTextColor] = useState('#FF6B35');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });
  const [useShadow, setUseShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);

  // Interakce
  const isDragging = useRef<false | 'photo' | 'text' | 'resize'>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const photoStart = useRef({ x: 0, y: 0 });
  const scaleStart = useRef(1);
  const textPercentStart = useRef({ x: 50, y: 50 });
  const initialTouchDistance = useRef<number | null>(null);

  const totalSlotsSteps = activeTemplate.slots.length;
  const isPreviewStep = mobileStep === totalSlotsSteps;
  const isLastSlotStep = mobileStep === totalSlotsSteps - 1;
  const currentMobileSlot = isPreviewStep ? null : activeTemplate.slots[mobileStep];
  const isMobileTextStep = currentMobileSlot?.id === '1';
  const totalPhotoSlots = activeTemplate.slots.filter(s => s.id !== '1').length;
  const currentPhotoIndex = activeTemplate.slots.slice(0, mobileStep + 1).filter(s => s.id !== '1').length;

  const requiredPhotoSlots = activeTemplate.slots.filter(s => s.id !== '1');
  const allPhotosFilled = requiredPhotoSlots.every(slot => photos[slot.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const linkId = 'google-fonts-stamp-editor';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId; link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Dancing+Script:wght@700&family=Pacifico&family=Poppins:wght@600;700&family=Playfair+Display:wght@700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Aktualizace reference o přesné renderované šířce textového boxu
  useEffect(() => {
    const updateTextSlotWidth = () => {
      const isMobile = window.innerWidth < 768;
      const slotEl = document.querySelector(isMobile ? '.mobile-slot-1' : '.desktop-slot-1');
      if (slotEl) {
        textSlotWidthRef.current = slotEl.getBoundingClientRect().width;
      }
    };
    updateTextSlotWidth();
    window.addEventListener('resize', updateTextSlotWidth);
    return () => window.removeEventListener('resize', updateTextSlotWidth);
  });

  useEffect(() => {
    if (isPreviewStep) { setActiveSlotId(null); return; }
    if (currentMobileSlot) { setActiveSlotId(currentMobileSlot.id); targetSlotIdRef.current = currentMobileSlot.id; }
  }, [mobileStep, currentMobileSlot, isPreviewStep]);

  // Upozornění na návrat do portrétního módu
  useEffect(() => {
    if (isMobileLandscape) {
      setShowLandscapeHint(true);
      const timer = setTimeout(() => setShowLandscapeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobileLandscape]);

  const handleSlotClick = (slotId: string) => {
    targetSlotIdRef.current = slotId; setActiveSlotId(slotId);
    if (!photos[slotId]) fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; const currentSlotId = targetSlotIdRef.current;
    if (!file || !currentSlotId) return;
    const url = URL.createObjectURL(file);
    setPhotos(prev => ({ ...prev, [currentSlotId]: { url, scale: 1, x: 0, y: 0 } }));
    e.target.value = '';
  };

  const handleDeletePhoto = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); setPhotos(prev => { const copy = { ...prev }; delete copy[slotId]; return copy; });
    if (targetSlotIdRef.current === slotId) targetSlotIdRef.current = null;
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX; const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // --- MYŠ (DESKTOP) ---
  const handleMouseDown = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    isDragging.current = type; dragStart.current = { x: e.clientX, y: e.clientY };
    setActiveSlotId(slotId); targetSlotIdRef.current = slotId;

    if (type === 'photo' && photos[slotId]) photoStart.current = { x: photos[slotId].x, y: photos[slotId].y };
    else if (type === 'resize' && photos[slotId]) scaleStart.current = photos[slotId].scale;
    else if (type === 'text') textPercentStart.current = { x: textPos.x, y: textPos.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !activeSlotId) return;
    const dx = e.clientX - dragStart.current.x; const dy = e.clientY - dragStart.current.y;

    if (isDragging.current === 'photo' && photos[activeSlotId]) {
      setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + dx, y: photoStart.current.y + dy } }));
    } else if (isDragging.current === 'resize' && photos[activeSlotId]) {
      const moveDistance = (dx + dy) * 0.005; 
      setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + moveDistance), 5) } }));
    } else if (isDragging.current === 'text' && activeSlotId === '1') {
      const slotEl = document.querySelector('.desktop-slot-1');
      if (slotEl) {
        const rect = slotEl.getBoundingClientRect();
        setTextPos({ x: Math.min(Math.max(0, textPercentStart.current.x + (dx / rect.width) * 100), 100), y: Math.min(Math.max(0, textPercentStart.current.y + (dy / rect.height) * 100), 100) });
      }
    }
  };

  // --- DOTYKY (MOBIL) ---
  const handleTouchStart = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
    e.stopPropagation();
    setActiveSlotId(slotId); targetSlotIdRef.current = slotId;

    if (e.touches.length === 2 && type === 'photo' && photos[slotId]) {
      isDragging.current = 'photo';
      initialTouchDistance.current = getTouchDistance(e.touches);
      scaleStart.current = photos[slotId].scale;
    } else if (e.touches.length === 1) {
      isDragging.current = type;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (type === 'photo' && photos[slotId]) photoStart.current = { x: photos[slotId].x, y: photos[slotId].y };
      else if (type === 'resize' && photos[slotId]) scaleStart.current = photos[slotId].scale;
      else if (type === 'text') textPercentStart.current = { x: textPos.x, y: textPos.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !activeSlotId) return;

    if (e.touches.length === 2 && isDragging.current === 'photo' && initialTouchDistance.current && photos[activeSlotId]) {
      e.preventDefault(); 
      const factor = getTouchDistance(e.touches) / initialTouchDistance.current;
      setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current * factor), 5) } }));
    } else if (e.touches.length === 1 && dragStart.current) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;

      if (isDragging.current === 'photo' && photos[activeSlotId]) {
        setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + dx, y: photoStart.current.y + dy } }));
      } else if (isDragging.current === 'resize' && photos[activeSlotId]) {
        const moveDistance = (dx + dy) * 0.005;
        setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + moveDistance), 5) } }));
      } else if (isDragging.current === 'text') {
        // KLÍČOVÝ FIX 1: Skákající text. Vybere jen ten slot, který je aktuálně viditelný na obrazovce.
        const isMobile = window.innerWidth < 768;
        const slotEl = document.querySelector(isMobile ? '.mobile-slot-1' : '.desktop-slot-1');
        if (slotEl) {
          const rect = slotEl.getBoundingClientRect();
          setTextPos({
            x: Math.min(Math.max(0, textPercentStart.current.x + (dx / rect.width) * 100), 100),
            y: Math.min(Math.max(0, textPercentStart.current.y + (dy / rect.height) * 100), 100),
          });
        }
      }
    }
  };

  const handleMouseUp = () => { isDragging.current = false; initialTouchDistance.current = null; };

  // --- NÁHLED A EXPORT (Nyní s perfektním zrcadlením fontu) ---
  const generateCanvasDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const tCanvas = document.createElement('canvas');
      tCanvas.width = activeTemplate.width; tCanvas.height = activeTemplate.height;
      const ctx = tCanvas.getContext('2d');
      if (!ctx) return resolve('');
      const bgImg = new window.Image();
      bgImg.src = activeTemplate.backgroundImage;
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, tCanvas.width, tCanvas.height);
        const promises = activeTemplate.slots.map((slot) => {
          const photo = photos[slot.id];
          if (!photo) return Promise.resolve();
          return new Promise<void>((res) => {
            const userImg = new window.Image();
            userImg.src = photo.url;
            userImg.onload = () => {
              ctx.save(); ctx.beginPath(); ctx.rect(slot.x, slot.y, slot.width, slot.height); ctx.clip();
              const isMobile = window.innerWidth < 768;
              const slotEl = document.querySelector(isMobile ? `.mobile-slot-${slot.id}` : `.desktop-slot-${slot.id}`);
              const webToPrintRatio = slot.width / (slotEl?.getBoundingClientRect().width || slot.width);
              const baseScale = Math.max(slot.width / userImg.width, slot.height / userImg.height);
              const finalScale = baseScale * photo.scale;
              const w = userImg.width * finalScale; const h = userImg.height * finalScale;
              const posX = slot.x + (slot.width - w) / 2 + photo.x * webToPrintRatio;
              const posY = slot.y + (slot.height - h) / 2 + photo.y * webToPrintRatio;
              ctx.drawImage(userImg, posX, posY, w, h); ctx.restore(); res();
            };
          });
        });
        Promise.all(promises).then(() => {
          const textSlot = activeTemplate.slots.find(s => s.id === '1');
          if (textSlot) {
            ctx.save();
            // KLÍČOVÝ FIX 2: Text se exportuje vždy vůči stabilní uložené referenci šířky slotu z doby editace
            const textWebToPrintRatio = textSlot.width / textSlotWidthRef.current;
            if (useShadow) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur * textWebToPrintRatio; ctx.shadowOffsetX = 2 * textWebToPrintRatio; ctx.shadowOffsetY = 2 * textWebToPrintRatio; }
            ctx.fillStyle = textColor; ctx.font = `bold ${fontSize * textWebToPrintRatio}px ${fontFamily}`; ctx.textAlign = textAlign; ctx.textBaseline = 'middle';
            const textX = textSlot.x + (textPos.x / 100) * textSlot.width; const textY = textSlot.y + (textPos.y / 100) * textSlot.height;
            const lines = mainText.split('\n'); const lineHeight = (fontSize * textWebToPrintRatio) * 1.05;
            const startY = textY - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach((line, i) => ctx.fillText(line, textX, startY + i * lineHeight));
            ctx.restore();
          }
          resolve(tCanvas.toDataURL('image/jpeg', 0.95));
        });
      };
    });
  };

  const handleMobilePreview = async () => {
    setMobileStep(totalSlotsSteps); setIsGeneratingPreview(true);
    const dataUrl = await generateCanvasDataUrl();
    setPreviewUrl(dataUrl); setIsGeneratingPreview(false);
  };

  const textShadowCSS = useShadow ? `2px 2px ${shadowBlur}px ${shadowColor}` : 'none';

  return (
    <div 
      className="flex-1 min-h-0 w-full flex flex-col justify-between font-sans text-secondary select-none touch-none"
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}
    >
      {/* Vyskakovací nápověda pro mobilní landscape mode */}
      {showLandscapeHint && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-primary text-black-custom font-bold px-4 py-2 rounded-full shadow-2xl animate-pulse pointer-events-none whitespace-nowrap text-sm">
          Otočte zpět na výšku pro zobrazení menu
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="opacity-0 absolute w-0 h-0 pointer-events-none" accept="image/*" />

      {/* ======================================================== */}
      {/* 🖥️ DESKTOPOVÝ REŽIM */}
      {/* ======================================================== */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 w-full relative">
        <div ref={containerRef} className="flex-1 min-h-0 w-full flex items-center justify-center p-8" onClick={() => setActiveSlotId(null)}>
          <div className="relative shadow-2xl bg-black-custom border border-white/10 shrink-0" style={{ aspectRatio: `${activeTemplate.width} / ${activeTemplate.height}`, height: '100%', maxWidth: '100%' }} onClick={(e) => e.stopPropagation()}>
            <img src={activeTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Šablona" />
            {activeTemplate.slots.map((slot) => (
              <div key={slot.id} data-slot-id={slot.id} className={`desktop-slot-${slot.id} absolute border border-dashed cursor-pointer overflow-hidden group transition-colors ${activeSlotId === slot.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                style={{ left: `${(slot.x/activeTemplate.width)*100}%`, top: `${(slot.y/activeTemplate.height)*100}%`, width: `${(slot.width/activeTemplate.width)*100}%`, height: `${(slot.height/activeTemplate.height)*100}%`, zIndex: slot.id === '1' ? 10 : 5 }}
                onClick={(e) => { e.stopPropagation(); handleSlotClick(slot.id); }}>
                {photos[slot.id] ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden" onMouseDown={(e) => handleMouseDown('photo', slot.id, e)}>
                    <img src={photos[slot.id].url} className="w-full h-full object-cover origin-center pointer-events-none" style={{ transform: `translate(${photos[slot.id].x}px, ${photos[slot.id].y}px) scale(${photos[slot.id].scale})` }} />
                    <button onClick={(e) => handleDeletePhoto(slot.id, e)} className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white font-bold rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md">✕</button>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary flex items-center justify-center cursor-se-resize z-20 shadow-md rounded-tl-md" onMouseDown={(e) => handleMouseDown('resize', slot.id, e)} onClick={(e) => e.stopPropagation()}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="9 3 3 3 3 9"/><polyline points="15 21 21 21 21 15"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                    </div>
                  </div>
                ) : slot.id !== '1' && <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2 text-center font-medium text-black300 text-sm">Vložit fotku</div>}
                {slot.id === '1' && <div className="absolute cursor-move select-none p-2 whitespace-pre active:opacity-80 group w-max max-w-full touch-none"
                    style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize}px`, fontFamily: fontFamily, fontWeight: 'bold', textAlign: textAlign, lineHeight: 1.05, textShadow: textShadowCSS, zIndex: 40 }}
                    onMouseDown={(e) => handleMouseDown('text', '1', e)}>
                  <span className="relative z-10 border border-transparent group-hover:border-primary p-1 rounded inline-block">{mainText}</span>
                </div>}
              </div>
            ))}
          </div>
        </div>
        {activeSlotId === '1' && <div className="absolute bottom-0 left-0 w-full bg-[#131C2E] border-t border-white/5 px-6 lg:px-[84px] py-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-2xl z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="space-y-1.5"><label className="text-[11px] font-bold text-white opacity-60 block uppercase">Text na archu</label><textarea value={mainText} onChange={e => setMainText(e.target.value)} rows={2} className="w-full bg-black-custom/60 border border-white/10 text-secondary rounded-lg p-2.5 text-sm outline-none focus:border-primary transition resize-none"/></div>
          <div className="space-y-3"><div className="flex gap-3"><select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="flex-1 bg-black-custom/60 border border-white/10 rounded-lg p-2 text-xs text-secondary font-medium">{FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-black-custom">{f.name}</option>)}</select><div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center shrink-0"><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute w-14 h-14 cursor-pointer scale-150"/></div></div><div className="grid grid-cols-2 gap-3 items-center"><input type="range" min="16" max="100" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-primary"/><div className="flex bg-black-custom/60 p-0.5 rounded-lg border border-white/10 justify-between">{(['left', 'center', 'right'] as const).map(a => <button key={a} type="button" onClick={() => setTextAlign(a)} className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${textAlign === a ? 'bg-primary text-black-custom' : 'text-white/40'}`}>{{left:'L',center:'C',right:'R'}[a]}</button>)}</div></div></div>
          <div className="flex flex-col gap-2 md:items-center"><div className="flex items-center gap-3"><input type="checkbox" id="shadow-check" checked={useShadow} onChange={e => setUseShadow(e.target.checked)} className="w-4 h-4 accent-primary"/><label htmlFor="shadow-check" className="text-[11px] font-bold text-white opacity-60 uppercase">Stín písma</label></div>{useShadow && <input type="range" min="1" max="15" value={shadowBlur} onChange={e => setShadowBlur(Number(e.target.value))} className="w-full max-w-[180px] accent-primary"/>}</div>
        </div>}
      </div>

      {/* ======================================================== */}
      {/* 📱 MOBILNÍ REŽIM WIZARDU */}
      {/* ======================================================== */}
      <div className="flex md:hidden flex-col flex-1 min-h-0 w-full relative overflow-hidden">
        
        {/* Schováno, pokud je mobil naležato (landscape) */}
        {!isMobileLandscape && (
          <div className="w-full bg-[#1E293B] py-2.5 px-4 text-center border-b border-white/5 shadow-inner shrink-0">
            <span className="text-xs uppercase tracking-widest font-semibold text-black300">
              {isPreviewStep ? 'Náhled finálního archu' : isMobileTextStep ? 'Úprava hlavního textu' : `Fotografie ${currentPhotoIndex} z ${totalPhotoSlots}`}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-6 bg-[#0F172A]">
          {isPreviewStep ? (
            isGeneratingPreview ? <div className="animate-pulse text-xs text-primary">Generuji náhled...</div> : <img src={previewUrl || ''} className="max-w-full max-h-full object-contain shadow-2xl border border-white/10" alt="Preview" />
          ) : (
            <div className="relative shadow-2xl bg-white/5 border border-primary shrink-0 max-w-full max-h-full flex items-center justify-center" onClick={() => handleSlotClick(currentMobileSlot!.id)}>
              <svg viewBox={`0 0 ${currentMobileSlot!.width} ${currentMobileSlot!.height}`} className="w-[1000px] max-w-full max-h-full opacity-0 pointer-events-none" />
              <div data-slot-id={currentMobileSlot?.id} className={`mobile-slot-${currentMobileSlot?.id} absolute inset-0 w-full h-full overflow-hidden`}>
                {photos[currentMobileSlot!.id] ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden" onTouchStart={(e) => handleTouchStart('photo', currentMobileSlot!.id, e)}>
                    <img src={photos[currentMobileSlot!.id].url} className="absolute inset-0 w-full h-full object-cover origin-center pointer-events-none" style={{ transform: `translate(${photos[currentMobileSlot!.id].x}px, ${photos[currentMobileSlot!.id].y}px) scale(${photos[currentMobileSlot!.id].scale})` }} />
                    <button onClick={(e) => handleDeletePhoto(currentMobileSlot!.id, e)} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 text-white font-bold rounded-full text-xs flex items-center justify-center z-30 shadow-lg">✕</button>
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary flex items-center justify-center z-20 shadow-md rounded-tl-lg" onTouchStart={(e) => handleTouchStart('resize', currentMobileSlot!.id, e)} onClick={(e) => e.stopPropagation()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="9 3 3 3 3 9"/><polyline points="15 21 21 21 21 15"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                    </div>
                  </div>
                ) : !isMobileTextStep && <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center gap-2"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">+</div><span className="text-xs font-semibold text-primary uppercase">Nahrát fotku</span></div>}
                
                {isMobileTextStep && <div className="absolute cursor-move select-none p-2 whitespace-pre active:opacity-80 w-max max-w-full touch-none"
                      style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize}px`, fontFamily: fontFamily, fontWeight: 'bold', textAlign: textAlign, lineHeight: 1.05, textShadow: textShadowCSS, zIndex: 40 }}
                      onTouchStart={(e) => handleTouchStart('text', '1', e)}>
                  <span className="border border-primary bg-black-custom/30 p-1 rounded inline-block">{mainText}</span>
                </div>}
              </div>
            </div>
          )}
          {isMobileTextStep && !isPreviewStep && !isMobileLandscape && <p className="text-[10px] text-black300 mt-4 italic text-center shrink-0">💡 Nápis na známce můžete posouvat tažením prstu</p>}
        </div>

        {/* Schováno v landscape módu pro Full-Screen zážitek */}
        {isMobileTextStep && !isPreviewStep && !isMobileLandscape && (
          <div className="shrink-0 w-full bg-[#131C2E] border-t border-white/5 p-4 flex flex-col gap-3 shadow-2xl z-50">
            <textarea value={mainText} onChange={e => setMainText(e.target.value)} rows={2} className="w-full bg-black-custom/60 border border-white/10 text-secondary rounded-lg p-2 text-xs outline-none focus:border-primary resize-none"/>
            <div className="flex items-center gap-2"><select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="flex-1 bg-black-custom/60 border border-white/10 rounded-lg p-2 text-xs text-secondary font-medium">{FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-black-custom">{f.name}</option>)}</select><div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center shrink-0"><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute w-12 h-12 cursor-pointer scale-150"/></div><div className="flex bg-black-custom/60 p-0.5 rounded-lg justify-between shrink-0">{(['left', 'center', 'right'] as const).map(a => <button key={a} type="button" onClick={() => setTextAlign(a)} className={`px-2.5 py-1 text-[9px] font-bold rounded ${textAlign === a ? 'bg-primary text-black-custom' : 'text-white/40'}`}>{{left:'L',center:'C',right:'R'}[a]}</button>)}</div></div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2"><div className="flex items-center gap-2"><input type="checkbox" id="mob-shadow" checked={useShadow} onChange={e => setUseShadow(e.target.checked)} className="w-4 h-4 accent-primary"/><label htmlFor="mob-shadow" className="text-[10px] font-bold text-white opacity-50 uppercase">Stín</label></div><input type="range" min="16" max="64" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-24 accent-primary"/></div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🏁 FIXNÍ PATIČKA */}
      {/* ======================================================== */}
      
      {/* DESKTOP FOOTER */}
      <footer className="hidden md:flex fixed bottom-0 left-0 w-full bg-[#252C3C] border-t border-[#2B3755] h-[116px] items-center justify-center z-50">
        <div className="w-full max-w-[1440px] mx-auto px-[84px] flex justify-between items-center">
          <Button onClick={() => window.history.back()} variant="outlined" arrow="left">Zpět</Button>
          <Button onClick={onComplete} disabled={!allPhotosFilled} arrow="right">Dokončit</Button>
        </div>
      </footer>

      {/* MOBILE FOOTER (Schováno v landscape pro Full-Screen zážitek) */}
      {!isMobileLandscape && (
        <footer className="flex md:hidden fixed bottom-0 left-0 w-full bg-[#252C3C] border-t border-[#2B3755] h-[80px] items-center justify-center z-50">
          <div className="w-full px-4 flex justify-between items-center">
            <Button 
              onClick={() => { if (mobileStep > 0) setMobileStep(prev => prev - 1); else window.history.back(); }} 
              variant="outlined" arrow="left"
            >Zpět</Button>
            <Button 
              onClick={() => {
                if (isPreviewStep) onComplete();
                else if (isLastSlotStep) handleMobilePreview();
                else setMobileStep(prev => prev + 1);
              }} 
              disabled={!isPreviewStep && currentMobileSlot?.id !== '1' && !photos[currentMobileSlot?.id as string]}
              arrow="right"
            >
              {isPreviewStep ? 'Dokončit' : isLastSlotStep ? 'Náhled' : 'Další krok'}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}