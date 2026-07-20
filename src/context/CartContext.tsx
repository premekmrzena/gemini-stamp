'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import CartToast from '@/components/CartToast';
import { supabase } from '@/lib/supabase';
import { computeDiscountAmount } from '@/lib/pricing';
import { DiscountType } from '@/types/database';

export type CartItem = {
  id: string;
  name: string;
  price: number;
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(JSON.parse(savedCart));
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
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('razitka-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, newItem];
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

  return (
    <CartContext.Provider
      value={{
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, toast, dismissToast,
        appliedDiscount, discountAmount, cartTotalAfterDiscount, discountLoading, discountError,
        applyDiscountCode, removeDiscountCode,
      }}
    >
      {children}
      <CartToast />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart musí být použit uvnitř CartProvider');
  return context;
};
