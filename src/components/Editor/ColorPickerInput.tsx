'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker, HexColorInput } from 'react-colorful';

type Props = {
  value: string;
  onChange: (color: string) => void;
  size?: number;
};

// Přesně trefit prstem na dotykovém displeji roh 200×200px gradientu (= čistá bílá/černá)
// je prakticky nemožné - i "vizuálně" přesně v rohu vyjde typicky S/V pár jednotek % mimo,
// tedy barva jako #FCFDFD místo #FFFFFF (nahlášeno uživatelem 2026-08-10, viz
// [[feedback_color_picker_corner_precision_touch]]). Řešení: hex vstup + rychlé předvolby
// bílá/černá vedle gradientu, aby se přesná barva nemusela trefit tažením.
const PRESETS = ['#FFFFFF', '#000000'];

const PICKER_WIDTH = 200; // výchozí šířka .react-colorful (react-colorful/dist/index.js), nikde nepřepisujeme
const FOOTER_HEIGHT = 44; // hex input + předvolby pod gradientem
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
      const availableHeight = rect.top - visualTop - GAP - SCREEN_MARGIN - FOOTER_HEIGHT;
      const height = Math.max(MIN_PICKER_HEIGHT, Math.min(DEFAULT_PICKER_HEIGHT, availableHeight));
      setPickerHeight(height);

      const viewportLeft = window.visualViewport?.offsetLeft ?? 0;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const left = Math.min(
        Math.max(rect.right - PICKER_WIDTH, viewportLeft + SCREEN_MARGIN),
        viewportLeft + viewportWidth - PICKER_WIDTH - SCREEN_MARGIN
      );
      setPopupPos({ top: rect.top - GAP - height - FOOTER_HEIGHT, left });
    }

    // Jen visualViewport (reaguje na vysunutí klávesnice) - ne obecný `window` scroll
    // listener. Ten by se spouštěl i při odrazovém/rubber-band scrollu vyvolaném tažením
    // prstem přímo po gradientu, což by za běhu přepočítalo pozici/velikost palety
    // uprostřed gesta - riziko nekonzistence, žádný skutečný přínos to nemá.
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
      {open && popupPos && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-[300] rounded-[8px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            style={{ top: popupPos.top, left: popupPos.left, width: PICKER_WIDTH }}
          >
            <HexColorPicker color={value} onChange={onChange} style={{ height: pickerHeight, width: PICKER_WIDTH }} />
            <div className="flex items-center gap-1 bg-secondary px-2" style={{ height: FOOTER_HEIGHT }}>
              <span className="text-black300 style-body-bold shrink-0">#</span>
              <HexColorInput
                color={value}
                onChange={onChange}
                prefixed={false}
                className="min-w-0 flex-1 bg-transparent text-black rounded-[4px] px-1.5 py-1 text-sm outline-none border border-black300/20 focus:ring-2 focus:ring-success uppercase"
              />
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={preset}
                  onClick={() => onChange(preset)}
                  className="w-5 h-5 rounded-full border border-black300/30 shrink-0"
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
