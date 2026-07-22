import { defineRouting } from 'next-intl/routing';

// Mezinárodní mutace eshopu (viz docs/09-jazykove-mutace.md). EN je jediná
// veřejně spuštěná/produkční mutace, KO/JA/ZH-Hans/ZH-Hant jsou v poli
// připravené dopředu (uzavřená známá sada), aby jejich pozdější spuštění
// byla jen otázka doplnění messages/*.json, ne úprav routingu.
// 'cs' je tu jen jako interní pracovní náhled (/cs prefix, za pre-launch
// gate) pro porovnání CZ vs. EN UI textů při vývoji - NENÍ to plnohodnotná
// CZ mutace pro zákazníky (ceny/platby zůstávají v EUR). Reálný CZ eshop
// poběží na samostatné doméně, až na ni dojde řada.
export const routing = defineRouting({
  locales: ['en', 'cs', 'ko', 'ja', 'zh-Hans', 'zh-Hant'],
  defaultLocale: 'en',
  // Výchozí locale (en) bez prefixu v URL - zachovává dnešní bezprefixové
  // cesty (/, /kategorie/...) beze změny, dokud jsou ostatní jazyky prázdné.
  localePrefix: 'as-needed',
});
