'use client';

import { useState } from 'react';
import { X, Upload, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, ProductCategory } from '@/types/database';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'znamky': 'Známky',
  'kreativni-archy': 'Kreativní archy',
  'fdc': 'First Day Cover',
  'plakety': 'Dárkové plakety',
};

type ProductFormData = Omit<Product, 'id' | 'created_at'>;

const EMPTY_FORM: ProductFormData = {
  name: '',
  short_description: '',
  detailed_description: '',
  price: 0,
  weight_grams: 0,
  image_url: '',
  gallery_images: [],
  category: 'znamky',
  stock_quantity: 0,
  is_active: true,
  tag_new: false,
  tag_last_pieces: false,
  tag_top: null,
  catalog_number: '',
  stamp_type: '',
  release_date: '',
  print_sheets: null,
  dimensions_mm: '',
  designer: '',
  engraver: '',
  related_stamp_id: null,
  show_on_homepage: false,
};

async function uploadToBlob(file: File): Promise<string> {
  const res = await fetch(`/api/upload-stamp?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    body: file,
  });
  if (!res.ok) throw new Error('Nahrání obrázku selhalo');
  const blob = await res.json();
  return blob.url as string;
}

type ProductFormModalProps = {
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
};

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormData>(
    product ? { ...EMPTY_FORM, ...product } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    setError(null);
    try {
      const url = await uploadToBlob(file);
      set('image_url', url);
    } catch {
      setError('Nahrání hlavního obrázku selhalo.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleGalleryUpload(file: File) {
    setUploadingGallery(true);
    setError(null);
    try {
      const url = await uploadToBlob(file);
      set('gallery_images', [...(form.gallery_images || []), url]);
    } catch {
      setError('Nahrání obrázku do galerie selhalo.');
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryImage(url: string) {
    set('gallery_images', (form.gallery_images || []).filter((u) => u !== url));
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.image_url) {
      setError('Vyplň alespoň název a hlavní obrázek.');
      return;
    }
    setSaving(true);
    setError(null);

    const payload = { ...form };
    const query = product
      ? supabase.from('products').update(payload).eq('id', product.id).select().single()
      : supabase.from('products').insert(payload).select().single();

    const { data, error: saveError } = await query;
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
    } else {
      onSaved(data as Product);
      onClose();
    }
  }

  const inputClass = 'w-full bg-black border border-black300/50 rounded-[8px] px-4 h-[44px] style-body text-secondary placeholder:text-black300/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all';
  const textareaClass = 'w-full bg-black border border-black300/50 rounded-[8px] px-4 py-3 style-body text-secondary placeholder:text-black300/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[80px]';
  const labelClass = 'style-product-tag text-black300 block mb-2';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-black400 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-black300/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-black400/90 backdrop-blur-md p-6 border-b border-black300/30 flex justify-between items-center z-10">
          <h2 className="style-h3 text-secondary">{product ? 'Upravit produkt' : 'Nový produkt'}</h2>
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

          {/* ZÁKLADNÍ ÚDAJE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Název *</label>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Kategorie</label>
              <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value as ProductCategory)}>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Cena (Kč)</label>
              <input type="number" min={0} className={inputClass} value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Sklad (ks)</label>
              <input type="number" min={0} className={inputClass} value={form.stock_quantity} onChange={(e) => set('stock_quantity', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass}>Hmotnost (g)</label>
              <input type="number" min={0} className={inputClass} value={form.weight_grams} onChange={(e) => set('weight_grams', Number(e.target.value))} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer style-body text-secondary">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
              Aktivní (prodejný)
            </label>
            <label className="flex items-center gap-2 cursor-pointer style-body text-secondary">
              <input type="checkbox" checked={form.tag_new} onChange={(e) => set('tag_new', e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
              Štítek „novinka“
            </label>
          </div>

          {/* POPISY */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Krátký popis</label>
              <textarea className={textareaClass} value={form.short_description ?? ''} onChange={(e) => set('short_description', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Detailní popis</label>
              <textarea className={textareaClass} value={form.detailed_description ?? ''} onChange={(e) => set('detailed_description', e.target.value)} />
            </div>
          </div>

          {/* TECHNICKÉ PARAMETRY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Katalogové číslo</label>
              <input className={inputClass} value={form.catalog_number ?? ''} onChange={(e) => set('catalog_number', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Typ známky</label>
              <input className={inputClass} value={form.stamp_type ?? ''} onChange={(e) => set('stamp_type', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Datum vydání</label>
              <input type="date" className={inputClass} value={form.release_date ?? ''} onChange={(e) => set('release_date', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Rozměry (mm)</label>
              <input className={inputClass} value={form.dimensions_mm ?? ''} onChange={(e) => set('dimensions_mm', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Designér</label>
              <input className={inputClass} value={form.designer ?? ''} onChange={(e) => set('designer', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Rytec</label>
              <input className={inputClass} value={form.engraver ?? ''} onChange={(e) => set('engraver', e.target.value)} />
            </div>
          </div>

          {/* OBRÁZKY */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Hlavní obrázek *</label>
              <div className="flex items-center gap-4">
                {form.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="" className="w-20 h-20 object-cover rounded-[8px] border border-black300/30" />
                )}
                <label className="flex items-center gap-2 bg-black300/10 hover:bg-black300/20 text-secondary px-4 h-[40px] rounded-[8px] style-body-bold transition-all cursor-pointer border border-black300/20">
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {form.image_url ? 'Nahradit' : 'Nahrát obrázek'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingImage}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div>
              <label className={labelClass}>Galerie</label>
              <div className="flex flex-wrap gap-3">
                {(form.gallery_images || []).map((url) => (
                  <div key={url} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-[8px] border border-black300/30" />
                    <button type="button" onClick={() => removeGalleryImage(url)}
                      className="absolute -top-2 -right-2 bg-tag-posledni-kusy text-secondary rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 flex items-center justify-center bg-black300/10 hover:bg-black300/20 rounded-[8px] border border-dashed border-black300/30 cursor-pointer transition-all">
                  {uploadingGallery ? <Loader2 size={18} className="animate-spin text-black300" /> : <ImagePlus size={18} className="text-black300" />}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingGallery}
                    onChange={(e) => e.target.files?.[0] && handleGalleryUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black300/30 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 h-[44px] rounded-[8px] style-body-bold text-black300 hover:text-secondary transition-all cursor-pointer">
              Zrušit
            </button>
            <button type="submit" disabled={saving || uploadingImage || uploadingGallery}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-semibold px-6 h-[44px] rounded-[8px] transition-all style-body cursor-pointer">
              {saving ? 'Ukládám...' : product ? 'Uložit změny' : 'Vytvořit produkt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
