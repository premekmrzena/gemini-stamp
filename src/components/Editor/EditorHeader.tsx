'use client';

import Image from 'next/image';
import Link from 'next/link';

interface EditorHeaderProps {
  currentStep: number;
}

export default function EditorHeader({ currentStep }: EditorHeaderProps) {
  // Pomocná funkce pro texty v záhlaví podle kroku
  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Výběr šablony";
      case 2: return "Fotografie a text";
      case 3: return "Hotovo";
      default: return "";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shadow-md shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-between relative">
        
        {/* LEVÁ ČÁST: Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center h-full">
          <Image 
            src="/images/creative-stamp_logo.svg" 
            alt="Logo" 
            width={250} 
            height={69} 
            priority 
            className="hidden md:block w-[250px] h-auto object-contain" 
          />
          <Image 
            src="/images/logo-black200_basked-mobile.svg" 
            alt="Logo Mobile" 
            width={40} 
            height={40} 
            priority 
            className="block md:hidden h-[40px] w-auto object-contain" 
          />
        </Link>

        {/* STŘEDNÍ ČÁST: Titulek */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden md:block">
          <h2 className="style-h2 text-secondary whitespace-nowrap">
            {getStepTitle()}
          </h2>
        </div>

        {/* PRAVÁ ČÁST: Dynamický Stepper */}
        <div className="flex items-center">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center">
              <div 
                className={`flex items-center justify-center rounded-full font-medium transition-all duration-300 w-[36px] h-[36px] text-sm ${
                  currentStep === step 
                    ? 'bg-primary text-black-custom font-bold shadow-lg shadow-primary/20 scale-110' 
                    : currentStep > step 
                      ? 'bg-success text-white' // Hotový krok
                      : 'bg-transparent text-black300 border border-black300'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {index < 2 && (
                <div className={`h-[1px] w-[10px] md:w-[16px] transition-colors duration-500 ${
                  currentStep > step ? 'bg-success' : 'bg-black300'
                }`} />
              )}
            </div>
          ))}
        </div>
        
      </div>
    </header>
  );
}