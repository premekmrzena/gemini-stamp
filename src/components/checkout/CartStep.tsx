import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/context/CartContext';

type Props = {
  cartItems: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  onPreviewArch: (url: string) => void;
};

export default function CartStep({ cartItems, removeFromCart, updateQuantity, onPreviewArch }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="style-h3 text-secondary mb-2">Košík</h3>
      {cartItems.map((item) => {
        const isCustom = item.item_type === 'custom';
        return (
          <div key={item.id} className="py-5 border-b border-b-white/10 flex items-stretch gap-5">

            {isCustom ? (
              <button
                onClick={() => onPreviewArch(item.image_url)}
                className="relative w-[80px] h-[80px] shrink-0 bg-white rounded-[4px] p-1 overflow-hidden cursor-zoom-in"
              >
                <Image src={item.image_url} alt={item.name} fill className="object-contain pointer-events-none select-none" sizes="80px" />
                <div className="absolute inset-0 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
              </button>
            ) : (
              <Link
                href={`/produkt/${item.id}`}
                className="relative w-[80px] h-[80px] shrink-0 bg-white rounded-[4px] p-1 overflow-hidden block"
              >
                <Image src={item.image_url} alt={item.name} fill className="object-contain pointer-events-none select-none" sizes="80px" />
                <div className="absolute inset-0 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
              </Link>
            )}

            <div className="flex-grow flex flex-col justify-between py-1">
              <div className="flex justify-between items-start gap-4">
                {isCustom ? (
                  <button
                    onClick={() => onPreviewArch(item.image_url)}
                    className="style-h4 text-secondary text-left line-clamp-2 hover:text-primary transition-colors cursor-zoom-in"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link href={`/produkt/${item.id}`} className="style-h4 text-secondary line-clamp-2 hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                )}
                <button onClick={() => removeFromCart(item.id)} className="text-black300 hover:text-primary transition-colors shrink-0">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center bg-secondary rounded-full px-3 py-1 gap-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-black">−</button>
                  <span className="style-body-bold text-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-black">+</button>
                </div>
                <p className="style-product-price text-success">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
