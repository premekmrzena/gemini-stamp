# 4. Popis e-shopu (funkční přehled)

> Obecné shrnutí toho, co e-shop dělá a jak se v něm zákazník pohybuje, bez nutnosti číst kód. Popis odpovídá skutečnému chování k 2026-06-16, doplněno o slevy a recenze na mobilu k 2026-07-01.

## 1. Homepage

Záhlaví (`Header.tsx`) obsahuje logo (odkaz na homepage), menu se 4 kategoriemi (Známky, Kreativní archy, First Day Cover, Dárkové plakety – odkazují na `/kategorie/{slug}`) a ikonu košíku s počtem položek. Na mobilu je menu skryté v hamburgeru.

Hero sekce (`Hero.tsx`) je rotující obrázkový slider s nadpisem „Proměň svoje zážitky v krásný sběratelský poklad!“, třemi kroky (1. Vyber si šablonu, 2. Napiš vlastní text, 3. Nahraj svoje fotky) a hlavním CTA tlačítkem „Vybrat šablonu a začít tvořit“, které vede do editoru (`/vytvorit-arch`). Druhý, méně výrazný odkaz vede na vysvětlující stránku „Co je Kreativní arch?“.

Pod Hero sekcí je pruh recenzí (`ReviewStrip.tsx`) – 5 pevně zapsaných referencí zahraničních zákazníků (jméno, země, text, foto, hodnocení vždy 5 hvězd). Na desktopu (`lg:` a výš) se roztáhnou na celou šířku vedle sebe, na mobilu a tabletu jsou vodorovně swipovatelné (scroll-snap, bez viditelného scrollbaru).

Pod pruhem recenzí je výpis produktů. Zobrazují se jen produkty, které mají `is_active = true` **a** `show_on_homepage = true`, řazené podle `tag_top` (produkty s nastaveným TOP pořadím první) a pak podle data vytvoření (nejnovější první).

Každý produkt může mít libovolnou kombinaci těchto štítků současně (zobrazí se vedle sebe, nejde o výběr jen jednoho, vizuálně jako ribbon zarovnaný k pravému okraji karty bez zaoblení na vnější straně):
- **„TOP {číslo}“** – pokud má vyplněné `tag_top` (1–6)
- **„novinka“** – pokud má `tag_new = true`
- **„poslední kusy“** – pokud má `tag_last_pieces = true`
- **„jen u nás“** – zobrazí se jen tehdy, když produkt nemá nastavený žádný z předchozích tří (je to fallback, ne čtvrtý kombinovatelný štítek)

Pokud má produkt vyplněnou `sale_price` (nižší než `price`), karta produktu zobrazí přeškrtnutou původní cenu vedle zlevněné – viz [sekce 5](05-administrace.md#3-záložka-homepage-produkty), jak se sleva nastavuje.

Produkty patří do jedné ze 4 kategorií (`znamky`, `kreativni-archy`, `fdc`, `plakety`) a dají se filtrovat i mimo homepage přes menu – stránka `/kategorie/[slug]` zobrazuje všechny produkty dané kategorie se stejným řazením jako homepage.

Kliknutím na produkt se zákazník dostane na detail (`/produkt/[id]`): hlavní obrázek + galerie, název, cena (se stejnou logikou slevy jako na kartě), technické parametry (katalogové číslo, typ známky, datum vydání, rozměry, designér, rytec…) a popis v rozbalovacích sekcích, plus 3 související produkty na konci stránky (ty sleva zohledňují také). Tlačítkem „Do košíku“ se produkt přidá do košíku přímo z detailu i z karty produktu na výpisu – do košíku jde vždy aktuální efektivní cena (zlevněná, pokud je nastavená).

Košík je udržován v `CartContext` a ukládá se do `localStorage` (klíč `razitka-cart`), takže zákazníkovi zůstane i po zavření prohlížeče.

## 2. Košík

Proces objednávky (`/kosik`) má 3 kroky (Stepper):

1. **Košík** – výpis položek (produkty i vlastní archy), úprava množství, odstranění položky
2. **Doprava a platba** – výběr dopravy (Osobní odběr Praha zdarma / Česká republika 40–120 Kč podle váhy / Mezinárodní doprava 150–300 Kč) a platby (Online kartou přes Stripe / Bankovní převod)
3. **Fakturační a doručovací údaje** – kontaktní a fakturační údaje, volitelně firemní údaje (IČO, DIČ), volitelně odlišná doručovací adresa, poznámka k objednávce

Vedle kroků je po celou dobu vidět souhrn objednávky (mezisoučet, doprava, celková cena).

Po odeslání formuláře se zavolá `/api/create-order`, který znovu ověří ceny i dostupnost položek proti databázi (nikdy nevěří cenám z prohlížeče) a vytvoří objednávku se stavem `Nová`. Přepočet ceny počítá i se slevou (`sale_price`, viz `src/lib/pricing.ts`) – i kdyby klient poslal jinou cenu, server vždy dosadí platnou zlevněnou (nebo plnou) cenu z DB. Dál se liší podle zvolené platby:
- **Platba kartou** – otevře se modální okno se Stripe platebním formulářem, po úspěšné platbě přesměruje na `/dekujeme`
- **Bankovní převod** – přesměruje na `/dekujeme` okamžitě, platební údaje zákazník dostane e-mailem

Stránka „Děkujeme“ zobrazí číslo objednávky, vyčistí košík a zákazníkovi mezitím přijde potvrzovací e-mail s rekapitulací objednávky.

## 3. Editor (Kreativní archy)

Na `/vytvorit-arch` si zákazník nejprve vybere jednu z 5 šablon archu (každá má jiný motiv, počet fotek a náhled). Po výběru se otevře canvas editor.

V editoru zákazník:
- nahrává fotky do jednotlivých fotoslotů (klik na prázdný slot otevře výběr souboru), může je v rámci slotu posouvat a zvětšovat/zmenšovat
- vyplňuje jeden textový slot – má k dispozici zarovnání (vlevo/na střed/vpravo), výběr ze 4 fontů (moderní, elegantní, psací, retro), velikost textu, výběr barvy a volitelný stín textu

Mobilní zobrazení má jiné ovládání než desktop – prochází se sloty postupně (mini-mapa nahoře, šipky nahoru/dolů) s vysouvacím panelem pro textové úpravy. Tato mobilní část je hotová a uzamčená, úpravy se dělají jen na desktopové verzi.

Po dokončení (tlačítko „Dokončit“) se z plátna vygenerují **dva** obrázky a oba se nahrají do Vercel Blob:
- **Náhled** (`preview_url`) – s obrázkem šablony na pozadí, zmenšený na 1080 px šířky. Slouží jen k zobrazení (např. v adminu, e-mailu).
- **Arch pro tisk** (`print_url`) – v plném rozlišení 1:1 vůči originální šabloně (4130×2550 px), **bez** obrázku šablony na pozadí – na bílém plátně jsou jen zákazníkovy fotky a jeho text. Důvod: fyzický arch je předtištěný, dotiskují se na něj jen fotky a text z prázdných slotů.

Záznam v tabulce `custom_stamps` ukládá obě URL zvlášť. Hotový arch se automaticky vloží do košíku v množství 1 ks (množství lze případně upravit až v košíku) a zákazník vidí potvrzovací obrazovku s možností vytvořit další arch nebo přejít do košíku.
