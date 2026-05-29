import Image from 'next/image';
import Link from 'next/link';

interface CheckoutHeaderProps {
  right?: React.ReactNode;
  center?: React.ReactNode;
}

export default function CheckoutHeader({ right, center }: CheckoutHeaderProps) {
  return (
    <header className="w-full bg-black500 text-secondary h-[62px] md:h-[78px] lg:h-[92px] relative z-40 border-b border-black300/30 shadow-md">
      <div className="layout-container h-full flex items-center justify-between gap-4">

        <Link href="/" className="flex-shrink-0 flex items-center h-full">
          <Image
            src="/images/creative-stamp_logo.svg"
            alt="Creative Stamp Logo"
            width={250}
            height={69}
            priority
            className="h-[40px] w-auto md:h-[52px] lg:h-[62px] object-contain"
          />
        </Link>

        {center && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
            {center}
          </div>
        )}

        {right && <div className="flex-shrink-0">{right}</div>}

      </div>
    </header>
  );
}
