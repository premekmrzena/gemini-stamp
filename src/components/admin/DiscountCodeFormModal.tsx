'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DiscountCode, DiscountType } from '@/types/database';
import { useBackdropClose } from '@/hooks/useBackdropClose';

type DiscountCodeFormData = Omit<DiscountCode, 'id' | 'created_at' | 'used_count'>;

const EMPTY_FORM: DiscountCodeFormData = {
  code: '',
  type: 'percentage',
  value: 0,
  max_uses: null,
  valid_from: null,
  valid_until: '',
  is_active: true,
};

type DiscountCodeFormModalProps = {
  discountCode: DiscountCode | null;
  onClose: () => void;
  onSaved: (discountCode: DiscountCode) => void;
};

export function DiscountCodeFormModal({ discountCode, onClose, onSaved }: DiscountCodeFormModalProps) {
  const [form, setForm] = useState<DiscountCodeFormData>(
    discountCode ? { ...EMPTY_FORM, ...discountCode } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropHandlers = useBackdropClose(onClose);

  function set<K extends keyof DiscountCodeFormData>(key: K, value: DiscountCodeFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.valid_until) {
      setError('Vyplň alespoň kód a platnost do.');
      return;
    }
    setSaving(true);
    setError(null);

    const payload = { ...form, code: form.code.trim().toUpperCase() };
    const query = discountCode
      ? supabase.from('discount_codes').update(payload).eq('id', discountCode.id).select().single()
      : supabase.from('discount_codes').insert(payload).select().single();

    const { data, error: saveError } = await query;
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
    } else {
      onSaved(data as DiscountCode);
      onClose();
    }
  }

  const inputClass = 'w-full bg-black border border-black300/50 rounded-[8px] px-4 h-[44px] style-body text-secondary placeholder:text-black300/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all';
  const labelClass = 'style-product-tag text-black300 block mb-2';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" {...backdropHandlers}>
      <div
        className="bg-black400 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] border border-black300/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-black400/90 backdrop-blur-md p-6 border-b border-black300/30 flex justify-between items-center z-10">
          <h2 className="style-h3 text-secondary">{discountCode ? 'Upravit slevový kód' : 'Nový slevový kód'}</h2>
          <button onClick={onClose} className="p-2 text-black300 hover:text-secondary hover:bg-black300/10 rounded-full transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <p className="text-tag-posledni-kusy style-body-bold bg-tag-posledni-kusy/10 p-3 rounded-[8px] border border-tag-posledni-kusy/20">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Kód *</label>
              <input
                className={`${inputClass} font-mono uppercase`}
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="např. LETO20"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Typ slevy</label>
              <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value as DiscountType)}>
                <option value="percentage">Procenta</option>
                <option value="fixed">Pevná částka (Kč)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Hodnota {form.type === 'percentage' ? '(%)' : '(Kč)'}</label>
              <input type="number" min={0} className={inputClass} value={form.value} onChange={(e) => set('value', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Max. počet použití</label>
              <input
                type="number"
                min={1}
                placeholder="bez omezení"
                className={inputClass}
                value={form.max_uses ?? ''}
                onChange={(e) => set('max_uses', e.target.value === '' ? null : Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Platné od</label>
              <input
                type="date"
                className={inputClass}
                value={form.valid_from ?? ''}
                onChange={(e) => set('valid_from', e.target.value === '' ? null : e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Platné do *</label>
              <input
                type="date"
                className={inputClass}
                value={form.valid_until ? form.valid_until.slice(0, 10) : ''}
                onChange={(e) => set('valid_until', e.target.value)}
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer style-body text-secondary">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
            Aktivní
          </label>

          <div className="pt-4 border-t border-black300/30 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 h-[44px] rounded-[8px] style-body-bold text-black300 hover:text-secondary transition-all cursor-pointer">
              Zrušit
            </button>
            <button type="submit" disabled={saving}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-semibold px-6 h-[44px] rounded-[8px] transition-all style-body cursor-pointer">
              {saving ? 'Ukládám...' : discountCode ? 'Uložit změny' : 'Vytvořit kód'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
