export const SITE_URL = 'https://mycreativestamp.com';
export const SITE_NAME = 'My Creative Stamp';
export const SITE_DEFAULT_TITLE = 'My Creative Stamp | Postage Stamps and Creative Sheets';
export const SITE_DEFAULT_DESCRIPTION =
  'Collectible postage stamps, First Day Covers, and gift plaques. Create your own Creative Sheet with real postage stamps and your own photos.';

// hreflang pro metadata.alternates.languages. 'en' je jediná živě spuštěná a
// plně přeložená mutace (viz i18n/routing.ts) - 'cs' je jen interní pracovní
// náhled, který proxy.ts přesměrovává pryč pro každého bez gate cookie, a
// ko/ja/zh-Hans/zh-Hant mají zatím prázdné messages/*.json. Přidat sem tyhle
// locales by řeklo Googlu, ať nabízí stránky, které buď nejdou zobrazit, nebo
// nejsou přeložené - proto zatím jen self-reference + x-default.
export function localeAlternates(path: string): Record<string, string> {
  return { en: path, 'x-default': path };
}
