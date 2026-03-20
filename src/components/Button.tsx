import React from 'react';

// Zde definujeme, jaké vlastnosti (props) může naše tlačítko přijímat
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined';
  arrow?: 'left' | 'right' | 'none';
  isIconOnly?: boolean;
}

export default function Button({
  children,
  variant = 'contained',
  arrow = 'none',
  isIconOnly = false,
  className = '',
  ...props
}: ButtonProps) {
  
  // 1. Základní styly (font, zaoblení, animace)
  // Používáme scale-[1.03] pro tvůj požadovaný hover efekt "grow 3%"
  const baseClasses = "inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95";

  // 2. Responzivní velikosti písma a odsazení (16px padding, 12px mezera pro ikonu)
  const sizeClasses = "text-[16px] md:text-[18px] lg:text-[20px] p-[16px] gap-[12px]";

  // 3. Varianty barev
  const containedClasses = "bg-[#FF6B35] text-[#0F172A] hover:bg-[#FF7F51]";
  const outlinedClasses = "bg-transparent border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FDFBF7]/5 hover:border-[#FF7F51] hover:text-[#FF7F51]";

  const variantClasses = variant === 'contained' ? containedClasses : outlinedClasses;

  // 4. Vnitřní komponenta pro šipku (využívá currentColor, takže se barví podle textu)
  const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 transition-transform ${direction === 'left' ? 'rotate-180' : ''}`}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {/* Vykreslení šipky vlevo */}
      {!isIconOnly && arrow === 'left' && <ArrowIcon direction="left" />}
      
      {/* Vykreslení tlačítka, kde je POUZE ikona */}
      {isIconOnly && <ArrowIcon direction={arrow === 'left' ? 'left' : 'right'} />}

      {/* Vykreslení samotného textu */}
      {!isIconOnly && <span>{children}</span>}

      {/* Vykreslení šipky vpravo */}
      {!isIconOnly && arrow === 'right' && <ArrowIcon direction="right" />}
    </button>
  );
}