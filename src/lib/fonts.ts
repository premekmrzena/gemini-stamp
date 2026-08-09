import { Poppins } from 'next/font/google';

// Sdílený loader pro všechny kořenové layouty (viz [[project_session]] poznámka
// k html lang fixu) - [locale], /admin i /rekonstrukce jsou od sebe teď oddělené
// root layouty (Next.js "multiple root layouts"), každý potřebuje vlastní
// import fontu, ale ať to není 3x nezávisle nakonfigurované, žije to tady.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});
