'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import StripePaymentForm from '@/components/StripePaymentForm';
import { PAYMENT_OPTIONS } from '@/lib/constants';
import { getShippingOptionsInCurrency, getMinInternationalPriceInCurrency, getPaymentOptionsInCurrency } from '@/lib/shippingCurrency';
import { supabase } from '@/lib/supabase';
import { useCheckout } from '@/hooks/useCheckout';
import { gtagBeginCheckout } from '@/lib/gtag';
import CartStep from '@/components/checkout/CartStep';
import ShippingStep from '@/components/checkout/ShippingStep';
import AddressForm from '@/components/checkout/AddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import Stepper from '@/components/checkout/Stepper';

const ADDRESS_FORM_ID = 'checkout-address-form';

const EMPTY_FORM = {
  billing_first_name: '', billing_last_name: '', billing_email: '', billing_phone: '',
  billing_company_name: '', billing_company_id: '', billing_company_tax_id: '',
  billing_address_line1: '', billing_address_line2: '', billing_city: '', billing_region: '', billing_zip: '',
  billing_country: 'Česká republika',
  shipping_first_name: '', shipping_last_name: '', shipping_phone: '', shipping_company_name: '',
  shipping_address_line1: '', shipping_address_line2: '', shipping_city: '', shipping_region: '', shipping_zip: '', shipping_country: '',
};

const CheckoutPage = () => {
  const t = useTranslations('checkout');
  const router = useRouter();
  const locale = useLocale();
  const { cartItems, cartCurrency, cartTotal, cartTotalAfterDiscount, discountAmount, appliedDiscount, removeFromCart, updateQuantity } = useCart();
  // Měna se řídí tím, co skutečně je v košíku (cartCurrency z CartContextu), ne
  // aktuální stránkou/locale - jinak by např. přechod na /cs přeznačil existující
  // EUR košík na Kč se stejným číslem (viz CartStep/OrderSummary).
  const currency = cartCurrency;
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState('osobni');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_OPTIONS[0].id);
  const [customerNote, setCustomerNote] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [shippingIsDifferent, setShippingIsDifferent] = useState(false);
  const [previewArchImage, setPreviewArchImage] = useState<string | null>(null);
  // Kurz CZK->EUR pro odhad ceny dopravy před odesláním objednávky (jen pro
  // zobrazení - autoritativní přepočet dělá create-order server-side znovu).
  const [czkRate, setCzkRate] = useState<number | null>(null);

  const { submitOrder, isSubmitting, orderError, createdOrderId, serverTotal, serverCurrency, isPaymentModalOpen, setIsPaymentModalOpen } = useCheckout();

  // begin_checkout se posílá jen jednou za návštěvu košíku - při přechodu ze
  // sumarizace košíku (krok 1) na výběr dopravy (krok 2), ne při každém
  // dalším renderu se stejným krokem (např. výběr dopravy v kroku 2). Hodnota
  // musí být cartTotalAfterDiscount, ne cartTotal - slevový kód se zadává už
  // v OrderSummary na kroku 1, takže v okamžiku přechodu na krok 2 už může být
  // uplatněný.
  const beginCheckoutFiredRef = useRef(false);
  useEffect(() => {
    if (currentStep !== 2 || beginCheckoutFiredRef.current) return;
    beginCheckoutFiredRef.current = true;
    gtagBeginCheckout(
      cartItems.map((item) => ({ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity })),
      cartTotalAfterDiscount,
      currency,
      appliedDiscount?.code
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    if (currency !== 'EUR') return;
    supabase
      .from('exchange_rates')
      .select('rate_to_eur')
      .eq('currency_code', 'CZK')
      .single()
      .then(({ data }) => setCzkRate(data?.rate_to_eur ?? null));
  }, [currency]);

  const totalWeightGrams = cartItems.reduce((sum, item) => sum + (item.weight_grams || 0) * item.quantity, 0);
  // useMemo na primitivních vstupech - bez ní by byla shippingOptions pořád nová
  // reference a efekt níže (zrušení nedostupné dopravy po změně země) by se spouštěl
  // na každý render místo jen při skutečné změně dostupných možností.
  const shippingOptions = useMemo(() => {
    const result = getShippingOptionsInCurrency(totalWeightGrams, cartTotal, formData.billing_country, currency, czkRate);
    return result.ok ? result.options : [];
  }, [totalWeightGrams, cartTotal, formData.billing_country, currency, czkRate]);
  const minInternationalResult = getMinInternationalPriceInCurrency(totalWeightGrams, cartTotal, currency, czkRate);
  const minInternationalPrice = minInternationalResult.ok ? minInternationalResult.price : 0;
  const paymentOptions = getPaymentOptionsInCurrency(currency);
  const shippingCost = shippingOptions.find((o) => o.id === selectedShipping)?.price ?? 0;
  const paymentCost = paymentOptions.find((o) => o.id === selectedPayment)?.price ?? 0;
  const totalOrderPrice = cartTotalAfterDiscount + shippingCost + paymentCost;
  const isMezinarodni = selectedShipping === 'cenne-psani' || selectedShipping === 'ems';
  // "mezinarodni" je jen rozcestník (viz ShippingStep) - dokud zákazník nedovybere konkrétní
  // mezinárodní službu, není to platná kupovatelná možnost a nesmí jít dál na krok 3.
  const isValidShippingSelected = shippingOptions.some((o) => o.id === selectedShipping);

  // Hydration guard (počká na klientský mount) - nejde nahradit lazy initializerem,
  // ten by běžel i při SSR a dal by jiný výsledek než na klientovi.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentStep]);

  // Cenné psaní/EMS se nabízí jen pro některé země (viz COUNTRY_SHIPPING_INFO) - pokud zákazník
  // po výběru přepne zemi na takovou, kde už zvolená služba není dostupná, vybraná možnost by
  // "zmizela" ze shippingOptions a cena by tiše spadla na 0 Kč - proto se v tom případě zruší.
  useEffect(() => {
    if (selectedShipping && selectedShipping !== 'mezinarodni' && !shippingOptions.some((o) => o.id === selectedShipping)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reaguje na cizí zdroj (přepočet dostupných možností podle zvolené země), ne na vlastní stav
      setSelectedShipping('');
    }
  }, [shippingOptions, selectedShipping]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (id: string) => {
    setSelectedShipping(id);
    // billing_country zdvojuje roli "cílové země zásilky", dokud zákazník nezvolí doručení na
    // jinou adresu - při přepnutí zpátky na tuzemskou dopravu ji resetujeme, ať se v adresním
    // kroku needitovaně neuloží dřívější zahraniční volba pod zobrazenou "Česká republika".
    if (id === 'osobni') {
      // Osobní odběr nemá adresní krok "Doručit na jinou adresu" (AddressForm ho pro tuto
      // variantu skrývá) - reset ať se needitovaně neodešle dřívější volba spolu s objednávkou.
      setShippingIsDifferent(false);
      setFormData((prev) => (prev.billing_country === 'Česká republika' ? prev : { ...prev, billing_country: 'Česká republika' }));
    } else if (id === 'ceska') {
      setFormData((prev) => (prev.billing_country === 'Česká republika' ? prev : { ...prev, billing_country: 'Česká republika' }));
    } else if (id === 'mezinarodni') {
      // Opačný směr: dokud zákazník nezvolí zemi sám, select nesmí zůstat na "Česká republika"
      // (to není platná položka v INTERNATIONAL_COUNTRIES a select by tiše ukázal první zemi
      // v seznamu, jako by byla vybraná).
      setFormData((prev) => (prev.billing_country === 'Česká republika' ? { ...prev, billing_country: '' } : prev));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Formulář se submituje přes formEl.requestSubmit() z tlačítka ve footeru (mimo strom
    // <form>, viz komentář u tlačítka níže) - proklikne to nativní HTML5 validaci povinných
    // polí stejně jako submit tlačítko uvnitř formuláře. preventDefault tu zastaví skutečnou
    // GET navigaci prohlížeče.
    e.preventDefault();
    submitOrder({
      cartItems, selectedShipping, selectedPayment, formData, customerNote, shippingIsDifferent,
      discountCode: appliedDiscount?.code ?? null,
      // Server (create-order) si z tohohle odvozuje měnu (getOrderCurrency) - musí
      // odpovídat cartCurrency, ne aktuální stránce, jinak by se objednávka spočítala
      // v jiné měně, než v jaké byl košík skutečně zobrazený zákazníkovi.
      locale: currency === 'CZK' ? 'cs' : locale,
    });
  };

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-black">
        <div className="sticky top-0 z-40 w-full"><CheckoutHeader /></div>
        <div className="flex-grow flex flex-col items-center justify-center py-[100px] px-4 gap-6 text-center">
          <h1 className="style-h2 text-secondary">{t('cart.empty')}</h1>
          <Link href="/" className="mt-4"><Button>{t('cart.backToShop')}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-black relative">
      <div className="sticky top-0 z-40 w-full"><CheckoutHeader right={<Stepper currentStep={currentStep} />} /></div>

      <main className="flex-grow w-full pt-[32px] md:pt-[64px] pb-[140px]">
        <div className="layout-container">
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 flex flex-col gap-8 lg:order-1">
            {currentStep === 1 && (
              <CartStep
                cartItems={cartItems}
                currency={currency}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                onPreviewArch={setPreviewArchImage}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep
                shippingOptions={shippingOptions}
                currency={currency}
                selectedShipping={selectedShipping}
                setSelectedShipping={handleShippingChange}
                paymentOptions={paymentOptions}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                internationalCountry={formData.billing_country}
                setInternationalCountry={(country) => setFormData((prev) => ({ ...prev, billing_country: country }))}
                minInternationalPrice={minInternationalPrice}
              />
            )}
            {currentStep === 3 && (
              <AddressForm
                formId={ADDRESS_FORM_ID}
                onSubmit={handleSubmit}
                formData={formData}
                onChange={handleInputChange}
                customerNote={customerNote}
                onNoteChange={setCustomerNote}
                isMezinarodni={isMezinarodni}
                isPersonalPickup={selectedShipping === 'osobni'}
                shippingIsDifferent={shippingIsDifferent}
                onShippingIsDifferentChange={setShippingIsDifferent}
              />
            )}
          </div>
          <OrderSummary
            cartItems={cartItems}
            currency={currency}
            cartTotal={cartTotal}
            shippingCost={shippingCost}
            totalOrderPrice={totalOrderPrice}
            discountAmount={discountAmount}
          />
          </div>
        </div>
      </main>

      {/* z-[60]: musí zůstat nad CookieConsent (z-50, fixed bottom-0, může se
          objevit uprostřed checkoutu po 2s) - jinak by lišta na mobilu (kde je
          vyšší, text a tlačítka pod sebou) mohla překrýt tlačítko Zaplatit. */}
      <footer className="fixed bottom-0 left-0 w-full z-[60] bg-black500 border-t border-black300/30 h-[80px] md:h-[78px] lg:h-[92px] flex items-center justify-center shadow-lg">
        <div className="layout-container flex justify-between items-center">
          <Button
            type="button"
            onClick={() => (currentStep === 1 ? router.push('/') : setCurrentStep((p) => p - 1))}
            variant="outlined"
            arrow="left"
          >
            {t('footer.back')}
          </Button>
          <div className="flex flex-col items-end">
            {orderError && <p className="text-red-500 text-sm mb-2">{orderError}</p>}
            <Button
              // Vždy type="button" s explicitním requestSubmit() na posledním kroku - ne
              // type="submit" + form= atribut. Ten by se přepnul na "submit" ve stejném
              // renderu, který krok posune na 3 (Next Step -> Adresa), a prohlížeč pak
              // vyhodnotí default action kliknutí (submit) až PO tomto re-renderu - tj. hned
              // po příchodu na krok s adresou by se validace spustila sama, bez doteku pole.
              type="button"
              onClick={() => {
                if (currentStep === 3) {
                  (document.getElementById(ADDRESS_FORM_ID) as HTMLFormElement | null)?.requestSubmit();
                } else {
                  setCurrentStep((p) => p + 1);
                }
              }}
              disabled={isSubmitting || (currentStep === 2 && !isValidShippingSelected)}
              arrow="right"
            >
              {isSubmitting ? t('footer.submitting') : currentStep === 3 ? (selectedPayment === 'karta' ? t('footer.pay') : t('footer.finish')) : t('footer.nextStep')}
            </Button>
          </div>
        </div>
      </footer>

      {isPaymentModalOpen && createdOrderId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black400 w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[4px] border border-black300/30 shadow-2xl">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-black300/30 bg-black500 z-10">
              <h3 className="style-h3 text-secondary">{t('paymentModal.title')}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 -m-2 text-black300 hover:text-secondary hover:bg-black300/10 rounded-full transition-colors cursor-pointer text-2xl leading-none">×</button>
            </div>
            <div className="p-6 bg-black400">
              <StripePaymentForm amount={serverTotal ?? totalOrderPrice} currency={serverCurrency ?? currency} orderId={createdOrderId} />
            </div>
          </div>
        </div>
      )}

      {previewArchImage && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setPreviewArchImage(null)}
        >
          <button onClick={() => setPreviewArchImage(null)} className="absolute top-6 right-6 text-white/60 hover:text-white text-4xl font-light transition-colors z-50 p-2">×</button>
          <div className="relative max-w-5xl max-h-[85vh] aspect-[1440/1080] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={previewArchImage}
              alt={t('archPreviewAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain shadow-2xl rounded-lg pointer-events-none select-none border border-white/10"
            />
            <div className="absolute inset-0 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
