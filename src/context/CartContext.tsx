'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { computeDiscountAmount } from '@/lib/pricing';
import { getOrderCurrency, Currency } from '@/lib/currency';
import { DiscountType } from '@/types/database';
import { gtagAddToCart } from '@/lib/gtag';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  quantity: number;
  image_url: string;
  weight_grams: number;
  item_type: 'product' | 'custom';
};

export type AppliedDiscount = {
  code: string;
  type: DiscountType;
  value: number;
};

const DISCOUNT_STORAGE_KEY = 'razitka-discount-code';

type ToastState = {
  visible: boolean;
  item: CartItem | null;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCurrency: Currency;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  toast: ToastState;
  dismissToast: () => void;
  appliedDiscount: AppliedDiscount | null;
  discountAmount: number;
  cartTotalAfterDiscount: number;
  discountLoading: boolean;
  discountError: string | null;
  applyDiscountCode: (code: string) => Promise<boolean>;
  removeDiscountCode: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // CartProvider žije v kořenovém app/layout.tsx, MIMO NextIntlClientProvider
  // (ten je až v app/[locale]/layout.tsx) - useLocale() by tu spadl stejně
  // jako dřív CartToast (viz [[project_i18n_phase_4b]] v paměti). usePathname()
  // funguje všude, takže se měna určuje přímo z URL prefixu.
  const pathname = usePathname();
  const currentCurrency = getOrderCurrency(pathname?.startsWith('/cs') ? 'cs' : 'en');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, item: null });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const applyDiscountCode = async (code: string, opts?: { silent?: boolean }): Promise<boolean> => {
    const trimmed = code.trim();
    if (!trimmed) return false;

    setDiscountLoading(true);
    if (!opts?.silent) setDiscountError(null);

    const { data, error } = await supabase.rpc('validate_discount_code', { p_code: trimmed });
    const result = Array.isArray(data) ? data[0] : data;

    setDiscountLoading(false);

    if (error || !result?.is_valid) {
      setAppliedDiscount(null);
      localStorage.removeItem(DISCOUNT_STORAGE_KEY);
      if (!opts?.silent) setDiscountError(result?.message || 'Slevový kód se nepodařilo ověřit');
      return false;
    }

    setAppliedDiscount({ code: trimmed.toUpperCase(), type: result.code_type, value: result.code_value });
    localStorage.setItem(DISCOUNT_STORAGE_KEY, trimmed.toUpperCase());
    setDiscountError(null);
    return true;
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
    setDiscountError(null);
    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('razitka-cart');
    if (savedCart) {
      try {
        // localStorage není dostupné při SSR, takže tohle musí zůstat v efektu (post-mount) -
        // lazy initializer ve useState by běžel i na serveru a způsobil hydration mismatch.
        const parsed: CartItem[] = JSON.parse(savedCart);
        // Košík uložený pod jinou měnou (typicky přepnutí /cs <-> /en mezi
        // návštěvami) by jinak smíchal CZK a EUR ceny v jednom součtu -
        // bezpečnější ho vyprázdnit než zobrazit nesmyslný mezisoučet.
        const hasCurrencyMismatch = parsed.some((item) => item.currency !== currentCurrency);
        if (hasCurrencyMismatch) {
          localStorage.removeItem('razitka-cart');
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCartItems(parsed);
        }
      } catch {
        localStorage.removeItem('razitka-cart');
      }
    }
    setIsLoaded(true);

    const savedCode = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (savedCode) {
      // Tichá revalidace — kód mohl mezitím expirovat nebo být deaktivován,
      // takže se nespoléhá na to, co bylo uloženo v localStorage.
      applyDiscountCode(savedCode, { silent: true });
    }
    // currentCurrency vědomě mimo deps - tohle je jednorázová hydratace při
    // mountu (viz komentář výše), ne synchronizace při každé změně cesty/locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('razitka-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    gtagAddToCart(
      { item_id: newItem.id, item_name: newItem.name, price: newItem.price, quantity: newItem.quantity },
      newItem.currency
    );

    setCartItems((prev) => {
      // Košík smí obsahovat jen jednu měnu najednou (viz cartCurrency níže) -
      // pokud má nová položka jinou měnu než ty stávající (typicky přeskočení
      // mezi /cs náhledem a EN při testování), je bezpečnější košík vyprázdnit
      // a začít znovu, než namíchat CZK a EUR do jednoho součtu.
      const base = prev.length > 0 && prev[0].currency !== newItem.currency ? [] : prev;
      const existing = base.find((item) => item.id === newItem.id);
      if (existing) {
        return base.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...base, newItem];
    });

    setToast({ visible: true, item: newItem });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ visible: false, item: null });
    }, 3000);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('razitka-cart');
    }
    removeDiscountCode();
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: false, item: null });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = computeDiscountAmount(cartTotal, appliedDiscount);
  const cartTotalAfterDiscount = cartTotal - discountAmount;
  // Měna, ve které košík reálně je - podle položek v něm (addToCart výše
  // garantuje, že jsou vždy jen v jedné), ne podle stránky/locale, na které
  // zákazník zrovna je (to by u existujícího košíku ukázalo špatnou měnu ke
  // stejnému číslu, viz CartStep/OrderSummary). Prázdný košík spadá na
  // currentCurrency - tam teprve rozhoduje aktuální stránka, protože se s ní
  // teprve zakládá nová objednávka.
  const cartCurrency: Currency = cartItems[0]?.currency ?? currentCurrency;

  return (
    <CartContext.Provider
      value={{
        cartItems, cartCurrency, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, toast, dismissToast,
        appliedDiscount, discountAmount, cartTotalAfterDiscount, discountLoading, discountError,
        applyDiscountCode, removeDiscountCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart musí být použit uvnitř CartProvider');
  return context;
};
