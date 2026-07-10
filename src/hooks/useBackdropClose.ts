import { useRef } from 'react';

// Zavře modal jen když mousedown i click obojí začaly přímo na backdropu –
// jinak by se modal zavřel i při označování textu myší uvnitř obsahu, pokud
// tažení skončí mimo obsah (nad backdropem, protože tam skončil mouseup).
export function useBackdropClose(onClose: () => void) {
  const mouseDownOnBackdrop = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    mouseDownOnBackdrop.current = e.target === e.currentTarget;
  }

  function onClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && mouseDownOnBackdrop.current) onClose();
  }

  return { onMouseDown, onClick };
}
