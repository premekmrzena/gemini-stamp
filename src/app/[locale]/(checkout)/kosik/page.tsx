'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import StripePaymentForm from '@/components/StripePaymentForm';
import { getShippingOptions, getMinInternationalPrice, PAYMENT_OPTIONS } from '@/lib/constants';
import { useCheckout } from '@/hooks/useCheckout';
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
  const { cartItems, cartTotal, cartTotalAfterDiscount, discountAmount, appliedDiscount, removeFromCart, updateQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState('osobni');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_OPTIONS[0].id);
  const [customerNote, setCustomerNote] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [shippingIsDifferent, setShippingIsDifferent] = useState(false);
  const [previewArchImage, setPreviewArchImage] = useState<string | null>(null);

  const { submitOrder, isSubmitting, orderError, createdOrderId, serverTotal, isPaymentModalOpen, setIsPaymentModalOpen } = useCheckout();

  const totalWeightGrams = cartItems.reduce((sum, item) => sum + (item.weight_grams || 0) * item.quantity, 0);
  const shippingOptions = getShippingOptions(totalWeightGrams, cartTotal, formData.billing_country);
  const minInternationalPrice = getMinInternationalPrice(totalWeightGrams, cartTotal);
  const shippingCost = shippingOptions.find((o) => o.id === selectedShipping)?.price ?? 0;
  const paymentCost = PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.price ?? 0;
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
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                onPreviewArch={setPreviewArchImage}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep
                shippingOptions={shippingOptions}
                selectedShipping={selectedShipping}
                setSelectedShipping={handleShippingChange}
                paymentOptions={PAYMENT_OPTIONS}
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
          <div className="bg-black400 w-full max-w-[500px] rounded-[16px] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-black300/30 bg-[#252C3C]">
              <h3 className="style-h3 text-secondary">{t('paymentModal.title')}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="p-6 bg-white">
              <StripePaymentForm amount={serverTotal ?? totalOrderPrice} orderId={createdOrderId} />
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
            <img
              src={previewArchImage}
              alt={t('archPreviewAlt')}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg pointer-events-none select-none border border-white/10"
            />
            <div className="absolute inset-0 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
