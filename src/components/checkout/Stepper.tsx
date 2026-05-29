interface StepperProps {
  currentStep: number;
  totalSteps?: number;
}

export default function Stepper({ currentStep, totalSteps = 3 }: StepperProps) {
  return (
    <div className="flex items-center">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center rounded-full style-body-bold leading-none transition-colors w-[32px] h-[32px] md:w-[36px] md:h-[36px] ${
              currentStep === step
                ? 'bg-primary text-black'
                : 'bg-transparent text-black300 border border-black300'
            }`}
          >
            {step}
          </div>
          {index < totalSteps - 1 && (
            <div className="h-[1px] bg-black300 w-[10px] md:w-[16px]" />
          )}
        </div>
      ))}
    </div>
  );
}
