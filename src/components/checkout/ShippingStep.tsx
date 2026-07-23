import { useTranslations } from 'next-intl';
import { ShippingOption, PaymentOption, INTERNATIONAL_COUNTRIES } from '@/lib/constants';
import { ApplePayBadge, GooglePayBadge } from '@/components/PayBadges';

type Props = {
  shippingOptions: ShippingOption[];
  selectedShipping: string;
  setSelectedShipping: (id: string) => void;
  paymentOptions: PaymentOption[];
  selectedPayment: string;
  setSelectedPayment: (id: string) => void;
  internationalCountry: string;
  setInternationalCountry: (country: string) => void;
  minInternationalPrice: number;
};

export default function ShippingStep({
  shippingOptions, selectedShipping, setSelectedShipping,
  paymentOptions, selectedPayment, setSelectedPayment,
  internationalCountry, setInternationalCountry, minInternationalPrice,
}: Props) {
  const t = useTranslations('checkout.shipping');
  const tCountries = useTranslations('checkout.countries');
  const tAddress = useTranslations('checkout.address');

  const domesticOptions = shippingOptions.filter((o) => o.id === 'osobni' || o.id === 'ceska');
  const internationalOptions = shippingOptions.filter((o) => o.id === 'cenne-psani' || o.id === 'ems');
  // "Mezinárodní doprava" je vlastní radio (ne konkrétní kupovatelná možnost) - dokud
  // zákazník nedovybere zemi a konkrétní službu (Cenné psaní/EMS), zůstává jen rozcestníkem.
  const isInternationalActive = selectedShipping === 'mezinarodni' || internationalOptions.some((o) => o.id === selectedShipping);

  // withBorder: false u vnořených mezinárodních produktů, když je poslední v seznamu (žádná
  // linka za posledním produktem - uzavírá to border na obalovém pl-9 kontejneru) - linka mezi
  // produkty se objeví jen mezi nimi (Cenné psaní/EMS), když jsou dostupné oba zároveň.
  const renderOption = (option: ShippingOption, withBorder: boolean = true) => {
    const desc = option.id === 'ceska' ? t('options.ceska.descRegistered') : t(`options.${option.id}.desc`);
    return (
      <label key={option.id} className={`py-5 flex items-start gap-4 cursor-pointer ${withBorder ? 'border-b border-white/10' : ''}`}>
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
        {domesticOptions.map((option) => renderOption(option))}

        <label className={`py-5 flex items-start gap-4 cursor-pointer ${!isInternationalActive ? 'border-b border-white/10' : ''}`}>
          <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${isInternationalActive ? 'border-secondary' : 'border-black200'}`}>
            {isInternationalActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <div className="flex-grow flex flex-col gap-1">
            <div className="flex justify-between items-start gap-4">
              <h4 className={`style-h4 ${isInternationalActive ? 'text-primary' : 'text-secondary'}`}>{t('international.title')}</h4>
              <span className="style-body text-secondary">{t('international.priceFrom', { price: minInternationalPrice })}</span>
            </div>
            <p className="style-body text-black200">{t('international.desc')}</p>
          </div>
          <input type="radio" checked={isInternationalActive} onChange={() => setSelectedShipping('mezinarodni')} className="sr-only" />
        </label>

        {/* Odraženo pod titulek "Mezinárodní doprava" (pl-9 = stejný odsazení jako text vedle
            radia nahoře, w-5 + gap-4). Bez linky mezi textem/selectem/prvním produktem - linka
            se objeví jen mezi Cenné psaní a EMS, když jsou dostupné oba, a na konci celého bloku. */}
        {isInternationalActive && (
          <div className="pl-9 border-b border-white/10">
            <div className="pb-5">
              <div className="relative max-w-xs">
                <select
                  value={internationalCountry}
                  onChange={(e) => setInternationalCountry(e.target.value)}
                  className="w-full bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  {INTERNATIONAL_COUNTRIES.map((c, i) => (
                    <option key={i} value={c} disabled={c === ''}>
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
            {internationalOptions.map((option, i) => renderOption(option, i < internationalOptions.length - 1))}
          </div>
        )}
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
              {option.id === 'karta' && (
                <div className="flex items-center gap-2 mt-1">
                  <ApplePayBadge />
                  <GooglePayBadge />
                </div>
              )}
            </div>
            <input type="radio" checked={selectedPayment === option.id} onChange={() => setSelectedPayment(option.id)} className="sr-only" />
          </label>
        ))}
      </div>
    </div>
  );
}
