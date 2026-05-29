import Image from 'next/image';
import { CartItem } from '@/context/CartContext';

type Props = {
  cartItems: CartItem[];
  cartTotal: number;
  shippingCost: number;
  totalOrderPrice: number;
};

export default function OrderSummary({ cartItems, cartTotal, shippingCost, totalOrderPrice }: Props) {
  return (
    <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-32 h-fit lg:order-2">
      <div className="bg-secondary rounded-[4px] p-4 shadow-xl text-black flex flex-col">
        <h3 className="style-h3 text-center mb-4">Shrnutí objednávky</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4 border-t border-black200">
            <div className="relative w-12 h-12 shrink-0 border border-black200 rounded-[4px] overflow-hidden bg-white p-1 select-none pointer-events-none">
              <Image src={item.image_url} alt={item.name} fill className="object-contain" sizes="48px" />
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <h4 className="style-body text-black line-clamp-2">{item.name}</h4>
              <p className="style-body text-black300">{item.quantity} ks</p>
            </div>
            <p className="style-body text-black shrink-0">
              {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
            </p>
          </div>
        ))}
        <div className="flex flex-col gap-2 py-4 border-t border-black200 style-body text-black">
          <div className="flex justify-between items-center">
            <span>Mezisoučet</span>
            <span>{cartTotal.toLocaleString('cs-CZ')} Kč</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Doprava</span>
            <span>{shippingCost} Kč</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-black200">
          <span className="style-body-bold text-black">Celkem</span>
          <span className="style-product-price text-success">{totalOrderPrice.toLocaleString('cs-CZ')} Kč</span>
        </div>
      </div>
    </aside>
  );
}
