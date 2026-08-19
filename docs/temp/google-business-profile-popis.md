# Google Business Profile – popis (EN) – draft

## Popis (Business description, limit 750 znaků, tenhle má 609)

**Update:** uživatel do GBP zadal adresu výdejního místa (In Arte Veritas) – popis musí hned na začátku vyjasnit, že se objednává na webu a adresa je jen pro vyzvednutí, ne kamenný obchod k procházení. Verze níže tohle řeší hned v první větě (v prvních ~250 zobrazených znacích).

```
My Creative Stamp is an online shop – please order on our website first. This address (In Arte Veritas, Tržiště 3, Malá Strana, open daily 12–20) is our order pickup point only, not a walk-in store.

We turn your own travel photos into a real, mailable sheet of postage stamps – a personal, one-of-a-kind souvenir from Prague. Choose a template inspired by Czech architecture and Alphonse Mucha's art, add your own photos, and design your own Creative Sheet in minutes. We also offer collectible postage stamps, First Day Covers, and gift plaques.

Shipping worldwide is also available, straight to your door.
```

**Pozn. k prvním ~250 znakům** – jen ty se zobrazí, než uživatel klikne na "more", zbytek je "schovaný". Proto disambiguace (online shop / pickup only) hned na začátku, ne až za ohybem.

<details>
<summary>Starší verze (bez disambiguace, nepoužívat)</summary>

```
My Creative Stamp turns your own travel photos into a real, mailable sheet of postage stamps – a personal, one-of-a-kind souvenir from Prague. Choose a template inspired by Czech architecture and Alphonse Mucha's art, add your own photos, and design your own Creative Sheet in minutes. We also offer collectible postage stamps, First Day Covers, and gift plaques for stamp enthusiasts.

Pick up your finished sheet in person near Charles Bridge at our partner gallery In Arte Veritas (Tržiště 3, Malá Strana, open daily 12–20), or have it shipped worldwide straight to your door.

A souvenir made from your own trip – not bought off a shelf.
```
</details>

**Vědomě vynecháno** (Google to u popisu nedovoluje / penalizuje):
- žádná URL, žádné telefonní číslo (mají vlastní pole ve formuláři, ne v popisu)
- žádný slevový kód / promo text (GIFT8) – to patří do Postů/nabídek, ne do popisu
- žádné superlativy typu "best/cheapest" (proti pravidlům, riziko zamítnutí)

## Zdroj dat (pro konzistenci s webem)
- Adresa/hodiny: `Tržiště 3, Malá Strana, Praha`, denně 12–20 h (partner In Arte Veritas, viz `project_pickup_partner_arte_veritas` v paměti)
- Tón/copy navazuje na `/prague-souvenir` a `/prague-gift` (`src/app/prague-souvenir/content.ts`)

## Zbývá (na požádání můžu doplnit)
- Kategorie (např. "Gift shop" / "Souvenir store" / "Craft shop")
- Otevírací doba ve formátu GBP
- Krátký popis pro Google Posts (kratší, samostatné pole)
