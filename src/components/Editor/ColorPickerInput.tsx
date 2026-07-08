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

function isScrollable(el: Element) {
  const overflowY = getComputedStyle(el).overflowY;
  return overflowY === 'auto' || overflowY === 'scroll';
}

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

  useEffect(() => {
    if (!open || !ref.current) return;
    let scrollParent: Element | null = ref.current.parentElement;
    while (scrollParent && !isScrollable(scrollParent)) {
      scrollParent = scrollParent.parentElement;
    }
    const topBound = scrollParent ? scrollParent.getBoundingClientRect().top : 0;
    const triggerTop = ref.current.getBoundingClientRect().top;
    const available = triggerTop - topBound - GAP;
    setPickerHeight(Math.max(MIN_PICKER_HEIGHT, Math.min(DEFAULT_PICKER_HEIGHT, available)));
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
