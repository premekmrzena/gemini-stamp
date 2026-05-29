'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import CartToast from '@/components/CartToast';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  weight_grams: number;
  item_type: 'product' | 'custom';
};

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
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, item: null });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('razitka-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('razitka-cart');
      }
    }
    setIsLoaded(true);
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
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: false, item: null });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, toast, dismissToast }}
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
