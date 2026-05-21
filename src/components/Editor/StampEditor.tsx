'use client';

import { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Button from '@/components/Button';
import { TEMPLATES } from '@/lib/editorConfig';
import { supabase } from '@/lib/supabase';

const FONT_OPTIONS = [
  { name: 'Výchozí (Sans-serif)', value: 'sans-serif' },
  { name: 'Moderní (Poppins)', value: 'Poppins' },
  { name: 'Elegantní (Playfair Display)', value: 'Playfair Display' },
  { name: 'Psací (Dancing Script)', value: 'Dancing Script' },
  { name: 'Retro (Pacifico)', value: 'Pacifico' },
];

interface PhotoState { url: string; scale: number; x: number; y: number; }
interface StampEditorProps { onComplete: (stampId?: string) => void; isMobileLandscape?: boolean; }

export default function StampEditor({ onComplete, isMobileLandscape = false }: StampEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTemplate = TEMPLATES[0];

  const [photos, setPhotos] = useState<Record<string, PhotoState>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const targetSlotIdRef = useRef<string | null>(null);

  const [mobileStep, setMobileStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLandscapeHint, setShowLandscapeHint] = useState(false);

  const [viewRatio, setViewRatio] = useState(1);

  const [mainText, setMainText] = useState('Vlastní text');
  const [textColor, setTextColor] = useState('#FF6B35'); // Výchozí primary barva (bude se propisovat do canvasu)
  const [fontSize, setFontSize] = useState(120);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });
  const [useShadow, setUseShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(15);

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
  
  const photoSlotsOnly = activeTemplate.slots.filter(s => s.id !== '1');
  const totalPhotoSlots = photoSlotsOnly.length;
  const currentPhotoIndex = activeTemplate.slots.slice(0, mobileStep + 1).filter(s => s.id !== '1').length;
  const allPhotosFilled = photoSlotsOnly.every(slot => photos[slot.id]);

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

  useEffect(() => {
    const updateRatio = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile && currentMobileSlot) {
        const el = document.querySelector(`.mobile-slot-${currentMobileSlot.id}`);
        if (el) setViewRatio(currentMobileSlot.width / el.getBoundingClientRect().width);
      } else {
        const el = document.querySelector('.desktop-canvas-wrapper');
        if (el) setViewRatio(activeTemplate.width / el.getBoundingClientRect().width);
      }
    };
    updateRatio();
    window.addEventListener('resize', updateRatio);
    const t = setTimeout(updateRatio, 50);
    return () => { window.removeEventListener('resize', updateRatio); clearTimeout(t); };
  }, [mobileStep, currentMobileSlot, activeTemplate]);

  useEffect(() => {
    if (isPreviewStep) { setActiveSlotId(null); return; }
    if (currentMobileSlot) { setActiveSlotId(currentMobileSlot.id); targetSlotIdRef.current = currentMobileSlot.id; }
  }, [mobileStep, currentMobileSlot, isPreviewStep]);

  useEffect(() => {
    if (isMobileLandscape) {
      setShowLandscapeHint(true);
      const timer = setTimeout(() => setShowLandscapeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobileLandscape]);

  const safeRatio = viewRatio || 1;

  const MobileMiniMap = () => (
    <div className="relative bg-black-custom/60 shadow-inner overflow-hidden shrink-0 border border-black300/20 rounded-[4px]" style={{ aspectRatio: `${activeTemplate.width} / ${activeTemplate.height}`, height: '36px' }}>
      {activeTemplate.slots.map(slot => (
        <div key={slot.id} className={`absolute border border-black-custom/40 transition-colors ${slot.id === '1' ? 'bg-transparent border-dashed border-secondary/30' : (activeSlotId === slot.id || photos[slot.id]) ? 'bg-success' : 'bg-secondary/20'}`} style={{ left: `${(slot.x / activeTemplate.width) * 100}%`, top: `${(slot.y / activeTemplate.height) * 100}%`, width: `${(slot.width / activeTemplate.width) * 100}%`, height: `${(slot.height / activeTemplate.height) * 100}%` }} />
      ))}
    </div>
  );

  const handleSlotClick = (slotId: string) => { targetSlotIdRef.current = slotId; setActiveSlotId(slotId); if (!photos[slotId]) fileInputRef.current?.click(); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file || !targetSlotIdRef.current) return; setPhotos(prev => ({ ...prev, [targetSlotIdRef.current!]: { url: URL.createObjectURL(file), scale: 1, x: 0, y: 0 } })); e.target.value = ''; };
  const handleDeletePhoto = (slotId: string, e: React.MouseEvent) => { e.stopPropagation(); setPhotos(prev => { const copy = { ...prev }; delete copy[slotId]; return copy; }); if (targetSlotIdRef.current === slotId) targetSlotIdRef.current = null; };

  const getTouchDistance = (touches: React.TouchList) => { return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2)); };

  const handleMouseDown = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    isDragging.current = type; dragStart.current = { x: e.clientX, y: e.clientY };
    if (slotId) { setActiveSlotId(slotId); targetSlotIdRef.current = slotId; }
    if (type === 'photo' && photos[slotId]) photoStart.current = { x: photos[slotId].x, y: photos[slotId].y };
    else if (type === 'resize' && photos[slotId]) scaleStart.current = photos[slotId].scale;
    else if (type === 'text') textPercentStart.current = { x: textPos.x, y: textPos.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !activeSlotId) return;
    const dx = e.clientX - dragStart.current.x; const dy = e.clientY - dragStart.current.y;
    if (isDragging.current === 'photo' && photos[activeSlotId]) setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + (dx * safeRatio), y: photoStart.current.y + (dy * safeRatio) } }));
    else if (isDragging.current === 'resize' && photos[activeSlotId]) setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + (dx + dy) * 0.005), 5) } }));
    else if (isDragging.current === 'text' && activeSlotId === '1') {
      const textSlot = activeTemplate.slots.find(s => s.id === '1');
      if (textSlot) setTextPos({ x: Math.min(Math.max(0, textPercentStart.current.x + (dx / (textSlot.width / safeRatio)) * 100), 100), y: Math.min(Math.max(0, textPercentStart.current.y + (dy / (textSlot.height / safeRatio)) * 100), 100) });
    }
  };

  const handleTouchStart = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    if (slotId) { setActiveSlotId(slotId); targetSlotIdRef.current = slotId; }
    if (e.touches.length === 2 && type === 'photo' && photos[slotId]) { isDragging.current = 'photo'; initialTouchDistance.current = getTouchDistance(e.touches); scaleStart.current = photos[slotId].scale; }
    else if (e.touches.length === 1) { isDragging.current = type; dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; if (type === 'photo' && photos[slotId]) photoStart.current = { x: photos[slotId].x, y: photos[slotId].y }; else if (type === 'resize' && photos[slotId]) scaleStart.current = photos[slotId].scale; else if (type === 'text') textPercentStart.current = { x: textPos.x, y: textPos.y }; }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !activeSlotId) return;
    if (e.touches.length === 2 && isDragging.current === 'photo' && initialTouchDistance.current && photos[activeSlotId]) { const factor = getTouchDistance(e.touches) / initialTouchDistance.current; setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current * factor), 5) } })); }
    else if (e.touches.length === 1 && dragStart.current) {
      const dx = e.touches[0].clientX - dragStart.current.x; const dy = e.touches[0].clientY - dragStart.current.y;
      if (isDragging.current === 'photo' && photos[activeSlotId]) setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + (dx * safeRatio), y: photoStart.current.y + (dy * safeRatio) } }));
      else if (isDragging.current === 'resize' && photos[activeSlotId]) setPhotos(prev => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + (dx + dy) * 0.005), 5) } }));
      else if (isDragging.current === 'text') { const textSlot = activeTemplate.slots.find(s => s.id === '1'); if (textSlot) setTextPos({ x: Math.min(Math.max(0, textPercentStart.current.x + (dx / (textSlot.width / safeRatio)) * 100), 100), y: Math.min(Math.max(0, textPercentStart.current.y + (dy / (textSlot.height / safeRatio)) * 100), 100) }); }
    }
  };

  const handleMouseUp = () => { isDragging.current = false; initialTouchDistance.current = null; };

  const generateCanvasDataUrl = async (includeBackground: boolean = true, targetWidth?: number): Promise<string> => {
    const tCanvas = document.createElement('canvas'); tCanvas.width = activeTemplate.width; tCanvas.height = activeTemplate.height;
    const ctx = tCanvas.getContext('2d'); if (!ctx) return '';
    
    if (includeBackground) {
      const bgImg = new window.Image(); bgImg.src = activeTemplate.backgroundImage;
      await new Promise(r => bgImg.onload = r); 
      ctx.drawImage(bgImg, 0, 0, tCanvas.width, tCanvas.height);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tCanvas.width, tCanvas.height);
    }

    for (const slot of activeTemplate.slots) {
      const photo = photos[slot.id]; if (!photo) continue;
      const userImg = new window.Image(); userImg.src = photo.url; await new Promise(r => userImg.onload = r);
      ctx.save(); ctx.beginPath(); ctx.rect(slot.x, slot.y, slot.width, slot.height); ctx.clip();
      const s = Math.max(slot.width / userImg.width, slot.height / userImg.height) * photo.scale;
      ctx.drawImage(userImg, slot.x + (slot.width - userImg.width * s) / 2 + photo.x, slot.y + (slot.height - userImg.height * s) / 2 + photo.y, userImg.width * s, userImg.height * s); ctx.restore();
    }
    const tS = activeTemplate.slots.find(s => s.id === '1');
    if (tS) { 
      ctx.save(); if (useShadow) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4; } 
      ctx.fillStyle = textColor; ctx.font = `bold ${fontSize}px ${fontFamily}`; ctx.textAlign = textAlign; ctx.textBaseline = 'middle'; 
      mainText.split('\n').forEach((line, i) => ctx.fillText(line, tS.x + (textPos.x/100)*tS.width, tS.y + (textPos.y/100)*tS.height + i * (fontSize*1.05))); ctx.restore(); 
    }

    if (targetWidth && targetWidth < tCanvas.width) {
      const scale = targetWidth / tCanvas.width;
      const resCanvas = document.createElement('canvas');
      resCanvas.width = targetWidth;
      resCanvas.height = tCanvas.height * scale;
      const resCtx = resCanvas.getContext('2d');
      if (resCtx) {
        resCtx.drawImage(tCanvas, 0, 0, resCanvas.width, resCanvas.height);
        return resCanvas.toDataURL('image/jpeg', 0.85); 
      }
    }

    return tCanvas.toDataURL('image/jpeg', 0.95);
  };

  const uploadBase64ToBlob = async (base64Data: string, filename: string) => {
    const res = await fetch(base64Data);
    const blob = await res.blob();
    const response = await fetch(`/api/upload-stamp?filename=${filename}`, { method: 'POST', body: blob });
    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  };

  const handleMobilePreview = async () => {
    setMobileStep(totalSlotsSteps); setIsGeneratingPreview(true);
    const dataUrl = await generateCanvasDataUrl(true, 1080);
    setPreviewUrl(dataUrl); setIsGeneratingPreview(false);
  };

  const handleUploadAndComplete = async () => {
    setIsUploading(true);
    try {
      const previewDataUrl = await generateCanvasDataUrl(true, 1080);
      const printDataUrl = await generateCanvasDataUrl(false);
      const timestamp = Date.now();
      
      const previewUpload = await uploadBase64ToBlob(previewDataUrl, `preview-${timestamp}.jpg`);
      const printUpload = await uploadBase64ToBlob(printDataUrl, `print-${timestamp}.jpg`);
      
      const TEMPLATE_PRODUCT_ID = "2923bbf0-2f34-4cd5-b586-7c1c7ba1977b"; 
      
      const { data, error } = await supabase
        .from('custom_stamps')
        .insert([{ product_id: TEMPLATE_PRODUCT_ID, preview_url: previewUpload.url, print_url: printUpload.url }])
        .select('id').single();

      if (error) throw error;
      onComplete(data.id); 
      
    } catch (error) {
      console.error(error);
      alert('Něco se pokazilo při ukládání archu. Zkuste to prosím znovu.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex-1 min-h-0 w-full flex flex-col justify-between text-secondary select-none bg-black-custom ${!isPreviewStep ? 'touch-none' : ''}`} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
      {showLandscapeHint && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-primary text-black-custom style-body-bold px-4 py-2 rounded-full shadow-2xl animate-pulse pointer-events-none whitespace-nowrap">
          Otočte zpět na výšku pro zobrazení menu
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="opacity-0 absolute w-0 h-0 pointer-events-none" accept="image/*" />

      {/* ======================================================== */}
      {/* 🖥️ DESKTOPOVÝ REŽIM */}
      {/* ======================================================== */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 w-full relative">
        <div className="flex-1 min-h-0 w-full flex items-center justify-center p-8 pb-[140px]" onClick={() => setActiveSlotId(null)}>
          <div className="desktop-canvas-wrapper relative shadow-2xl bg-secondary border border-black300/10 shrink-0 touch-none rounded-[4px] overflow-hidden" style={{ aspectRatio: `${activeTemplate.width} / ${activeTemplate.height}`, height: '100%', maxWidth: '100%' }} onClick={(e) => e.stopPropagation()}>
            <img src={activeTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Šablona" />
            {activeTemplate.slots.map((slot) => (
              <div key={slot.id} data-slot-id={slot.id} className={`absolute border border-dashed cursor-pointer overflow-hidden group transition-colors ${activeSlotId === slot.id ? 'border-primary bg-primary/10' : 'border-secondary/30 hover:border-primary/50 bg-black-custom/5'}`} style={{ left: `${(slot.x/activeTemplate.width)*100}%`, top: `${(slot.y/activeTemplate.height)*100}%`, width: `${(slot.width/activeTemplate.width)*100}%`, height: `${(slot.height/activeTemplate.height)*100}%`, zIndex: slot.id === '1' ? 10 : 5 }} onClick={(e) => { e.stopPropagation(); handleSlotClick(slot.id); }}>
                {photos[slot.id] ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden" onMouseDown={(e) => handleMouseDown('photo', slot.id, e)}>
                    <img src={photos[slot.id].url} className="w-full h-full object-cover origin-center pointer-events-none" style={{ transform: `translate(${photos[slot.id].x / safeRatio}px, ${photos[slot.id].y / safeRatio}px) scale(${photos[slot.id].scale})` }} />
                    <button onClick={(e) => handleDeletePhoto(slot.id, e)} className="absolute top-2 right-2 w-8 h-8 bg-tag-posledni-kusy/90 text-secondary font-bold rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md hover:bg-tag-posledni-kusy">✕</button>
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary hover:bg-primary-hover flex items-center justify-center cursor-se-resize z-20 shadow-md rounded-tl-[8px] transition-colors" onMouseDown={(e) => handleMouseDown('resize', slot.id, e)} onClick={(e) => e.stopPropagation()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black-custom" strokeWidth="3"><polyline points="9 3 3 3 3 9"/><polyline points="15 21 21 21 21 15"/><line x1="3" y1="3" x2="21" y2="21"/></svg></div>
                  </div>
                ) : slot.id !== '1' && <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2 text-center style-body-bold text-black300 opacity-50 group-hover:opacity-100 transition-opacity">Vložit fotku</div>}
                {slot.id === '1' && <div className="absolute cursor-move select-none p-2 whitespace-pre active:opacity-80 group w-max max-w-full touch-none" style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize / safeRatio}px`, fontFamily: fontFamily, fontWeight: 'bold', textAlign: textAlign, lineHeight: 1.05, textShadow: useShadow ? `3px 3px ${shadowBlur / safeRatio}px ${shadowColor}` : 'none', zIndex: 40 }} onMouseDown={(e) => handleMouseDown('text', '1', e)}><span className="relative z-10 border border-transparent group-hover:border-primary/50 p-1 rounded inline-block">{mainText}</span></div>}
              </div>
            ))}
          </div>
        </div>
        {activeSlotId === '1' && (
          <div className="absolute bottom-0 left-0 w-full bg-black400 border-t border-black300/30 px-[84px] py-6 grid grid-cols-3 gap-8 items-center shadow-2xl z-50 animate-[fadeIn_0.15s_ease-out]">
            <div className="space-y-2">
              <label className="style-product-tag text-black300">Nápis na známku</label>
              <textarea value={mainText} onChange={e => setMainText(e.target.value)} rows={2} className="w-full bg-black-custom border border-black300/30 text-secondary rounded-[8px] p-3 style-body outline-none focus:border-primary transition-colors resize-none whitespace-pre-wrap placeholder:text-black300/50"/>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="flex-1 bg-black-custom border border-black300/30 rounded-[8px] p-3 style-body-bold text-secondary outline-none focus:border-primary">
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
                <div className="relative w-12 h-12 rounded-[8px] overflow-hidden border border-black300/30 flex items-center justify-center shrink-0">
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute w-16 h-16 cursor-pointer scale-150"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <input type="range" min="40" max="400" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-primary"/>
                <div className="flex bg-black-custom p-1 rounded-[8px] border border-black300/30 justify-between">
                  {(['left', 'center', 'right'] as const).map(a => <button key={a} type="button" onClick={() => setTextAlign(a)} className={`px-4 py-1.5 style-product-tag rounded-[4px] transition-all ${textAlign === a ? 'bg-primary text-black-custom font-bold' : 'text-black300 hover:text-secondary'}`}>{{left:'L',center:'C',right:'R'}[a]}</button>)}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="shadow-check" checked={useShadow} onChange={e => setUseShadow(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer rounded-[4px]"/>
                <label htmlFor="shadow-check" className="style-product-tag text-black300 cursor-pointer hover:text-secondary transition-colors">Stín písma</label>
              </div>
              {useShadow && <input type="range" min="1" max="50" value={shadowBlur} onChange={e => setShadowBlur(Number(e.target.value))} className="w-full max-w-[200px] accent-primary"/>}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 📱 MOBILNÍ REŽIM WIZARDU */}
      {/* ======================================================== */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 w-full relative overflow-hidden bg-black-custom">
        {!isMobileLandscape && (
          <div className="w-full bg-black400 py-3 px-4 flex justify-between items-center border-b border-black300/30 shrink-0 z-40">
            <div className="flex flex-col">
              <span className="style-product-tag text-black300 mb-0.5">Návrh archu</span>
              <span className="style-body-bold text-secondary">{isPreviewStep ? 'Finální náhled' : isMobileTextStep ? 'Úprava nápisu' : `Fotografie ${currentPhotoIndex} z ${totalPhotoSlots}`}</span>
            </div>
            {!isPreviewStep && !isMobileTextStep && <MobileMiniMap />}
          </div>
        )}
        
        <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {isPreviewStep ? (
            isGeneratingPreview ? <div className="animate-pulse style-body-bold text-primary flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>Generuji arch k tisku...</div> : (
              <TransformWrapper centerOnInit={true} initialScale={1} minScale={1} maxScale={5}>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={previewUrl || ''} className="max-w-full max-h-full object-contain shadow-2xl border border-black300/30 rounded-[4px]" alt="Preview" />
                </TransformComponent>
              </TransformWrapper>
            )
          ) : (
            <div className="mobile-slot-wrapper w-full h-full flex items-center justify-center">
              <div className="relative shadow-2xl bg-secondary/5 border border-primary shrink-0 flex items-center justify-center touch-none max-w-full max-h-full rounded-[4px] overflow-hidden" onClick={() => handleSlotClick(currentMobileSlot!.id)}>
                <svg viewBox={`0 0 ${currentMobileSlot!.width} ${currentMobileSlot!.height}`} className="w-[2000px] max-w-full max-h-full opacity-0 pointer-events-none" />
                <div data-slot-id={currentMobileSlot?.id} className={`mobile-slot-${currentMobileSlot?.id} absolute inset-0 w-full h-full overflow-hidden touch-none`}>
                  {photos[currentMobileSlot!.id] ? (
                    <div className="absolute inset-0 w-full h-full overflow-hidden touch-none" onTouchStart={(e) => handleTouchStart('photo', currentMobileSlot!.id, e)}>
                      <img src={photos[currentMobileSlot!.id].url} className="absolute inset-0 w-full h-full object-cover origin-center pointer-events-none" style={{ transform: `translate(${photos[currentMobileSlot!.id].x / safeRatio}px, ${photos[currentMobileSlot!.id].y / safeRatio}px) scale(${photos[currentMobileSlot!.id].scale})` }} />
                      <button onClick={(e) => handleDeletePhoto(currentMobileSlot!.id, e)} className="absolute top-3 right-3 w-10 h-10 bg-tag-posledni-kusy/90 text-secondary font-bold rounded-full style-body flex items-center justify-center z-30 shadow-lg">✕</button>
                      <div className="absolute bottom-0 right-0 w-12 h-12 bg-primary flex items-center justify-center z-20 shadow-md rounded-tl-[12px]" onTouchStart={(e) => handleTouchStart('resize', currentMobileSlot!.id, e)} onClick={(e) => e.stopPropagation()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black-custom" strokeWidth="3"><polyline points="9 3 3 3 3 9"/><polyline points="15 21 21 21 21 15"/><line x1="3" y1="3" x2="21" y2="21"/></svg></div>
                    </div>
                  ) : !isMobileTextStep && <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center gap-4"><div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-light text-4xl shadow-inner">+</div><span className="style-product-tag text-primary">Nahrát fotografii</span></div>}
                  {isMobileTextStep && <div className="absolute cursor-move select-none p-3 whitespace-pre active:opacity-80 w-max max-w-full touch-none" style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize / safeRatio}px`, fontFamily: fontFamily, fontWeight: 'bold', textAlign: textAlign, lineHeight: 1.05, textShadow: useShadow ? `3px 3px ${shadowBlur / safeRatio}px ${shadowColor}` : 'none', zIndex: 40 }} onTouchStart={(e) => handleTouchStart('text', '1', e)}><span className="border border-primary border-dashed bg-black-custom/60 backdrop-blur-sm p-2 rounded-[8px] inline-block">{mainText}</span></div>}
                </div>
              </div>
            </div>
          )}
          {isMobileTextStep && !isPreviewStep && !isMobileLandscape && <p className="style-body text-black300 mt-4 text-center shrink-0">💡 Nápis na známce můžete posouvat tažením prstu</p>}
          {isPreviewStep && !isMobileLandscape && <p className="absolute bottom-6 left-0 w-full style-body text-black300 text-center pointer-events-none drop-shadow-md bg-black-custom/40 py-1 backdrop-blur-sm">💡 Arch můžete přibližovat a posouvat dvěma prsty</p>}
        </div>
        {isMobileTextStep && !isPreviewStep && !isMobileLandscape && (
          <div className="shrink-0 w-full bg-black400 border-t border-black300/30 p-4 flex flex-col gap-4 z-50">
            <div className="space-y-2">
              <label className="style-product-tag text-black300">Nápis na známku</label>
              <textarea value={mainText} onChange={e => setMainText(e.target.value)} rows={2} className="w-full bg-black-custom border border-black300/30 text-secondary rounded-[8px] p-3 style-body outline-none focus:border-primary resize-none placeholder:text-black300/50"/>
            </div>
            <div className="flex items-center gap-3">
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="flex-1 bg-black-custom border border-black300/30 rounded-[8px] p-3 style-body-bold text-secondary outline-none focus:border-primary">
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
              </select>
              <div className="relative w-11 h-11 rounded-[8px] overflow-hidden border border-black300/30 flex items-center justify-center shrink-0">
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute w-14 h-14 cursor-pointer scale-150"/>
              </div>
              <div className="flex bg-black-custom p-1 rounded-[8px] border border-black300/30 justify-between shrink-0">
                {(['left', 'center', 'right'] as const).map(a => <button key={a} type="button" onClick={() => setTextAlign(a)} className={`px-3 py-1.5 style-product-tag rounded-[4px] ${textAlign === a ? 'bg-primary text-black-custom font-bold' : 'text-black300'}`}>{{left:'L',center:'C',right:'R'}[a]}</button>)}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-black300/30 pt-3 mt-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="mob-shadow" checked={useShadow} onChange={e => setUseShadow(e.target.checked)} className="w-5 h-5 accent-primary rounded-[4px]"/>
                <label htmlFor="mob-shadow" className="style-product-tag text-black300">Stín</label>
              </div>
              <input type="range" min="40" max="400" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-[140px] accent-primary"/>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🏁 FIXNÍ PATIČKA */}
      {/* ======================================================== */}
      <footer className="hidden lg:flex fixed bottom-0 left-0 w-full bg-black500 border-t border-black300/30 h-[116px] items-center justify-center z-50">
        <div className="w-full max-w-[1440px] mx-auto px-[84px] flex justify-between items-center">
          <Button onClick={() => window.history.back()} variant="outlined" arrow="left">Zpět</Button>
          <Button onClick={handleUploadAndComplete} disabled={!allPhotosFilled || isUploading} arrow="right">
            {isUploading ? 'Ukládám...' : 'Dokončit'}
          </Button>
        </div>
      </footer>

      {!isMobileLandscape && (
        <footer className="flex lg:hidden fixed bottom-0 left-0 w-full bg-black500 border-t border-black300/30 h-[80px] items-center justify-center z-50 pb-safe">
          <div className="w-full px-4 flex justify-between items-center">
            <Button onClick={() => { if (mobileStep > 0) setMobileStep(prev => prev - 1); else window.history.back(); }} variant="outlined" arrow="left" disabled={isUploading}>Zpět</Button>
            <Button onClick={() => { if (isPreviewStep) handleUploadAndComplete(); else if (isLastSlotStep) handleMobilePreview(); else setMobileStep(prev => prev + 1); }} disabled={(!isPreviewStep && currentMobileSlot?.id !== '1' && !photos[currentMobileSlot?.id as string]) || isUploading} arrow="right">
              {isUploading ? 'Ukládám...' : isPreviewStep ? 'Dokončit' : isLastSlotStep ? 'Náhled' : 'Další krok'}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}