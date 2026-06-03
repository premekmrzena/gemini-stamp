'use client';

import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

type Props = {
  value: string;
  onChange: (color: string) => void;
  size?: number;
};

export default function ColorPickerInput({ value, onChange, size = 48 }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
