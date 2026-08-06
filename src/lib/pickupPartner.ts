// Odběrné místo u partnera In Arte veritas (Tržiště 3, Malá Strana, Praha) - domluveno 2026-08-06.
// Vlastní soubor BEZ 'use client' záměrně - server komponenty (jak-nakupovat, faq, kontakt)
// z 'use client' souboru (PickupPartner.tsx) dostanou jen client reference proxy, ne skutečnou
// hodnotu řetězce (na serveru se pak `encodeURIComponent()`/`href=` na takové proxy rozbije -
// typicky vrátí stringifikovaný zdroj interní throw funkce misto textu). Konstanty proto žijí
// tady a PickupPartner.tsx (i server stránky) je odsud jen importují.
export const ARTE_VERITAS_ADDRESS = 'Tržiště 3, Malá Strana, Praha';
export const ARTE_VERITAS_MAPS_URL = 'https://maps.app.goo.gl/2RARN9YNVU15UqCg6';
