'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

// Jaká data tlačítko potřebuje
type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    weight_grams: number; // <--- TOTO JSME PŘIDALI
  };
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  // Přidáme stav pro zobrazení úspěšného přidání
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    // --- TOTO JE TO KOUZLO PROTI PROBUBLÁVÁNÍ ---
    e.preventDefault();   // Zastaví případné přesměrování odkazu
    e.stopPropagation();  // Zabrání kliknutí probublat na celou kartu
    // ---------------------------------------------

    // 1. Přidáme položku do košíku
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || '/images/product-image_0001.jpg',
      weight_grams: product.weight_grams // <--- TOTO JSME PŘIDALI (nezapomeň na čárku na řádku nad tím!)
    });

    // 2. Spustíme mikro-interakci
    setIsAdded(true);
    
    // 3. Po 2 vteřinách vrátíme tlačítko do původního stavu
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdded} // Zabránit dvojkliku během animace
      className={`style-body font-bold flex items-center justify-center gap-2 p-2 relative z-50 transition-all duration-300 w-32 ${
        isAdded 
          ? 'text-[#059669] cursor-default' // Zelená při úspěchu
          : 'text-[#FF6B35] hover:text-[#FF7F51] group/btn cursor-pointer'
      }`}
    >
      {isAdded ? (
        // Ikonka fajfky (Úspěch)
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        // Původní Ikonka košíku
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )}
      {isAdded ? 'Přidáno' : 'Do košíku'}
    </button>
  );
}