'use client';

import { useEffect, useState } from 'react';
import { Truck, X, AlertTriangle, MapPin, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { Order } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import {
  buildCustomsDeclarationItems,
  fetchCustomsCategoryMap,
  requiresCustomsDeclaration,
  CustomsDeclarationItem,
} from '@/lib/customsDeclaration';
import { getShipmentPrefix } from '@/lib/ceskaPostaShipment';

type ShipmentModalProps = {
  order: Order;
  onClose: () => void;
  onShipped: (orderId: string, parcelCode: string) => void;
};

export function ShipmentModal({ order, onClose, onShipped }: ShipmentModalProps) {
  const backdrop = useBackdropClose(onClose);
  const [items, setItems] = useState<CustomsDeclarationItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parcelCode, setParcelCode] = useState<string | null>(order.tracking_number);

  const isInternational = requiresCustomsDeclaration(order.shipping_method);
  const prefix = getShipmentPrefix(order.shipping_method);
  const totalWeightKg = order.cart_items.reduce((sum, i) => sum + (i.weight_grams * i.quantity) / 1000, 0);

  const recipientFirstName = order.shipping_is_different ? order.shipping_first_name : order.billing_first_name;
  const recipientLastName = order.shipping_is_different ? order.shipping_last_name : order.billing_last_name;
  const recipientAddress = order.shipping_is_different ? order.shipping_address_line1 : order.billing_address_line1;
  const recipientCity = order.shipping_is_different ? order.shipping_city : order.billing_city;
  const recipientZip = order.shipping_is_different ? order.shipping_zip : order.billing_zip;
  const recipientCountry = order.shipping_is_different ? order.shipping_country : order.billing_country;

  useEffect(() => {
    if (!isInternational) return;

    let cancelled = false;
    (async () => {
      try {
        const categoryMap = await fetchCustomsCategoryMap(order.cart_items);
        if (cancelled) return;
        setItems(buildCustomsDeclarationItems(order.cart_items, categoryMap));
      } catch {
        if (!cancelled) setLoadError('Nepodařilo se dohledat kategorie položek pro celní prohlášení.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isInternational, order.cart_items]);

  const missingHsCode = items?.some((i) => !i.hsCode) ?? false;
  const canSubmit = !!prefix && !submitting && !parcelCode && (!isInternational || (items && !missingHsCode));

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/admin/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, customsItems: items }),
      });
      const data = await res.json();

      if (!res.ok || !data.parcelCode) {
        setSubmitError(data.error || 'Podání zásilky selhalo.');
        return;
      }

      const { error: dbError } = await supabase
        .from('orders')
        .update({ tracking_number: data.parcelCode })
        .eq('id', order.id);

      if (dbError) {
        setSubmitError(`Zásilka podána (${data.parcelCode}), ale uložení do objednávky selhalo - ulož číslo ručně.`);
        return;
      }

      setParcelCode(data.parcelCode);
      onShipped(order.id, data.parcelCode);
    } catch {
      setSubmitError('Podání zásilky selhalo - zkontroluj připojení a zkus to znovu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60] transition-all" {...backdrop}>
      <div
        className="bg-black400 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-black300/30 shadow-2xl animate-[fadeIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-black400/90 backdrop-blur-md p-6 border-b border-black300/30 flex justify-between items-center z-10">
          <h2 className="style-h3 text-secondary flex items-center gap-2">
            <Truck className="text-primary" size={20} /> Vytvořit zásilku #{order.id.slice(-6).toUpperCase()}
          </h2>
          <button onClick={onClose} className="p-2 text-black300 hover:text-secondary hover:bg-black300/10 rounded-full transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-black p-4 rounded-[12px] border border-black300/20 space-y-1">
            <h3 className="style-product-tag text-black300 flex items-center gap-2">
              <MapPin size={14} className="text-primary" /> Adresát
            </h3>
            <p className="style-body-bold text-secondary">{recipientFirstName} {recipientLastName}</p>
            <p className="style-body text-black200">{recipientAddress}</p>
            <p className="style-body text-black200">{recipientZip} {recipientCity}, {recipientCountry}</p>
          </div>

          <div className="bg-black p-4 rounded-[12px] border border-black300/20 flex justify-between items-center">
            <span className="style-product-tag text-black300">Doprava</span>
            <span className="style-body-bold text-secondary">{order.shipping_method} · {totalWeightKg.toFixed(3)} kg</span>
          </div>

          {isInternational && (
            <div className="space-y-3">
              <h3 className="style-product-tag text-black300 flex items-center gap-2">
                <Package size={14} className="text-primary" /> Celní prohlášení (CN22/CN23)
              </h3>
              {loadError && <p className="style-body text-tag-posledni-kusy">{loadError}</p>}
              {!items && !loadError && <p className="style-body text-black300 italic">Načítám položky...</p>}
              {items && (
                <div className="bg-black rounded-[12px] border border-black300/20 overflow-hidden">
                  {items.map((item) => (
                    <div key={item.sequence} className="p-4 border-b border-black300/20 last:border-0 flex justify-between items-center gap-4">
                      <div>
                        <p className="style-body-bold text-secondary">{item.customCont}</p>
                        <p className="style-product-tag text-black300 lowercase">
                          {item.quantity} ks · {item.weight} kg · {item.customVal.toLocaleString('cs-CZ')} Kč
                        </p>
                      </div>
                      <span className={`style-body-bold shrink-0 ${item.hsCode ? 'text-primary' : 'text-tag-posledni-kusy'}`}>
                        HS {item.hsCode || 'neznámý'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {missingHsCode && (
                <p className="style-body text-tag-posledni-kusy flex items-center gap-2">
                  <AlertTriangle size={14} /> U některých položek se nepodařilo dohledat kategorii/HS kód - zkontroluj produkt v adminu.
                </p>
              )}
            </div>
          )}

          {!prefix && (
            <div className="bg-tag-posledni-kusy/10 border border-tag-posledni-kusy/20 p-4 rounded-[12px] flex gap-3 items-start">
              <AlertTriangle size={18} className="text-tag-posledni-kusy shrink-0 mt-0.5" />
              <p className="style-body text-black200">
                Způsob dopravy „{order.shipping_method}“ nemá napojené automatické podání (typicky osobní odběr) - zásilku vyřeš ručně.
              </p>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-[12px] flex gap-3 items-start">
            <AlertTriangle size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="style-body text-black200">
              Podává se zatím jen proti <span className="text-secondary">demo</span> prostředí České pošty - žádná reálná zásilka
              nevznikne, dokud se vědomě nepřepne na ostrý provoz. Pro USA/Portoriko navíc chybí krok přes Zonos Declaration ID.
            </p>
          </div>

          {submitError && (
            <p className="style-body text-tag-posledni-kusy flex items-center gap-2">
              <AlertTriangle size={14} /> {submitError}
            </p>
          )}

          {parcelCode ? (
            <div className="w-full bg-success/10 text-success border border-success/20 py-3 rounded-[8px] style-body-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Podáno, číslo zásilky: {parcelCode}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-black disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary border border-primary/20 py-3 rounded-[8px] style-body-bold transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Podávám...
                </>
              ) : (
                'Podat u České pošty (demo)'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
