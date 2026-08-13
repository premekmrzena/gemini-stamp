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
  // Bez tohohle next-intl automaticky přesměrovává neprefixované cesty podle
  // Accept-Language/NEXT_LOCALE cookie - u 'cs' (jen interní náhled, ne živá
  // mutace) to znamenalo, že český/slovenský návštěvník s Accept-Language: cs
  // dostal /cs, kde ho proxy.ts (neautorizovaný) poslal zpátky na homepage -
  // odkaz na VOP/GDPR nebo cokoli neprefixovaného tak reálně nešel otevřít.
  // Objeveno 2026-08-13 přes odkazy v patičce /prague-souvenir a /prague-gift
  // (samostatný root layout => každý odkaz ven je fresh page-load => detekce
  // se spustí znovu), ale platilo by to pro jakýkoli fresh page-load kamkoli
  // na webu. KO/JA/ZH-Hans/ZH-Hant zatím nejsou živé mutace (prázdné
  // messages/*.json), takže se jich tohle prakticky netýká - jen 'cs' bylo
  // reálně dosažitelné auto-detekcí. Explicitní prefixované cesty (/cs/...,
  // /ja/...) dál fungují beze změny, tohle vypíná jen automatické hádání pro
  // NEprefixované cesty. Viz feedback_proxy_locale_redirect_loop pro historii.
  localeDetection: false,
});
