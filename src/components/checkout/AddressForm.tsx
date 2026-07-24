import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { INTERNATIONAL_COUNTRIES } from '@/lib/constants';

type FormData = Record<string, string>;

type Props = {
  formId: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  customerNote: string;
  onNoteChange: (note: string) => void;
  isMezinarodni: boolean;
  isPersonalPickup: boolean;
  shippingIsDifferent: boolean;
  onShippingIsDifferentChange: (v: boolean) => void;
};

const InputField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="w-full flex flex-col gap-2">
    <label className="style-body-bold text-secondary">{label}</label>
    <input
      {...props}
      className="bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
    />
  </div>
);

const SelectField = ({
  label,
  options,
  optionLabels,
  selectCountryLabel,
  ...props
}: {
  label: string;
  options: string[];
  optionLabels: Record<string, string>;
  selectCountryLabel: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="w-full flex flex-col gap-2">
    <label className="style-body-bold text-secondary">{label}</label>
    <div className="relative">
      <select
        {...props}
        className="w-full bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt} disabled={opt === '---' || opt === ''}>
            {opt === '' ? selectCountryLabel : (optionLabels[opt] ?? opt)}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
);

export default function AddressForm({
  formId,
  onSubmit,
  formData,
  onChange,
  customerNote,
  onNoteChange,
  isMezinarodni,
  isPersonalPickup,
  shippingIsDifferent,
  onShippingIsDifferentChange,
}: Props) {
  const t = useTranslations('checkout.address');
  const tCountries = useTranslations('checkout.countries');
  const countryLabels = Object.fromEntries(
    INTERNATIONAL_COUNTRIES.filter(Boolean).filter((c) => c !== '---').map((c) => [c, tCountries.has(c) ? tCountries(c) : c])
  );
  // Lokálně řízeno (netřeba v rodičovském stavu) - jen skrývá/zobrazuje pole, která už formData
  // sleduje. Výchozí stav odvozen z předvyplněných dat, ne vždy false, kdyby se zákazník vrátil
  // krok zpátky poté, co firemní údaje vyplnil.
  const [purchaseAsCompany, setPurchaseAsCompany] = useState(
    () => !!(formData.billing_company_name || formData.billing_company_id || formData.billing_company_tax_id)
  );

  // Odškrtnutí checkboxu jen skrývá pole - bez tohohle by vyplněné IČO/DIČ zůstalo v formData
  // a tiše by se odeslalo s objednávkou i po rozmyšlení "nakupuju jako soukromá osoba".
  const handlePurchaseAsCompanyChange = (checked: boolean) => {
    setPurchaseAsCompany(checked);
    if (!checked) {
      ['billing_company_name', 'billing_company_id', 'billing_company_tax_id'].forEach((name) => {
        onChange({ target: { name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
      });
    }
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h3 className="style-h3 text-secondary">{t('title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label={t('firstName')} name="billing_first_name" value={formData.billing_first_name} onChange={onChange} required />
          <InputField label={t('lastName')} name="billing_last_name" value={formData.billing_last_name} onChange={onChange} required />
          <InputField label={t('phone')} name="billing_phone" value={formData.billing_phone} onChange={onChange} required />
          <InputField label={t('email')} name="billing_email" value={formData.billing_email} onChange={onChange} type="email" required />
          <InputField label={t('addressLine1')} name="billing_address_line1" value={formData.billing_address_line1} onChange={onChange} required />
          {isMezinarodni && (
            <InputField label={t('addressLine2')} name="billing_address_line2" value={formData.billing_address_line2} onChange={onChange} />
          )}
          <InputField label={t('city')} name="billing_city" value={formData.billing_city} onChange={onChange} required />
          {isMezinarodni && (
            <InputField label={t('region')} name="billing_region" value={formData.billing_region} onChange={onChange} />
          )}
          <InputField label={t('zip')} name="billing_zip" value={formData.billing_zip} onChange={onChange} required />
          {isMezinarodni ? (
            // Země už byla vybraná v kroku Doprava (podle ní se počítá cena) - tady jen
            // needitovatelně zobrazená, stejně jako u tuzemské varianty níže.
            <InputField label={t('countryPlain')} value={countryLabels[formData.billing_country] ?? formData.billing_country} disabled />
          ) : (
            <InputField label={t('countryPlain')} value={t('czechRepublic')} disabled />
          )}
        </div>

        <div className="border-t border-white/10 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={purchaseAsCompany}
              onChange={(e) => handlePurchaseAsCompanyChange(e.target.checked)}
              className="w-5 h-5 accent-primary rounded"
            />
            <span className="style-body text-secondary">{t('purchaseAsCompany')}</span>
          </label>
          {purchaseAsCompany && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InputField label={t('companyName')} name="billing_company_name" value={formData.billing_company_name} onChange={onChange} />
              <InputField label={t('companyId')} name="billing_company_id" value={formData.billing_company_id} onChange={onChange} />
              <InputField label={t('taxId')} name="billing_company_tax_id" value={formData.billing_company_tax_id} onChange={onChange} />
            </div>
          )}
        </div>
      </div>

      {!isPersonalPickup && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={shippingIsDifferent}
            onChange={(e) => onShippingIsDifferentChange(e.target.checked)}
            className="w-5 h-5 accent-primary rounded"
          />
          <span className="style-body text-secondary">{t('shipToDifferent')}</span>
        </label>
      )}

      {!isPersonalPickup && shippingIsDifferent && (
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
          <h3 className="style-h3 text-secondary">{t('shippingAddressTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t('firstName')} name="shipping_first_name" value={formData.shipping_first_name} onChange={onChange} required />
            <InputField label={t('lastName')} name="shipping_last_name" value={formData.shipping_last_name} onChange={onChange} required />
            <InputField label={t('shippingPhone')} name="shipping_phone" value={formData.shipping_phone} onChange={onChange} />
            <InputField label={t('shippingCompanyName')} name="shipping_company_name" value={formData.shipping_company_name} onChange={onChange} />
            <InputField label={t('addressLine1')} name="shipping_address_line1" value={formData.shipping_address_line1} onChange={onChange} required />
            {isMezinarodni && (
              <InputField label={t('addressLine2')} name="shipping_address_line2" value={formData.shipping_address_line2} onChange={onChange} />
            )}
            <InputField label={t('city')} name="shipping_city" value={formData.shipping_city} onChange={onChange} required />
            {isMezinarodni && (
              <InputField label={t('region')} name="shipping_region" value={formData.shipping_region} onChange={onChange} />
            )}
            <InputField label={t('zip')} name="shipping_zip" value={formData.shipping_zip} onChange={onChange} required />
            {isMezinarodni ? (
              <SelectField
                label={t('country')}
                name="shipping_country"
                value={formData.shipping_country}
                onChange={onChange}
                options={INTERNATIONAL_COUNTRIES}
                optionLabels={countryLabels}
                selectCountryLabel={t('selectCountry')}
                required
              />
            ) : (
              <InputField label={t('countryPlain')} value={t('czechRepublic')} disabled />
            )}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-2">
        <label className="style-body-bold text-secondary">{t('note')}</label>
        <textarea
          value={customerNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={t('notePlaceholder')}
          className="bg-secondary border border-black400 rounded-[4px] p-4 min-h-[100px] style-body text-black placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
        />
      </div>
    </form>
  );
}
