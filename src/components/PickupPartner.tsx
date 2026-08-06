'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import { ARTE_VERITAS_ADDRESS, ARTE_VERITAS_MAPS_URL } from '@/lib/pickupPartner';

// Dvě odlišné vyskakovací interakce sdílející stejnou modal kostru (backdrop, zavírání, styl):
// - ArteVeritasLink: bold odkaz na jméno partnera -> foto galerie v modalu
// - AddressMapLink: adresa jako odkaz -> vložená Google mapa v modalu
// Konstanty adresy/mapy viz @/lib/pickupPartner (schválně mimo tenhle 'use client' soubor).

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const backdrop = useBackdropClose(onClose);

  // Portál do document.body ze dvou důvodů: 1) trigger sedí uvnitř <p>/<label> (Row,
  // FaqRow, ShippingStep) - vykreslit sem blokové divy modalu přímo by byl neplatný
  // HTML nesting (div v p) a spadla by hydratace; 2) v <label> checkout řádku by klik
  // kamkoli v modalu jinak probublal až k labelu a nechtěně přepnul vybraný způsob dopravy.
  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onMouseDown={backdrop.onMouseDown}
      onClick={backdrop.onClick}
    >
      {children}
    </div>,
    document.body,
  );
}

// `<button>` je labelable element - kdyby sedělo v <label> se skutečným radio inputem
// (checkout ShippingStep), prohlížeč by bez `for` atributu vzal jako implicitní "control"
// labelu první labelable potomka v tree order, tedy tenhle button místo radia, a klik kamkoli
// v řádku by pak jen otevíral modal místo výběru dopravy. `<span role="button">` labelable
// není, takže se o tuhle roli neuchází - klik/klávesnice fungují stejně, jen bez natívní sémantiky.
function TriggerSpan({
  children,
  onOpen,
  className,
}: {
  children: React.ReactNode;
  onOpen: () => void;
  className: string;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </span>
  );
}

export function ArteVeritasLink({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TriggerSpan
        onOpen={() => setOpen(true)}
        className="font-bold underline decoration-primary/50 underline-offset-2 hover:text-primary transition-colors"
      >
        {children}
      </TriggerSpan>
      {open && (
        <ModalShell onClose={() => setOpen(false)}>
          <div className="relative w-full max-w-lg animate-fadeIn">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zavřít"
              className="absolute -top-10 right-0 text-secondary/70 hover:text-secondary transition-colors"
            >
              <X size={24} />
            </button>
            <div className="rounded-[4px] overflow-hidden border border-black300/30 shadow-2xl bg-black400">
              <Image
                src="/images/arte-veritas01.jpg"
                alt="In Arte veritas"
                width={800}
                height={980}
                className="w-full h-auto"
              />
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}

export function AddressMapLink({
  children,
  mapsLabel,
  className,
}: {
  children: React.ReactNode;
  mapsLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(ARTE_VERITAS_ADDRESS)}&output=embed`;

  return (
    <>
      <TriggerSpan
        onOpen={() => setOpen(true)}
        className={className ?? 'underline decoration-primary/50 underline-offset-2 hover:text-primary transition-colors'}
      >
        {children}
      </TriggerSpan>
      {open && (
        <ModalShell onClose={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-[4px] overflow-hidden border border-black300/30 shadow-2xl bg-black400 animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-black300/30">
              <span className="style-body-bold text-secondary">In Arte veritas</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
                className="text-secondary/60 hover:text-secondary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={embedUrl}
              className="w-full h-[220px]"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={ARTE_VERITAS_ADDRESS}
            />
            <a
              href={ARTE_VERITAS_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group/map flex items-center justify-between gap-2 px-4 py-3 hover:bg-black300/20 transition-colors"
            >
              <span className="style-label text-secondary/80">{mapsLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/80 shrink-0 group-hover/map:translate-x-0.5 transition-transform">
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </ModalShell>
      )}
    </>
  );
}
