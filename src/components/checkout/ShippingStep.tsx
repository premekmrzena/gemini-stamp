import { ShippingOption, PaymentOption } from '@/lib/constants';

type Props = {
  shippingOptions: ShippingOption[];
  selectedShipping: string;
  setSelectedShipping: (id: string) => void;
  paymentOptions: PaymentOption[];
  selectedPayment: string;
  setSelectedPayment: (id: string) => void;
};

export default function ShippingStep({
  shippingOptions, selectedShipping, setSelectedShipping,
  paymentOptions, selectedPayment, setSelectedPayment,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="style-h3 text-secondary mb-4">Doprava</h3>
        {shippingOptions.map((option) => (
          <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-white/10">
            <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedShipping === option.id ? 'border-secondary' : 'border-black200'}`}>
              {selectedShipping === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <div className="flex justify-between items-start gap-4">
                <h4 className={`style-h4 ${selectedShipping === option.id ? 'text-primary' : 'text-secondary'}`}>{option.name}</h4>
                <span className="style-body text-secondary">{option.price} Kč</span>
              </div>
              <p className="style-body text-black200">{option.desc}</p>
            </div>
            <input type="radio" checked={selectedShipping === option.id} onChange={() => setSelectedShipping(option.id)} className="sr-only" />
          </label>
        ))}
      </div>

      <div>
        <h3 className="style-h3 text-secondary mb-4">Platba</h3>
        {paymentOptions.map((option) => (
          <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-white/10">
            <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedPayment === option.id ? 'border-secondary' : 'border-black200'}`}>
              {selectedPayment === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <h4 className={`style-h4 ${selectedPayment === option.id ? 'text-primary' : 'text-secondary'}`}>{option.name}</h4>
              <p className="style-body text-black200">{option.desc}</p>
            </div>
            <input type="radio" checked={selectedPayment === option.id} onChange={() => setSelectedPayment(option.id)} className="sr-only" />
          </label>
        ))}
      </div>
    </div>
  );
}
