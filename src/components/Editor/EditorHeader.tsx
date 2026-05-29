'use client';

import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import Stepper from '@/components/checkout/Stepper';

interface EditorHeaderProps {
  currentStep: number;
}

const STEP_TITLES: Record<number, string> = {
  1: 'Výběr šablony',
  2: 'Fotografie a text',
  3: 'Hotovo',
};

export default function EditorHeader({ currentStep }: EditorHeaderProps) {
  return (
    <CheckoutHeader
      center={
        <h2 className="style-h3 text-secondary whitespace-nowrap">
          {STEP_TITLES[currentStep] ?? ''}
        </h2>
      }
      right={<Stepper currentStep={currentStep} />}
    />
  );
}
