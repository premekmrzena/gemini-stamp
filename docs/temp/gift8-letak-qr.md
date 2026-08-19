# GIFT8 – letáková kampaň – QR adresa

## URL do QR kódu (kopírovat přesně)
```
https://mycreativestamp.com/prague-souvenir?code=GIFT8&utm_source=letak&utm_medium=offline&utm_campaign=gift8
```

## Co dělá
- `/prague-souvenir` – landing page pro asijské turisty, auto-detekuje jazyk telefonu (JA/ZH-Hans/ZH-Hant/KO/EN).
- `code=GIFT8` – po kliknutí na CTA se sleva 8 % automaticky aplikuje v košíku, turista nic nepřepisuje.
- `utm_source=letak&utm_medium=offline&utm_campaign=gift8` – v GA4 se tahle návštěvnost ukáže odděleně od Ads/SEO/přímého provozu (Traffic acquisition → `letak / offline`).

## Jak měřit úspěšnost
- **GA4**: Traffic acquisition, filtr zdroj/médium = `letak / offline`.
- **Admin → Slevové kódy**: `used_count` u GIFT8 = počet reálně uplatněných objednávek z letáku.

## Pozn. k variantám míst
Pokud budeš rozdávat na víc místech a chceš je rozlišit, přidej `&utm_content=misto` (např. `karluv-most`, `stare-mesto`) – nepovinné.

## Související
- Kód GIFT8 založen 2026-08-16, platnost do 2027-08-16, bez omezení počtu použití (viz paměť `project_discount_codes`).
- Implementace auto-apply: PR #5 (`feat/gift8-flyer-qr-autoapply`), zmergováno do `main`.
