import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware náhrady za next/link a next/navigation - href se
// automaticky prefixuje aktuální mutací. Zatím nepoužité (viz
// docs/09-jazykove-mutace.md - fáze 5), stávající komponenty používají
// next/link přímo a díky localePrefix: 'as-needed' fungují beze změny,
// dokud je aktivní jen výchozí en. Až přibudou další mutace, přepnout
// interní odkazy na tohle, aby se při přepnutí jazyka neztrácel prefix.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
