import React from 'react';
import { INTERNATIONAL_COUNTRIES } from '@/lib/constants';

type FormData = Record<string, string>;

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  customerNote: string;
  onNoteChange: (note: string) => void;
  isMezinarodni: boolean;
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
  ...props
}: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="w-full flex flex-col gap-2">
    <label className="style-body-bold text-secondary">{label}</label>
    <div className="relative">
      <select
        {...props}
        className="w-full bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt} disabled={opt === '---' || opt === ''}>
            {opt === '' ? 'Vyberte zemi...' : opt}
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
  formData,
  onChange,
  customerNote,
  onNoteChange,
  isMezinarodni,
  shippingIsDifferent,
  onShippingIsDifferentChange,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h3 className="style-h3 text-secondary">Fakturační údaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Jméno *" name="billing_first_name" value={formData.billing_first_name} onChange={onChange} required />
          <InputField label="Příjmení *" name="billing_last_name" value={formData.billing_last_name} onChange={onChange} required />
          <InputField label="Telefon *" name="billing_phone" value={formData.billing_phone} onChange={onChange} required />
          <InputField label="E-mail *" name="billing_email" value={formData.billing_email} onChange={onChange} type="email" required />
          <InputField label="Ulice a č.p. *" name="billing_address_line1" value={formData.billing_address_line1} onChange={onChange} required />
          <InputField label="Město *" name="billing_city" value={formData.billing_city} onChange={onChange} required />
          <InputField label="PSČ *" name="billing_zip" value={formData.billing_zip} onChange={onChange} required />
          {isMezinarodni ? (
            <SelectField label="Země *" name="billing_country" value={formData.billing_country} onChange={onChange} options={INTERNATIONAL_COUNTRIES} required />
          ) : (
            <InputField label="Země" value="Česká republika" disabled />
          )}
        </div>

        <div className="border-t border-white/10 pt-4">
          <h4 className="style-h4 text-black300 mb-3">Firma (nepovinné)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Název firmy" name="billing_company_name" value={formData.billing_company_name} onChange={onChange} />
            <InputField label="IČO" name="billing_company_id" value={formData.billing_company_id} onChange={onChange} />
            <InputField label="DIČ" name="billing_company_tax_id" value={formData.billing_company_tax_id} onChange={onChange} />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={shippingIsDifferent}
          onChange={(e) => onShippingIsDifferentChange(e.target.checked)}
          className="w-5 h-5 accent-primary rounded"
        />
        <span className="style-body text-secondary">Doručit na jinou adresu</span>
      </label>

      {shippingIsDifferent && (
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
          <h3 className="style-h3 text-secondary">Doručovací adresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Jméno *" name="shipping_first_name" value={formData.shipping_first_name} onChange={onChange} required />
            <InputField label="Příjmení *" name="shipping_last_name" value={formData.shipping_last_name} onChange={onChange} required />
            <InputField label="Telefon" name="shipping_phone" value={formData.shipping_phone} onChange={onChange} />
            <InputField label="Firma" name="shipping_company_name" value={formData.shipping_company_name} onChange={onChange} />
            <InputField label="Ulice a č.p. *" name="shipping_address_line1" value={formData.shipping_address_line1} onChange={onChange} required />
            <InputField label="Město *" name="shipping_city" value={formData.shipping_city} onChange={onChange} required />
            <InputField label="PSČ *" name="shipping_zip" value={formData.shipping_zip} onChange={onChange} required />
            {isMezinarodni ? (
              <SelectField label="Země *" name="shipping_country" value={formData.shipping_country} onChange={onChange} options={INTERNATIONAL_COUNTRIES} required />
            ) : (
              <InputField label="Země" value="Česká republika" disabled />
            )}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-2">
        <label className="style-body-bold text-secondary">Poznámka</label>
        <textarea
          value={customerNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Doplňující info..."
          className="bg-secondary border border-black400 rounded-[4px] p-4 min-h-[100px] style-body text-black placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
        />
      </div>
    </div>
  );
}
