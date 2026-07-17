import { defineRouting } from 'next-intl/routing';

// Mezinárodní mutace eshopu (viz docs/09-jazykove-mutace.md). CZ sem
// záměrně nepatří - poběží na samostatné doméně, zatím vůbec nespuštěná,
// řeší se jako samostatná věc, až na ni dojde řada. EN je teď jediná
// aktivní/přeložená mutace, KO/JA/ZH-Hans/ZH-Hant jsou v poli připravené
// dopředu (uzavřená známá sada), aby jejich pozdější spuštění byla jen
// otázka doplnění messages/*.json, ne úprav routingu.
export const routing = defineRouting({
  locales: ['en', 'ko', 'ja', 'zh-Hans', 'zh-Hant'],
  defaultLocale: 'en',
  // Výchozí locale (en) bez prefixu v URL - zachovává dnešní bezprefixové
  // cesty (/, /kategorie/...) beze změny, dokud jsou ostatní jazyky prázdné.
  localePrefix: 'as-needed',
});
