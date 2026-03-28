'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import Image from 'next/image';

// Jak vypadá jedna položka v košíku
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- STAV PRO TOAST NOTIFIKACI ---
  const [toast, setToast] = useState<{ visible: boolean; item: CartItem | null }>({ visible: false, item: null });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Načtení košíku z paměti prohlížeče při startu
  useEffect(() => {
    const savedCart = localStorage.getItem('razitka-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Uložení do paměti při každé změně košíku
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('razitka-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    // 1. Přidání do košíku
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, newItem];
    });

    // 2. Logika zobrazení Toast notifikace
    setToast({ visible: true, item: newItem });
    
    // Zrušíme předchozí odpočet, pokud uživatel naklikal víc věcí rychle za sebou
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    
    // Schováme po 3 vteřinách
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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}

      {/* --- PŘESNÝ DESIGN TOAST NOTIFIKACE (Dle Náhledu a Inspectu) --- */}
      {toast.visible && toast.item && (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] animate-slideUp">
          {/* Obal: Pozadí Secondary, Radius 4px, Padding 16px, Vertikální layout, Gap 10px */}
          <div className="bg-secondary shadow-xl rounded-[4px] p-4 flex flex-col gap-[10px] min-w-[320px] max-w-[450px]">
            
            {/* PRVNÍ ŘÁDEK: Ikona check-circle + Titulek H4 */}
            <div className="flex items-center gap-[10px]">
              {/* Ikona check-circle v barvě Success */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {/* Titulek H4 v barvě Success pro vizuální potvrzení */}
              <h4 className="style-h4 text-success m-0">Přidáno do košíku</h4>
            </div>

            {/* DĚLÍCÍ LINKA */}
            <hr className="border-black200 w-full m-0" />

            {/* DRUHÝ ŘÁDEK: Obrázek + Název známky (Body) */}
            <div className="flex items-center gap-[10px]">
              {/* Obrázek: Rám Black200, Radius 4px */}
              <div className="relative w-12 h-12 border border-black200 rounded-[4px] overflow-hidden bg-white p-1 shrink-0">
                <Image src={toast.item.image_url} alt={toast.item.name} fill className="object-contain" />
              </div>
              {/* Název známky Body v barvě Black-custom */}
              <p className="style-body text-black-custom m-0 line-clamp-2">{toast.item.name}</p>
            </div>

          </div>
        </div>
      )}

      {/* JEDNODUCHÁ ANIMACE VYJETÍ ZESPODU */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </CartContext.Provider>
  );
}

// Vlastní hook pro snadné použití kdekoliv v aplikaci
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart musí být použit uvnitř CartProvider');
  return context;
};