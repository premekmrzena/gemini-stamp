'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';

type Props = {
  value: string;
  onChange: (color: string) => void;
  size?: number;
};

const PICKER_WIDTH = 200; // výchozí šířka .react-colorful (react-colorful/dist/index.js), nikde nepřepisujeme
const DEFAULT_PICKER_HEIGHT = 200;
const MIN_PICKER_HEIGHT = 130;
const GAP = 8;
const SCREEN_MARGIN = 8; // ať paleta nikdy nesahá až na úplný okraj viditelné obrazovky

export default function ColorPickerInput({ value, onChange, size = 48 }: Props) {
  const [open, setOpen] = useState(false);
  const [pickerHeight, setPickerHeight] = useState(DEFAULT_PICKER_HEIGHT);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Paleta se renderuje portálem rovnou do <body> a je position:fixed, přepočítaná z
  // getBoundingClientRect() tlačítka (oprava 2026-08-10, viz [[feedback_mobile_color_picker_clipped_by_panel_overflow]]).
  // Dřívější verze byla `absolute` uvnitř mobilního slide-up panelu ("Upravit text" v
  // StampEditor.tsx), který má `overflow-y-auto` - to ořízne i absolutně pozicovaného potomka,
  // co přesahuje nad horní hranu panelu, bez ohledu na jeho z-index a bez ohledu na to, že se
  // výška počítala správně vůči visualViewportu. Portál tohle obchází úplně, protože paleta
  // už není potomkem panelu v DOM stromu.
  useEffect(() => {
    if (!open || !ref.current) return;

    function recalc() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const visualTop = window.visualViewport?.offsetTop ?? 0;
      const availableHeight = rect.top - visualTop - GAP - SCREEN_MARGIN;
      const height = Math.max(MIN_PICKER_HEIGHT, Math.min(DEFAULT_PICKER_HEIGHT, availableHeight));
      setPickerHeight(height);

      const viewportLeft = window.visualViewport?.offsetLeft ?? 0;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const left = Math.min(
        Math.max(rect.right - PICKER_WIDTH, viewportLeft + SCREEN_MARGIN),
        viewportLeft + viewportWidth - PICKER_WIDTH - SCREEN_MARGIN
      );
      setPopupPos({ top: rect.top - GAP - height, left });
    }

    recalc();
    window.visualViewport?.addEventListener('resize', recalc);
    window.visualViewport?.addEventListener('scroll', recalc);
    window.addEventListener('scroll', recalc, true);
    return () => {
      window.visualViewport?.removeEventListener('resize', recalc);
      window.visualViewport?.removeEventListener('scroll', recalc);
      window.removeEventListener('scroll', recalc, true);
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
      {open && popupPos && typeof document !== 'undefined' &&
        createPortal(
          <div ref={popupRef} className="fixed z-[300]" style={{ top: popupPos.top, left: popupPos.left }}>
            <HexColorPicker color={value} onChange={onChange} style={{ height: pickerHeight, width: PICKER_WIDTH }} />
          </div>,
          document.body
        )}
    </div>
  );
}
