'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import { TEMPLATES, Template, PhotoState, TextState } from '@/lib/editorConfig';
import { generateCanvasDataUrl, uploadBase64ToBlob } from '@/lib/canvasUtils';
import { supabase } from '@/lib/supabase';
import TextControls from './TextControls';
import ColorPickerInput from './ColorPickerInput';

type MiniMapProps = {
  template: Template;
  activeSlotId: string | null;
  mainText: string;
  photos: Record<string, PhotoState>;
};

function MobileMiniMap({ template, activeSlotId, mainText, photos }: MiniMapProps) {
  const minX = Math.min(...template.slots.map((s) => s.x));
  const minY = Math.min(...template.slots.map((s) => s.y));
  const maxX = Math.max(...template.slots.map((s) => s.x + s.width));
  const maxY = Math.max(...template.slots.map((s) => s.y + s.height));
  const bWidth = maxX - minX;
  const bHeight = maxY - minY;
  return (
    <div className="relative bg-black400 rounded-[4px] shrink-0" style={{ width: '143px', height: '88px', padding: '8px' }}>
      <div className="relative w-full h-full">
        {template.slots.map((slot) => {
          const isActive = activeSlotId === slot.id;
          const isFilled = !!photos[slot.id];
          const leftPercent = ((slot.x - minX) / bWidth) * 100;
          const topPercent = ((slot.y - minY) / bHeight) * 100;
          const widthPercent = (slot.width / bWidth) * 100;
          const heightPercent = (slot.height / bHeight) * 100;
          return (
            <div key={slot.id}
              className={`absolute transition-all duration-300 rounded-[1px] ${isActive ? 'border-2 border-primary z-10' : isFilled ? 'bg-success' : 'border border-black300'}`}
              style={{ left: `calc(${leftPercent}% + 2px)`, top: `calc(${topPercent}% + 2px)`, width: `calc(${widthPercent}% - 4px)`, height: `calc(${heightPercent}% - 4px)` }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface StampEditorProps {
  onComplete: (stampId?: string) => void;
  templateId: string;
}

export default function StampEditor({ onComplete, templateId }: StampEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

  const [photos, setPhotos] = useState<Record<string, PhotoState>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const targetSlotIdRef = useRef<string | null>(null);

  const [mobileStep, setMobileStep] = useState(0);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [viewRatio, setViewRatio] = useState(1);

  const [mainText, setMainText] = useState('');
  const [textColor, setTextColor] = useState('#059669');
  const [fontSize, setFontSize] = useState(80);
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textPos, setTextPos] = useState({ x: 50, y: 78 });
  const [useShadow, setUseShadow] = useState(false);
  const [shadowColor] = useState('#000000');
  const [shadowBlur] = useState(15);

  const [desktopSize, setDesktopSize] = useState<{ w: number; h: number } | null>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef<false | 'photo' | 'text' | 'resize'>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const photoStart = useRef({ x: 0, y: 0 });
  const scaleStart = useRef(1);
  const textPercentStart = useRef({ x: 50, y: 50 });
  const initialTouchDistance = useRef<number | null>(null);

  const photoSlotsOnly = activeTemplate.slots.filter((s) => s.type !== 'text');
  const textSlot = activeTemplate.slots.find((s) => s.type === 'text');
  const totalSlotsSteps = activeTemplate.slots.length;
  const isPreviewStep = mobileStep === totalSlotsSteps;
  const isLastSlotStep = mobileStep === totalSlotsSteps - 1;
  const currentMobileSlot = isPreviewStep ? null : activeTemplate.slots[mobileStep];
  const isMobileTextStep = currentMobileSlot?.type === 'text';
  const allPhotosFilled = photoSlotsOnly.every((slot) => photos[slot.id]);

  const textState: TextState = { mainText, textColor, fontSize, fontFamily, textAlign, textPos, useShadow, shadowColor, shadowBlur };

  useEffect(() => {
    const updateRatio = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && currentMobileSlot) {
        const el = document.querySelector(`.mobile-slot-${currentMobileSlot.id}`);
        if (el) setViewRatio(currentMobileSlot.width / el.getBoundingClientRect().width);
      } else {
        const container = desktopContainerRef.current;
        if (container) {
          const cs = getComputedStyle(container);
          const cw = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const ch = container.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
          const ratio = activeTemplate.width / activeTemplate.height;
          const w = cw / ch > ratio ? ch * ratio : cw;
          const h = w / ratio;
          setDesktopSize({ w, h });
          setViewRatio(activeTemplate.width / w);
        }
      }
    };
    updateRatio();
    window.addEventListener('resize', updateRatio);
    const t = setTimeout(updateRatio, 50);
    return () => { window.removeEventListener('resize', updateRatio); clearTimeout(t); };
  }, [mobileStep, currentMobileSlot, activeTemplate]);

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    if (isPreviewStep || showThankYou) { setActiveSlotId(null); return; }
    if (currentMobileSlot) { setActiveSlotId(currentMobileSlot.id); targetSlotIdRef.current = currentMobileSlot.id; }
  }, [mobileStep, currentMobileSlot, isPreviewStep, showThankYou]);

  useEffect(() => { setShowTextPanel(false); }, [mobileStep]);

  const safeRatio = viewRatio || 1;

  const handleSlotClick = (slotId: string) => {
    targetSlotIdRef.current = slotId;
    setActiveSlotId(slotId);
    const slot = activeTemplate.slots.find((s) => s.id === slotId);
    if (slot?.type !== 'text' && !photos[slotId]) fileInputRef.current?.click();
  };

  const openPhotoPickerForSlot = (slotId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    targetSlotIdRef.current = slotId;
    setActiveSlotId(slotId);
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSlotIdRef.current) return;
    setPhotos((prev) => ({ ...prev, [targetSlotIdRef.current!]: { url: URL.createObjectURL(file), scale: 1, x: 0, y: 0 } }));
    e.target.value = '';
  };

  const handleDeletePhoto = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => { const copy = { ...prev }; delete copy[slotId]; return copy; });
    if (targetSlotIdRef.current === slotId) targetSlotIdRef.current = null;
  };

  const getTouchDistance = (touches: React.TouchList) =>
    Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2));

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
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (isDragging.current === 'photo' && photos[activeSlotId]) {
      setPhotos((prev) => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + dx * safeRatio, y: photoStart.current.y + dy * safeRatio } }));
    } else if (isDragging.current === 'resize' && photos[activeSlotId]) {
      setPhotos((prev) => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + (dx + dy) * 0.005), 5) } }));
    } else if (isDragging.current === 'text' && textSlot) {
      setTextPos({ x: Math.min(Math.max(0, textPercentStart.current.x + (dx / (textSlot.width / safeRatio)) * 100), 100), y: Math.min(Math.max(0, textPercentStart.current.y + (dy / (textSlot.height / safeRatio)) * 100), 100) });
    }
  };

  const handleTouchStart = (type: 'photo' | 'text' | 'resize', slotId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    if (slotId) { setActiveSlotId(slotId); targetSlotIdRef.current = slotId; }
    if (e.touches.length === 2 && type === 'photo' && photos[slotId]) {
      isDragging.current = 'photo'; initialTouchDistance.current = getTouchDistance(e.touches); scaleStart.current = photos[slotId].scale;
    } else if (e.touches.length === 1) {
      isDragging.current = type; dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (type === 'photo' && photos[slotId]) photoStart.current = { x: photos[slotId].x, y: photos[slotId].y };
      else if (type === 'resize' && photos[slotId]) scaleStart.current = photos[slotId].scale;
      else if (type === 'text') textPercentStart.current = { x: textPos.x, y: textPos.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !activeSlotId) return;
    if (e.touches.length === 2 && isDragging.current === 'photo' && initialTouchDistance.current && photos[activeSlotId]) {
      const factor = getTouchDistance(e.touches) / initialTouchDistance.current;
      setPhotos((prev) => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current * factor), 5) } }));
    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      if (isDragging.current === 'photo' && photos[activeSlotId]) {
        setPhotos((prev) => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], x: photoStart.current.x + dx * safeRatio, y: photoStart.current.y + dy * safeRatio } }));
      } else if (isDragging.current === 'resize' && photos[activeSlotId]) {
        setPhotos((prev) => ({ ...prev, [activeSlotId]: { ...prev[activeSlotId], scale: Math.min(Math.max(1, scaleStart.current + (dx + dy) * 0.005), 5) } }));
      } else if (isDragging.current === 'text' && textSlot) {
        setTextPos({ x: Math.min(Math.max(0, textPercentStart.current.x + (dx / (textSlot.width / safeRatio)) * 100), 100), y: Math.min(Math.max(0, textPercentStart.current.y + (dy / (textSlot.height / safeRatio)) * 100), 100) });
      }
    }
  };

  const handleMouseUp = () => { isDragging.current = false; initialTouchDistance.current = null; };

  const handleMobilePreview = async () => {
    setMobileStep(totalSlotsSteps);
    setIsGeneratingPreview(true);
    const dataUrl = await generateCanvasDataUrl(activeTemplate, photos, textState, true, 1080);
    setPreviewUrl(dataUrl);
    setIsGeneratingPreview(false);
  };

  const handleUploadAndComplete = async () => {
    setIsUploading(true);
    try {
      const previewDataUrl = await generateCanvasDataUrl(activeTemplate, photos, textState, true, 1080);
      const printDataUrl = await generateCanvasDataUrl(activeTemplate, photos, textState, false);
      const timestamp = Date.now();
      const previewUpload = await uploadBase64ToBlob(previewDataUrl, `arch-${timestamp}-nahled.jpg`, 'editor-orders');
      const printUpload = await uploadBase64ToBlob(printDataUrl, `arch-${timestamp}-tisk.jpg`, 'editor-orders');
      const { data, error } = await supabase
        .from('custom_stamps')
        .insert([{ product_id: activeTemplate.productId, preview_url: previewUpload.url, print_url: printUpload.url }])
        .select('id')
        .single();
      if (error) throw error;
      setShowThankYou(true);
      onComplete(data.id);
    } catch {
      alert('Chyba při ukládání archu.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`w-full flex flex-col text-secondary select-none bg-black font-poppins relative ${!isPreviewStep && !showThankYou ? 'touch-none' : ''}`}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}
    >
      <style>{`
        input[type="range"].custom-fontSize-slider { -webkit-appearance: none; appearance: none; height: 6px; width: 160px; border-radius: 4px; outline: none; }
        input[type="range"].custom-fontSize-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #059669; cursor: pointer; }
        input[type="range"].custom-fontSize-slider::-moz-range-thumb { height: 24px; width: 24px; border-radius: 50%; background: #059669; cursor: pointer; border: none; }
      `}</style>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="opacity-0 absolute w-0 h-0 pointer-events-none" accept="image/*" />

      {/* DESKTOP */}
      <div className="hidden md:flex flex-col w-full min-h-[calc(100vh-80px)]" style={{ paddingBottom: showThankYou ? '0px' : '64px' }}>
        <div ref={desktopContainerRef} className="flex-1 w-full flex items-center justify-center p-8" onClick={() => setActiveSlotId(null)}>
          <div
            className="desktop-canvas-wrapper relative shadow-2xl bg-secondary border border-black300/10 shrink-0 touch-none rounded-[4px] overflow-hidden"
            style={desktopSize
              ? { width: `${desktopSize.w}px`, height: `${desktopSize.h}px` }
              : { aspectRatio: `${activeTemplate.width} / ${activeTemplate.height}`, height: '100%', maxWidth: '100%' }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <img src={activeTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Šablona" />
            {activeTemplate.slots.map((slot) => (
              <div key={slot.id} data-slot-id={slot.id}
                className={`absolute border-2 cursor-pointer overflow-hidden group transition-colors ${activeSlotId === slot.id ? 'border-success bg-success/10' : 'border-secondary/30 hover:border-success bg-secondary'}`}
                style={{ left: `${(slot.x / activeTemplate.width) * 100}%`, top: `${(slot.y / activeTemplate.height) * 100}%`, width: `${(slot.width / activeTemplate.width) * 100}%`, height: `${(slot.height / activeTemplate.height) * 100}%`, zIndex: slot.type === 'text' ? 10 : 5 }}
                onClick={(e) => { e.stopPropagation(); handleSlotClick(slot.id); }}
              >
                {/* Photo layer */}
                {photos[slot.id] ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden" onMouseDown={(e) => handleMouseDown('photo', slot.id, e)}>
                    <img src={photos[slot.id].url} className="w-full h-full object-contain origin-center pointer-events-none"
                      style={{ transform: `translate(${photos[slot.id].x / safeRatio}px, ${photos[slot.id].y / safeRatio}px) scale(${photos[slot.id].scale})` }}
                    />
                    <button onClick={(e) => handleDeletePhoto(slot.id, e)} className="absolute top-2 right-2 w-8 h-8 bg-tag-posledni-kusy/90 text-secondary font-bold rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md hover:bg-tag-posledni-kusy">✕</button>
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-success hover:bg-success/80 flex items-center justify-center cursor-se-resize z-20 shadow-md rounded-tl-[8px] transition-colors" onMouseDown={(e) => handleMouseDown('resize', slot.id, e)} onClick={(e) => e.stopPropagation()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black" strokeWidth="3"><polyline points="9 3 3 3 3 9" /><polyline points="15 21 21 21 21 15" /><line x1="3" y1="3" x2="21" y2="21" /></svg>
                    </div>
                  </div>
                ) : slot.type !== 'text' ? (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-secondary hover:bg-secondary/90 transition-colors">
                    <Image src="/images/add-image-ico.svg" alt="+" width={64} height={64} className="mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="style-body-bold text-black300 transition-opacity">Vložit fotku</span>
                  </div>
                ) : null}

                {/* Text slot: text overlay + photo upload trigger */}
                {slot.type === 'text' && (
                  <>
                    {mainText && (
                      <div className="absolute cursor-move select-none p-0 whitespace-pre active:opacity-80 group/text w-max max-w-full touch-none"
                        style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize / safeRatio}px`, fontFamily, fontWeight: '600', textAlign, lineHeight: 1.05, textShadow: useShadow ? `3px 3px ${shadowBlur / safeRatio}px ${shadowColor}` : 'none', zIndex: 40 }}
                        onMouseDown={(e) => handleMouseDown('text', slot.id, e)}
                      >
                        <span className="relative z-10 border border-transparent group-hover/text:border-primary/50 p-1 rounded inline-block">
                          {mainText}
                        </span>
                      </div>
                    )}
                    {!photos[slot.id] && (
                      <div
                        className="absolute top-0 left-0 right-0 flex items-center justify-center cursor-pointer z-[2] hover:opacity-80 transition-opacity"
                        style={{ height: '58%' }}
                        onClick={(e) => openPhotoPickerForSlot(slot.id, e)}
                      >
                        <Image src="/images/add-image-ico.svg" alt="+" width={64} height={64} className="opacity-80" />
                      </div>
                    )}
                    {!mainText && (
                      <div
                        className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-[5] text-center px-2"
                        style={{ height: '42%' }}
                        onClick={(e) => { e.stopPropagation(); handleSlotClick(slot.id); }}
                      >
                        <h2 className="style-h3 text-success">Napište vlastní text</h2>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {!showThankYou && (
          <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col bg-black500 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
            {activeSlotId === textSlot?.id && (
              <div className="w-full flex justify-center py-[24px] border-t border-black300/10 relative">
                <button
                  onClick={() => setActiveSlotId(null)}
                  className="absolute top-3 right-6 w-8 h-8 flex items-center justify-center text-black200 hover:text-secondary transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div className="flex gap-[48px] items-start">
                  <TextControls
                    mainText={mainText} setMainText={setMainText}
                    textColor={textColor} setTextColor={setTextColor}
                    fontSize={fontSize} setFontSize={setFontSize}
                    fontFamily={fontFamily} setFontFamily={setFontFamily}
                    textAlign={textAlign} setTextAlign={setTextAlign}
                    useShadow={useShadow} setUseShadow={setUseShadow}
                    checkboxId="shadow-check-desk"
                  />
                </div>
              </div>
            )}

            <footer className="w-full border-t border-black300/30 h-[64px] flex items-center justify-center">
              <div className="w-full max-w-[1440px] mx-auto px-[84px] flex justify-between items-center">
                <Button onClick={() => window.location.href = '/vytvorit-arch'} variant="outlined" arrow="left">Zpět</Button>
                <Button onClick={handleUploadAndComplete} disabled={!allPhotosFilled || isUploading} arrow="right">
                  {isUploading ? 'Ukládám...' : 'Dokončit'}
                </Button>
              </div>
            </footer>
          </div>
        )}
      </div>

      {/* MOBILE */}
      <div className="flex md:hidden flex-col w-full min-h-[calc(100vh-80px)]" style={{ paddingBottom: showThankYou ? '0px' : '80px' }}>
        {showThankYou ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full py-[48px] px-6">
            <div className="w-[80px] h-[80px] rounded-full border-[3px] border-success flex items-center justify-center mb-[32px]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 className="style-h1 text-secondary text-center mb-[32px]">Právě jste vytvořili svůj<br />kreativní arch!</h1>
            <p className="style-body text-secondary text-center mb-[64px] max-w-[300px] opacity-80">Skvělá práce, Váš grafický návrh jsme vložili do košíku a je připraven k tisku.</p>
            <div className="w-full flex flex-col gap-[16px] max-w-[300px]">
              <Button variant="outlined" onClick={() => window.location.href = '/'}>Na úvodní stránku</Button>
              <Button onClick={() => window.location.reload()}>Vytvořit další arch</Button>
              <Button onClick={() => window.location.href = '/kosik'}>Jít do košíku</Button>
            </div>
          </div>
        ) : isPreviewStep ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-8">
            <h1 className="style-h1 text-secondary mb-[32px]">Náhled finálního archu</h1>
            <div className="w-full bg-secondary p-1 rounded-[4px] shadow-2xl mb-[32px]">
              {isGeneratingPreview ? (
                <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-black200 animate-pulse">
                  <div className="w-10 h-10 border-4 border-success border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="style-body-bold text-success">Generuji...</span>
                </div>
              ) : (
                <img src={previewUrl || ''} className="w-full h-auto object-contain rounded-[2px]" alt="Preview" />
              )}
            </div>
            <p className="style-body text-secondary text-center opacity-80">Náhled můžete přiblížit sevřením dvou prstů.</p>
          </div>
        ) : (
          <>
            <div className="w-full flex items-center gap-[16px] pt-[32px] pb-[32px] px-6 shrink-0 z-40">
              <MobileMiniMap template={activeTemplate} activeSlotId={activeSlotId} mainText={mainText} photos={photos} />
              <div className="flex flex-col gap-[8px]">
                <h2 className="style-h3 text-secondary">
                  {activeTemplate.name}
                </h2>
                <span className="style-body text-secondary/70">
                  Fotografie {mobileStep + 1} z {totalSlotsSteps}
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full flex flex-col items-center pt-0 px-6 pb-6 relative overflow-hidden">
              <div className="mobile-slot-wrapper w-full flex items-center justify-center">
                <div
                  className="relative bg-secondary border-[3px] border-success w-full touch-none rounded-[4px] overflow-hidden"
                  style={{ aspectRatio: `${currentMobileSlot!.width} / ${currentMobileSlot!.height}`, maxHeight: '65vh' }}
                  onClick={() => handleSlotClick(currentMobileSlot!.id)}
                >
                  <div data-slot-id={currentMobileSlot?.id} className={`mobile-slot-${currentMobileSlot?.id} absolute inset-0 w-full h-full overflow-hidden touch-none`}>

                    {/* Photo upload placeholder — non-text slots only */}
                    {!photos[currentMobileSlot!.id] && currentMobileSlot?.type !== 'text' && (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-secondary cursor-pointer">
                        <Image src="/images/add-image-ico.svg" alt="Přidat" width={96} height={96} className="mb-1 opacity-80" />
                        <span className="style-body-bold text-black300 text-[20px]">Vložit fotku</span>
                      </div>
                    )}

                    {/* Photo with drag/resize — all slot types */}
                    {photos[currentMobileSlot!.id] && (
                      <div className="absolute inset-0 w-full h-full overflow-hidden touch-none" onTouchStart={(e) => handleTouchStart('photo', currentMobileSlot!.id, e)}>
                        <img src={photos[currentMobileSlot!.id].url} className="absolute inset-0 w-full h-full object-contain origin-center pointer-events-none"
                          style={{ transform: `translate(${photos[currentMobileSlot!.id].x / safeRatio}px, ${photos[currentMobileSlot!.id].y / safeRatio}px) scale(${photos[currentMobileSlot!.id].scale})` }}
                        />
                        <button onClick={(e) => handleDeletePhoto(currentMobileSlot!.id, e)} className="absolute top-3 right-3 w-10 h-10 bg-tag-posledni-kusy/90 text-secondary font-bold rounded-full style-body flex items-center justify-center z-30 shadow-lg">✕</button>
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-success flex items-center justify-center z-20 shadow-md rounded-tl-[12px]" onTouchStart={(e) => handleTouchStart('resize', currentMobileSlot!.id, e)} onClick={(e) => e.stopPropagation()}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDFBF7" strokeWidth="3"><polyline points="9 3 3 3 3 9" /><polyline points="15 21 21 21 21 15" /><line x1="3" y1="3" x2="21" y2="21" /></svg>
                        </div>
                      </div>
                    )}

                    {/* Text slot: text overlay + photo upload trigger */}
                    {isMobileTextStep && (
                      <>
                        {mainText && (
                          <div className="absolute cursor-move select-none p-3 whitespace-pre active:opacity-80 w-max max-w-full touch-none"
                            style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)', color: textColor, fontSize: `${fontSize / safeRatio}px`, fontFamily, fontWeight: '600', textAlign, lineHeight: 1.2, textShadow: useShadow ? `3px 3px ${shadowBlur / safeRatio}px ${shadowColor}` : 'none', zIndex: 40 }}
                            onTouchStart={(e) => handleTouchStart('text', currentMobileSlot!.id, e)}
                            onClick={() => setShowTextPanel(true)}
                          >
                            <span className="border-2 border-transparent">{mainText}</span>
                          </div>
                        )}
                        {!photos[currentMobileSlot!.id] && (
                          <div
                            className="absolute top-0 left-0 right-0 flex items-center justify-center cursor-pointer z-[2]"
                            style={{ height: '58%' }}
                            onClick={(e) => openPhotoPickerForSlot(currentMobileSlot!.id, e)}
                          >
                            <Image src="/images/add-image-ico.svg" alt="Přidat" width={96} height={96} className="opacity-80" />
                          </div>
                        )}
                        {!mainText && (
                          <div
                            className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-[5] cursor-pointer"
                            style={{ height: '42%' }}
                            onClick={() => setShowTextPanel(true)}
                          >
                            <h2 className="style-h2 text-success">Napište vlastní text</h2>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isMobileTextStep && !isPreviewStep && (
                <div className="flex flex-col items-center gap-[8px] mt-[32px]">
                  <button
                    onClick={() => setShowTextPanel(true)}
                    className="inline-flex items-center gap-[8px] style-body-bold text-primary"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Upravit text
                  </button>
                  <p className="style-body text-secondary/60 text-center">Text v okně můžete posouvat</p>
                </div>
              )}
            </div>
          </>
        )}

        {!showThankYou && (
          <div className="fixed bottom-0 left-0 w-full z-[100] bg-black500">
            <footer className="w-full border-t border-black300/30 h-[64px] flex items-center justify-center pb-safe">
              <div className="w-full px-[24px] flex justify-between items-center gap-3">
                <Button
                  onClick={() => { if (mobileStep > 0) setMobileStep((prev) => prev - 1); else window.location.href = '/vytvorit-arch'; }}
                  disabled={isUploading} variant="outlined" arrow="left" className="h-[48px] shrink-0"
                >Zpět</Button>
                <Button
                  onClick={() => { if (isPreviewStep) handleUploadAndComplete(); else if (isLastSlotStep) handleMobilePreview(); else setMobileStep((prev) => prev + 1); }}
                  disabled={isUploading || (!isPreviewStep && !photos[currentMobileSlot?.id || ''])}
                  arrow="right" className="flex-1 h-[48px]"
                >
                  {isUploading ? 'Ukládám...' : isPreviewStep ? 'Dokončit' : isLastSlotStep ? 'Vytvořit náhled' : 'Další fotografie'}
                </Button>
              </div>
            </footer>
          </div>
        )}

        {/* Slide-up text panel */}
        {isMobileTextStep && !isPreviewStep && !showThankYou && (
          <div className={`fixed inset-x-0 bottom-0 z-[200] bg-black500 transition-transform duration-500 ease-out max-h-[70vh] overflow-y-auto ${showTextPanel ? 'translate-y-0 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]' : 'translate-y-full'}`}>
            <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-black300/20">
              <span className="style-body-bold text-secondary">Upravit text</span>
              <button onClick={() => setShowTextPanel(false)} className="w-8 h-8 flex items-center justify-center text-black200 hover:text-secondary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              <div className="flex gap-[16px]">
                <textarea
                  value={mainText} onChange={(e) => setMainText(e.target.value)}
                  placeholder="Napište vlastní text"
                  className="flex-1 bg-secondary text-black rounded-[4px] p-4 style-body outline-none focus:ring-2 focus:ring-success resize-none h-[80px] placeholder:text-black300"
                />
                <div className="flex flex-col justify-between py-1">
                  <button onClick={() => setTextAlign('left')}><Image src={textAlign === 'left' ? '/images/align-left-active.svg' : '/images/align-left.svg'} alt="Left" width={24} height={24} /></button>
                  <button onClick={() => setTextAlign('center')}><Image src={textAlign === 'center' ? '/images/align-center-active.svg' : '/images/align-center.svg'} alt="Center" width={24} height={24} /></button>
                  <button onClick={() => setTextAlign('right')}><Image src={textAlign === 'right' ? '/images/align-right-active.svg' : '/images/align-right.svg'} alt="Right" width={24} height={24} /></button>
                </div>
              </div>
              <div className="flex gap-[16px] h-[48px]">
                <div className="flex-1 relative">
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full h-full bg-secondary text-black rounded-[4px] pl-4 pr-10 style-body appearance-none outline-none focus:ring-2 focus:ring-success">
                    {[{ name: 'Moderní (Poppins)', value: 'Poppins' }, { name: 'Elegantní (Playfair Display)', value: 'Playfair Display' }, { name: 'Psací (Dancing Script)', value: 'Dancing Script' }, { name: 'Retro (Pacifico)', value: 'Pacifico' }].map((f) => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#0F172A" strokeWidth="1.5"><path d="M1 1.5L6 6.5L11 1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                </div>
                <ColorPickerInput value={textColor} onChange={setTextColor} />
              </div>
              <div className="flex items-center justify-between">
                <input type="range" min="40" max="300" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                  className="custom-fontSize-slider"
                  style={{ background: `linear-gradient(to right, #059669 ${((fontSize - 40) / 260) * 100}%, #FDFBF7 ${((fontSize - 40) / 260) * 100}%)` }}
                />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="mob-shadow" checked={useShadow} onChange={(e) => setUseShadow(e.target.checked)} className="w-5 h-5 accent-success rounded-[4px]" />
                  <label htmlFor="mob-shadow" className="style-body text-secondary cursor-pointer">Stín</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
