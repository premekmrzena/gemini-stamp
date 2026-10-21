# Plán úprav: marketing (říjen 2026)

**Finální verze**, schválená 21. 10. 2026. Vychází z auditu GA4 a Google Ads a z testu landing pages (viz příloha na konci).

## A. Web a produkty

### 1. Oprava URL na šablonách
- Obrázky připravíš ty, já je pak nahraju do `public/templates/` a zkontroluju tisk i PDF export.
- Opravit najednou URL i starý název „Creative Stamp“ (stejný problém má logo v hlavičce webu).

### 2. Sleva 25 % na celý e-shop do 30. 11. 2026
- Nastavit `sale_price` a `sale_price_eur` u všech aktivních produktů na 75 % ceny. Mechanika slev už existuje (`src/lib/pricing.ts`), počítá s ní i košík, objednávka na serveru a feed pro Merchant Center.
- Do konce listopadu. Zrušení slevy 1. 12. je potřeba hlídat (připomínka nebo skript).
- ✅ Nastaveno v DB 21. 10. u všech 55 aktivních produktů (`sale_price` = round(price × 0,75), `sale_price_eur` = round(price_eur × 0,75, 2)). Zrušení = `update products set sale_price = null, sale_price_eur = null;`
- ✅ Opravena chyba: kreativní arch se do košíku přidával za plnou cenu (vlastní archy nenačítaly `sale_price`), přestože server účtoval zlevněnou.
- **Pravidlo o nejnižší ceně za 30 dní:** zákon o ochraně spotřebitele (§ 12a) vyžaduje počítat slevu z nejnižší ceny za posledních 30 dní. Ceny se od launche neměnily, takže je to v pořádku. Po skončení slevy je ale nesmíme 30 dní znovu „zlevnit“ ze zvednuté ceny.
- **GIFT8 + sleva:** kombinovat. Celkem to dá zhruba 31 % (0,75 × 0,92).
- Marže: ověřeno, v pořádku.
- ✅ Karlův most: cena opravena 21. 10. z 15 Kč na 209 Kč (před slevou).

### 3. Landing pages: „cena od“ a expres doručení
- Kreativní arch po slevě vychází **od 42 €** místo 56 €. Na landing pages dát přeškrtnutou cenu.
- **Expres doručení na hotel** (nový způsob dopravy v checkoutu):
  - doručuje majitel osobně,
  - cena **150 Kč / 6 €**,
  - objednávka do 14:00 = doručení další pracovní den,
  - **víkendy ne**, platí jen pro hotely na území Prahy,
  - v checkoutu pole „hotel“ a „datum odjezdu“.
- ⚠️ Text na /partners (`src/app/partners/content.ts`) zatím slibuje doručení i v sobotu („objednávka ze čtvrtka po 14:00 dorazí v sobotu“). Opravit na „bez víkendů“, aby to sedělo s checkoutem.

### 4. Expres doručení i na hlavním e-shopu
- Pruh nebo odznak na homepage, detailu produktu a v košíku. Navazuje na bod 3.

### 5. Upoutávka na známky na landing pages
- Náhled jen jednoho produktu: aršík **Karlův most – 650 let** (kategorie Známkové archy).
- Odkaz vede do kategorie **známky** (`/kategorie/znamky`), kde se známkové archy zobrazují spolu se známkami.
- Text „cena od“ = nejlevnější známka po slevě (5 € → 3,75 €).

### 6. Social proof a recenze
- Necháváme, je to rozhodnutí z 21. 10.
- Riziko: s placenou reklamou se zvyšuje šance, že je zkontroluje Google i Meta. Při ručním review FB/IG reklamy můžou vymyšlené recenze (`TrustBadges.tsx`, `ReviewStrip.tsx`) shodit účet. Vrátit se k tomu, až přijdou první skutečné recenze.

## B. Google

### 7. Search kampaně
- Kampaně Gift a Souvenir **zůstávají oddělené**.
- Strop CPC zvednout z 8 Kč na 15–20 Kč.
- Přidat klíčová slova: personalized/custom stamps, Mucha gift, Prague gift with photo.
- Zkusit cílit i na lidi, kteří cestu do Prahy plánují.
- Do reklam dát „25 % off“ a „hotel delivery“ a přepsat nadpisy reklam. Až bude expres doručení v checkoutu (bod 3).
- Rozpočet 150–200 Kč/den celkem na 3–4 týdny, pak vyhodnotit. Aby se z toho dalo něco usoudit, potřebujeme aspoň 200–300 kliků.

### 8. Mikrokonverze v GA4
- `view_item`, `add_to_cart`, `begin_checkout` a `purchase` už posíláme (`src/lib/gtag.ts`).
- Přidat události z editoru: výběr šablony, nahrání první fotky, dokončení návrhu. A klik na CTA na landing pages.
- V GA je označit jako klíčové události a naimportovat do Ads jako sekundární konverze. Ads se dál optimalizují na nákup.
- Zkrátit zpoždění cookie lišty (2 s), jinak GA dál nezapočítá část návštěv.

## C. Kanály mimo Google

### 9. FB/Instagram reklama pro západní turisty (/prague-gift)
**Řešíme jako poslední.**
- Na Metě je tenhle produkt nejspíš silnější než na Googlu: je vizuální a lidé ho nehledají, takže je potřeba jim ho ukázat.
- **Meta Pixel + Conversions API** na webu, napojené na kategorii „Marketing“ v cookie liště. Udělám já.
- **Meta Business účet, reklamní účet a ověření firmy** (DVKS s.r.o.) uděláš ty. Počítat s pár dny čekání.
- **Kreativa:** krátké video (Reels), jak někdo na mobilu nahraje fotky z Karlova mostu a pak drží hotový arch. Potřeba natočit hotové archy.
- **Cílení:** lidé, kteří právě cestují v Praze. Druhá vlna: lidé, kteří se z Prahy nedávno vrátili domů (US, UK, DE). Test 150–250 Kč/den na 2 týdny.

## Pořadí realizace

| Fáze | Body | Kdo | Stav |
|---|---|---|---|
| 1 | sleva 25 % v DB (2) + mikrokonverze + cookie lišta (8) | Claude | ✅ sleva v DB 21. 10., kód v PR; zbývá označit klíčové události v GA4 a import do Ads |
| 2 | landing pages: „cena od“ + upoutávka na aršík Karlův most (3, 5) | Claude | ✅ v PR (expres doplní fáze 3) |
| 3 | expres doručení na hotel: checkout, info na webu, oprava /partners (3, 4) | Claude | ✅ v PR, před merge spustit SQL 030 |
| 4 | Search kampaně: CPC, klíčová slova, texty s 25 % a hotel delivery, rozpočet (7) | Claude v Ads | po fázi 3 |
| 5 | šablony s opravenou URL (1) | ty obrázky, Claude nasazení | čeká na obrázky |
| 6 | Meta Pixel → účet → první FB/IG kampaň (9) | Claude pixel, ty účet a kreativu | poslední |

Všechny otevřené otázky jsou zodpovězené.

---

## Příloha: výchozí stav k 21. 10. 2026

- **Objednávky:** od launche 0 reálných, jediná je adminův test z 22. 9. GIFT8 použit 0×.
- **Google Ads od 13. 8.:** 712 kliků, 1 585 Kč, 0 konverzí.
  - PMax: 670 kliků za 1 274 Kč, hledaný výraz má jen asi 60 z nich, zbytek je Display/YouTube/Discover. Pozastaveno.
  - Search Souvenir: 1 095 zobrazení, 42 kliků, 311 Kč, kampaň omezuje strop nabídky 8 Kč.
  - Search Gift: 4 zobrazení za měsíc.
- **GA4 za 90 dní:** 289 návštěv.
  - Placené vyhledávání: 27 návštěv, zapojení 26 %, 22 s.
  - Organické vyhledávání: 4 návštěvy.
  - Klíčové události i tržby jsou jen z testů.
- **Landing pages:** technicky funkční (CTA → /vytvorit-arch → editor, bez chyb v konzoli). Chybí cena (kreativní archy 56–78 €) i doba a cena doručení.
