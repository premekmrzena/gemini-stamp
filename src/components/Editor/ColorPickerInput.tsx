'use client';

import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

type Props = {
  value: string;
  onChange: (color: string) => void;
  size?: number;
};

const DEFAULT_PICKER_HEIGHT = 200;
const MIN_PICKER_HEIGHT = 130;
const GAP = 8;
const SCREEN_MARGIN = 8; // ať paleta nikdy nesahá až na úplný okraj viditelné obrazovky

export default function ColorPickerInput({ value, onChange, size = 48 }: Props) {
  const [open, setOpen] = useState(false);
  const [pickerHeight, setPickerHeight] = useState(DEFAULT_PICKER_HEIGHT);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Dopočet výšky palety podle SKUTEČNĚ viditelné plochy nad tlačítkem (2026-08-09
  // oprava). Dřívější verze počítala dostupné místo vůči nejbližšímu scrollovatelnému
  // rodiči přes getBoundingClientRect() - to jsou layoutové souřadnice, které při psaní
  // textu (mobilní klávesnice otevřená) nemusí odpovídat tomu, co je opravdu vidět nad
  // klávesnicí. Proto počítáme vůči window.visualViewport (sleduje reálně viditelnou
  // oblast) a přepočítáváme i za běhu, ne jen jednou při otevření - jinak se paleta
  // shora oříznula a nešlo vybrat bílou (levý horní roh palety).
  useEffect(() => {
    if (!open || !ref.current) return;

    function recalc() {
      if (!ref.current) return;
      const visualTop = window.visualViewport?.offsetTop ?? 0;
      const triggerTop = ref.current.getBoundingClientRect().top;
      const available = triggerTop - visualTop - GAP - SCREEN_MARGIN;
      setPickerHeight(Math.max(MIN_PICKER_HEIGHT, Math.min(DEFAULT_PICKER_HEIGHT, available)));
    }

    recalc();
    window.visualViewport?.addEventListener('resize', recalc);
    window.visualViewport?.addEventListener('scroll', recalc);
    return () => {
      window.visualViewport?.removeEventListener('resize', recalc);
      window.visualViewport?.removeEventListener('scroll', recalc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <button
        type="button"
        className="w-full h-full rounded-[4px] border border-black300/20"
        style={{ backgroundColor: value }}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="absolute z-[300] bottom-[calc(100%+8px)] right-0">
          <HexColorPicker color={value} onChange={onChange} style={{ height: pickerHeight }} />
        </div>
      )}
    </div>
  );
}
