'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function DiscountCodeInput() {
  const { appliedDiscount, discountLoading, discountError, applyDiscountCode, removeDiscountCode } = useCart();
  const [input, setInput] = useState('');

  const handleApply = async () => {
    if (!input.trim()) return;
    const ok = await applyDiscountCode(input);
    if (ok) setInput('');
  };

  if (appliedDiscount) {
    return (
      <div className="py-2 border-t border-black200">
        <div className="flex items-center justify-between gap-2 bg-success/10 border border-success/30 rounded-[4px] px-3 py-2">
          <span className="style-body text-success font-medium">
            Kód {appliedDiscount.code} uplatněn
          </span>
          <button
            type="button"
            onClick={removeDiscountCode}
            className="text-black300 hover:text-black transition-colors"
            aria-label="Odebrat slevový kód"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 border-t border-black200">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
          placeholder="Slevový kód"
          className="flex-1 min-w-0 bg-white border border-black200 rounded-[4px] px-3 h-[40px] style-body text-black placeholder:text-black300 outline-none focus:ring-1 focus:ring-success"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={discountLoading || !input.trim()}
          className="shrink-0 px-4 h-[40px] rounded-[4px] style-body-bold bg-black text-secondary disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {discountLoading ? '...' : 'Použít'}
        </button>
      </div>
      {discountError && <p className="style-body text-red-600 mt-2">{discountError}</p>}
    </div>
  );
}
