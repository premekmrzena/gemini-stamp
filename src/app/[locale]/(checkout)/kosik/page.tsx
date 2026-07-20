'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import StripePaymentForm from '@/components/StripePaymentForm';
import { getShippingOptions, PAYMENT_OPTIONS } from '@/lib/constants';
import { useCheckout } from '@/hooks/useCheckout';
import CartStep from '@/components/checkout/CartStep';
import ShippingStep from '@/components/checkout/ShippingStep';
import AddressForm from '@/components/checkout/AddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import Stepper from '@/components/checkout/Stepper';

const EMPTY_FORM = {
  billing_first_name: '', billing_last_name: '', billing_email: '', billing_phone: '',
  billing_company_name: '', billing_company_id: '', billing_company_tax_id: '',
  billing_address_line1: '', billing_address_line2: '', billing_city: '', billing_region: '', billing_zip: '',
  billing_country: 'Česká republika',
  shipping_first_name: '', shipping_last_name: '', shipping_phone: '', shipping_company_name: '',
  shipping_address_line1: '', shipping_address_line2: '', shipping_city: '', shipping_region: '', shipping_zip: '', shipping_country: '',
};

const CheckoutPage = () => {
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
  const shippingOptions = getShippingOptions(totalWeightGrams);
  const shippingCost = shippingOptions.find((o) => o.id === selectedShipping)?.price ?? 0;
  const paymentCost = PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.price ?? 0;
  const totalOrderPrice = cartTotalAfterDiscount + shippingCost + paymentCost;
  const isMezinarodni = selectedShipping === 'mezinarodni';

  // Hydration guard (počká na klientský mount) - nejde nahradit lazy initializerem,
  // ten by běžel i při SSR a dal by jiný výsledek než na klientovi.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentStep]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
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
          <h1 className="style-h2 text-secondary">Váš košík je prázdný</h1>
          <Link href="/" className="mt-4"><Button>Zpět k nákupu</Button></Link>
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
                setSelectedShipping={setSelectedShipping}
                paymentOptions={PAYMENT_OPTIONS}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
              />
            )}
            {currentStep === 3 && (
              <AddressForm
                formData={formData}
                onChange={handleInputChange}
                customerNote={customerNote}
                onNoteChange={setCustomerNote}
                isMezinarodni={isMezinarodni}
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

      <footer className="fixed bottom-0 left-0 w-full z-50 bg-black500 border-t border-black300/30 h-[80px] md:h-[116px] flex items-center justify-center shadow-lg">
        <div className="layout-container flex justify-between items-center">
          <Button onClick={currentStep === 1 ? undefined : () => setCurrentStep((p) => p - 1)} variant="outlined" arrow="left">
            {currentStep === 1 ? <Link href="/">Zpět</Link> : 'Zpět'}
          </Button>
          <div className="flex flex-col items-end">
            {orderError && <p className="text-red-500 text-sm mb-2">{orderError}</p>}
            <Button
              onClick={currentStep === 3 ? handleSubmit : () => setCurrentStep((p) => p + 1)}
              disabled={isSubmitting}
              arrow="right"
            >
              {isSubmitting ? 'Odesílám...' : currentStep === 3 ? (selectedPayment === 'karta' ? 'Zaplatit' : 'Dokončit') : 'Další krok'}
            </Button>
          </div>
        </div>
      </footer>

      {isPaymentModalOpen && createdOrderId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black400 w-full max-w-[500px] rounded-[16px] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-black300/30 bg-[#252C3C]">
              <h3 className="style-h3 text-secondary">Platba kartou</h3>
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
              alt="Náhled vašeho archu známek"
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
