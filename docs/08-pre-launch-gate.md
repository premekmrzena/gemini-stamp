# 8. Pre-launch maintenance gate

> Stav popsaný podle skutečného kódu k 2026-07-16. Tuto sekci aktualizovat při každé změně gate logiky nebo při ostrém spuštění (bod „Vypnutí" níže).

## K čemu to je
Doména `mycreativestamp.com` je aktivní a napojená na Vercel ještě předtím, než je e-shop připravený být veřejně vidět (indexovatelný, dohledatelný, otevřený komukoli). Gate schová celý web za heslo, aniž by blokoval DNS/SSL/deploy pipeline – ty můžou běžet naostro už teď.

## Jak to funguje
- **`src/proxy.ts`** – v Next.js 16 se `middleware.ts` přejmenoval na `proxy.ts` (funkce `proxy` místo `middleware`), viz [migrace v Next docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#migration-to-proxy). Běží na Node.js runtime při každém requestu (kromě věcí v `matcher` níže).
- Pokud env proměnná **`MAINTENANCE_MODE`** není `'true'`, proxy nic nedělá (`NextResponse.next()`) – gate je efektivně vypnutá.
- Pokud je zapnutá, kontroluje cookie `site_access`:
  - **Sedí** s `SITE_ACCESS_PASSWORD` → request pokračuje normálně.
  - **Nesedí/chybí** a jde o stránku → `NextResponse.rewrite()` na `/rekonstrukce` (URL v prohlížeči zůstává původní, obsah je gate stránka).
  - **Nesedí/chybí** a jde o `/api/*` (mimo výjimky) → čistá JSON odpověď `503` místo přepsání na HTML (aby to nerozbilo `fetch()` volání z klientského kódu).
- **`matcher`** vynechává z gate: `/api/stripe-webhook` (volá ho Stripe server-to-server, nemá cookie), `/api/site-access` (samotné odemykání – jinak by se nikdy nedalo zadat heslo), `_next/static`/`_next/image`, `/rekonstrukce` a jakoukoli cestu s příponou (obrázky, video, favicon, `sitemap.xml`, `robots.txt` – žádný soubor v `public/` se tak nerozbije).

## Odemykací flow
1. **`src/app/rekonstrukce/page.tsx`** – branded stránka „Web se připravuje" (logo, krátký text, pole na heslo), `robots: noindex`. Formulář je čisté HTML (`<form action="/api/site-access" method="POST">`), žádný klientský JS.
2. **`src/app/api/site-access/route.ts`** – ověří heslo proti `SITE_ACCESS_PASSWORD`. Správně → nastaví httpOnly cookie `site_access` (30 dní, `secure` jen v produkci) a redirect na `/`. Špatně → redirect zpátky na `/rekonstrukce?error=1` (stránka pak zobrazí chybovou hlášku).

## Proměnné prostředí
| Proměnná | Účel |
|---|---|
| `MAINTENANCE_MODE` | `'true'` = gate aktivní, cokoli jiného (nebo nenastaveno) = gate vypnutá |
| `SITE_ACCESS_PASSWORD` | Sdílené heslo pro vstup – zároveň hodnota, kterou se porovnává cookie |

Nastaveno v `.env.local` (lokální vývoj, vygenerované náhodné heslo) i ve Vercel Environment Variables pro produkci (uživatel zadal vlastní heslo 2026-07-16).

## Vypnutí před ostrým spuštěním
Až bude e-shop připravený být veřejně dostupný:
1. Ve Vercel dashboardu (Settings → Environment Variables) přepnout `MAINTENANCE_MODE` na `false` (nebo proměnnou smazat).
2. Redeploy (nebo počkat na další push).
3. Žádný zásah do kódu není potřeba – `/rekonstrukce`, `/api/site-access` a `src/proxy.ts` můžou v repu zůstat, jen se přestanou používat. Pokud by se měly odstranit úplně, smazat tyto tři cesty a tento řádek v env.

## Otevřené body
- Heslo je jedno sdílené pro všechny (žádné jednotlivé účty/log kdo se přihlásil) – vědomá volba pro jednoduchost, viz [sekce 6](06-odlozene-ulohy.md), pokud by se to mělo časem změnit.
- Cookie `site_access` má stejnou hodnotu jako heslo samotné (ne oddělený token) – u pre-launch gate bez citlivých dat uvnitř to je dostačující, nejde o produkční autentizaci.
