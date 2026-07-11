import { Playfair_Display, Dancing_Script, Righteous } from 'next/font/google';

// next/font self-hostuje tyto fonty a registruje je v document.fonts pod
// doslovným jménem rodiny (stejně jako next/font/google Poppins v layout.tsx).
// Editor (StampEditor/TextControls/canvasUtils) na tato jména odkazuje jako
// na obyčejné CSS/canvas font-family stringy, takže je potřeba je takto
// natáhnout - přímé @import url(...) na fonts.googleapis.com v globals.css
// se v tomto Turbopack buildu do výsledného CSS vůbec nepropsalo.
//
// Použijeme `variable` (jen CSS custom property), NE `className` - ten by na
// wrapperu nastavil `font-family` a přes dědičnost přebil výchozí Poppins
// ve všech potomcích (tlačítka, inputy, placeholdery slotů...).
export const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: '700', display: 'swap', variable: '--font-playfair-display' });
export const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '700', display: 'swap', variable: '--font-dancing-script' });
export const righteous = Righteous({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-righteous' });

export const editorFontClassNames = `${playfairDisplay.variable} ${dancingScript.variable} ${righteous.variable}`;
