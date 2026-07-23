import { useTranslations } from 'next-intl';
import { ShippingOption, PaymentOption, INTERNATIONAL_COUNTRIES } from '@/lib/constants';

type Props = {
  shippingOptions: ShippingOption[];
  selectedShipping: string;
  setSelectedShipping: (id: string) => void;
  paymentOptions: PaymentOption[];
  selectedPayment: string;
  setSelectedPayment: (id: string) => void;
  internationalCountry: string;
  setInternationalCountry: (country: string) => void;
};

export default function ShippingStep({
  shippingOptions, selectedShipping, setSelectedShipping,
  paymentOptions, selectedPayment, setSelectedPayment,
  internationalCountry, setInternationalCountry,
}: Props) {
  const t = useTranslations('checkout.shipping');
  const tCountries = useTranslations('checkout.countries');
  const tAddress = useTranslations('checkout.address');

  const domesticOptions = shippingOptions.filter((o) => o.id === 'osobni' || o.id === 'ceska');
  const internationalOptions = shippingOptions.filter((o) => o.id === 'cenne-psani' || o.id === 'ems');

  const renderOption = (option: ShippingOption) => {
    const desc = option.id === 'ceska' ? t('options.ceska.descRegistered') : t(`options.${option.id}.desc`);
    return (
      <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-white/10">
        <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedShipping === option.id ? 'border-secondary' : 'border-black200'}`}>
          {selectedShipping === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
        <div className="flex-grow flex flex-col gap-1">
          <div className="flex justify-between items-start gap-4">
            <h4 className={`style-h4 ${selectedShipping === option.id ? 'text-primary' : 'text-secondary'}`}>{t(`options.${option.id}.name`)}</h4>
            <span className="style-body text-secondary">{option.price} Kč</span>
          </div>
          <p className="style-body text-black200">{desc}</p>
        </div>
        <input type="radio" checked={selectedShipping === option.id} onChange={() => setSelectedShipping(option.id)} className="sr-only" />
      </label>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="style-h3 text-secondary mb-4">{t('title')}</h3>
        {domesticOptions.map(renderOption)}

        <div className="py-5 border-b border-white/10">
          <p className="style-body-bold text-secondary mb-3">{t('international.title')}</p>
          <div className="relative max-w-xs">
            <select
              value={internationalCountry}
              onChange={(e) => setInternationalCountry(e.target.value)}
              className="w-full bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              {INTERNATIONAL_COUNTRIES.map((c, i) => (
                <option key={i} value={c} disabled={c === '---' || c === ''}>
                  {c === '' ? tAddress('selectCountry') : (tCountries.has(c) ? tCountries(c) : c)}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {internationalCountry && internationalOptions.length === 0 && (
            <p className="style-body text-black200 mt-3">{t('international.noneAvailable')}</p>
          )}
        </div>

        {internationalOptions.map(renderOption)}
      </div>

      <div>
        <h3 className="style-h3 text-secondary mb-4">{t('paymentTitle')}</h3>
        {paymentOptions.map((option) => (
          <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-white/10">
            <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedPayment === option.id ? 'border-secondary' : 'border-black200'}`}>
              {selectedPayment === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <h4 className={`style-h4 ${selectedPayment === option.id ? 'text-primary' : 'text-secondary'}`}>{t(`options.${option.id}.name`)}</h4>
              <p className="style-body text-black200">{t(`options.${option.id}.desc`)}</p>
            </div>
            <input type="radio" checked={selectedPayment === option.id} onChange={() => setSelectedPayment(option.id)} className="sr-only" />
          </label>
        ))}
      </div>
    </div>
  );
}
