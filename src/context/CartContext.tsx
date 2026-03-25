'use client';

// Přidali jsme useRef pro časovač
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import Image from 'next/image'; // Přidáno pro obrázek v notifikaci

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
  clearCart: () => void; // <-- TOTO PŘIDEJ
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
    // 1. Přidání do košíku (původní logika)
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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('razitka-cart'); // Nekompromisně smaže i zálohu v prohlížeči
    }
  };

return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}

      {/* --- TOAST NOTIFIKACE (UI) --- */}
      {toast.visible && toast.item && (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] animate-slideUp">
          <div className="bg-[#2B3755] border border-[#059669]/50 shadow-2xl rounded-[12px] p-4 flex items-center gap-4 min-w-[300px] max-w-[400px]">
            
            {/* OBRÁZEK PRODUKTU */}
            <div className="relative w-12 h-12 rounded-[6px] overflow-hidden bg-[#0F172A] border border-[#8B95AC]/30 shrink-0 p-1">
              <Image src={toast.item.image_url} alt={toast.item.name} fill className="object-contain" />
            </div>
            
            {/* TEXTY */}
            <div className="flex flex-col flex-grow">
              <span className="style-body text-xs text-[#059669] font-bold flex items-center gap-1 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Přidáno do košíku
              </span>
              <span className="style-body text-sm text-[#FDFBF7] line-clamp-1">{toast.item.name}</span>
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