# 4. Popis e-shopu (funkční přehled)

> Obecné shrnutí toho, co e-shop dělá a jak se v něm zákazník pohybuje, bez nutnosti číst kód. Popis odpovídá skutečnému chování k 2026-06-16, doplněno o slevy a recenze na mobilu k 2026-07-01, doplněno o flow „Začít tvořit“ pro kreativní archy k 2026-07-01, doplněno o sjednocení vstupu do výběru šablony a ceny na kartách šablon k 2026-07-03, doplněno o slevové kódy, stránku „Jak nakupovat“ a info pruh na homepage k 2026-07-08, doplněno o formátovaný detailní popis a opravu fontů v editoru k 2026-07-11, doplněno o vyhledávání/řazení, zrušení mrtvé kategorie kreativní-archy a přeskupení homepage k 2026-07-12.

## 1. Homepage

Záhlaví (`Header.tsx`) obsahuje logo (odkaz na homepage), menu se 4 kategoriemi a ikonu košíku s počtem položek. Známky, First Day Cover a Dárkové plakety odkazují na `/kategorie/{slug}`; **Kreativní archy** vedou rovnou na výběr šablony `/vytvorit-arch` (Krok 1 editoru, viz [sekce 3](#3-editor-kreativní-archy)) – kategorie `/kategorie/kreativni-archy` samotná v menu už není, `/vytvorit-arch` je pro kreativní archy výchozí stránka. Na mobilu je menu skryté v hamburgeru.

Hero sekce (`Hero.tsx`) je rotující obrázkový slider s nadpisem „Proměň svoje zážitky v krásný sběratelský poklad!“, třemi kroky (1. Vyber si šablonu, 2. Napiš vlastní text, 3. Nahraj svoje fotky) a hlavním CTA tlačítkem „Vybrat šablonu a začít tvořit“, které vede do editoru (`/vytvorit-arch`). Druhý, méně výrazný odkaz vede na vysvětlující stránku „Co je Kreativní arch?“ (od 2026-07-08 zvýrazněný primární barvou, dřív byl tlumeně šedý).

Pod Hero sekcí je informační pruh (`ShopInfoStrip.tsx`, od 2026-07-08) – 4 klikatelné dlaždice (Doprava po ČR / Osobní odběr / Rychlá výroba / Bezpečná platba), každá vede na novou stránku `/jak-nakupovat` s podrobnostmi o kategoriích produktů, dopravě a osobním odběru, době výroby a platbě. Odkaz na tuto stránku je i v patičce (`Footer.tsx`).

Pod informačním pruhem je výpis produktů (nadpis „Skvosty, které můžete mít“, od 2026-07-12). Zobrazují se jen produkty, které mají `is_active = true` **a** `show_on_homepage = true`, řazené podle `tag_top` (produkty s nastaveným TOP pořadím první) a pak podle data vytvoření (nejnovější první) – na homepage není žádný ovládací prvek pro změnu řazení, ten je jen na stránkách kategorií a na `/vytvorit-arch` (viz níže). Pod výpisem je od 2026-07-12 textový rozcestník „Další unikáty naleznete v kategorii Známky | Kreativní archy | First day cover | Dárkové plakety“ – každá kategorie je odkaz na `/kategorie/{slug}` (resp. `/vytvorit-arch` pro kreativní archy), stejné 4 položky jako v hlavním menu. Titulek i rozcestník jsou volitelné props (`title`, `showCategoryLinks`) sdílené komponenty `ProductList.tsx` – na stránkách kategorií, kde se stejná komponenta znovupoužívá, se nezobrazují.

Pod výpisem produktů je od 2026-07-12 pruh recenzí (`ReviewStrip.tsx`, dřív byl nad výpisem) s nadpisem „Recenze spokojených zákazníků“ – 5 pevně zapsaných referencí zahraničních zákazníků (jméno, země, krátký text, foto, hodnocení vždy 5 hvězd). Na desktopu (`lg:` a výš) se roztáhnou na celou šířku vedle sebe, na mobilu a tabletu jsou vodorovně swipovatelné (scroll-snap, bez viditelného scrollbaru) – tap na kartu recenze (na rozdíl od tažení/swipe, to prohlížeč přirozeně odliší) otevře modál s celým textem recenze (`fullText`, delší verze krátké citace zobrazené na kartě).

Každý produkt může mít libovolnou kombinaci těchto štítků současně (zobrazí se vedle sebe, nejde o výběr jen jednoho, vizuálně jako ribbon zarovnaný k pravému okraji karty bez zaoblení na vnější straně):
- **„TOP {číslo}“** – pokud má vyplněné `tag_top` (1–6)
- **„novinka“** – pokud má `tag_new = true`
- **„poslední kusy“** – pokud má `tag_last_pieces = true`
- **„jen u nás“** – zobrazí se jen tehdy, když produkt nemá nastavený žádný z předchozích tří (je to fallback, ne čtvrtý kombinovatelný štítek)

Pokud má produkt vyplněnou `sale_price` (nižší než `price`), karta produktu zobrazí přeškrtnutou původní cenu vedle zlevněné – viz [sekce 5](05-administrace.md#3-záložka-produkty), jak se sleva nastavuje.

Karta produktu i karta šablony na `/vytvorit-arch` mají od 2026-07-08 kromě hover efektu (myš, desktop) i `active:` variantu stejného zvýraznění pro tap na dotykových zařízeních – dřív fungovalo jen kliknutí/proklik samotný (přes `<Link>` přes celou kartu), ale bez vizuální odezvy na mobilu.

Produkty patří do jedné z 5 kategorií (`znamky`, `znamkove-archy`, `kreativni-archy`, `fdc`, `plakety`) – enum `product_category` v DB, `znamkove-archy` doplněna 2026-07-10 (`docs/sql/006_products_category_znamkove_archy.sql`). Stránka `/kategorie/[slug]` zobrazuje všechny produkty dané kategorie, výchozí řazení stejné jako homepage (`tag_top`, pak nejnovější), a z menu je dostupná pro `znamky`, `fdc` a `plakety`. Nad výpisem má zákazník od 2026-07-12 select **„Doporučené / Cena: od nejnižší / od nejvyšší / Název: A–Z / Nejprodávanější“** – první tři možnosti řadí podle `price`/`sale_price` (`getEffectivePrice`) resp. `name`, poslední podle nového sloupce `products.sold_count` (viz [sekce 3](03-databaze.md)); řadí se vždy nad už načteným polem produktů (client-side), ne novým dotazem do Supabase. Titulek a perex kategorie jsou od 2026-07-08 na střed a bez vysvětlujícího videa.

**`/kategorie/kreativni-archy` už nemá vlastní obsah** (od 2026-07-12) – dřív to byla speciální dvousloupcová větev s videem, kterou nešlo dostat jinak než přes breadcrumb na detailu produktu kreativního archu (v menu na ni nikdy nevedl odkaz, viz níže). URL dál existuje a funguje, ale rovnou přesměruje (`router.replace`) na `/vytvorit-arch`, což je skutečný vstupní bod pro kreativní archy. Breadcrumb na detailu produktu kategorie `kreativni-archy` (`produkt/[id]/page.tsx`) teď taky vede rovnou na `/vytvorit-arch` místo na tuto mrtvou stránku.

**Důvěryhodnostní tagy (`TrustBadges.tsx`, od 2026-07-12):** dřív žily v Hero sekci na homepage, teď se zobrazují ve stejném řádku jako select řazení – na stránkách kategorií i na `/vytvorit-arch` (vlevo od selectu na desktopu, oba prvky na střed pod sebou na mobilu). Dva tagy: „X návštěvníků právě vytváří kreativní arch“ (proklikává vždy na `/vytvorit-arch`; číslo návštěvníků náhodně kolísá v rozmezí 5–12, mění se každých 6 s – aby nevznikl hydration mismatch, první vykreslení je vždy 5 a náhodná hodnota se dosadí až po mountu na klientovi) a „Již 1 247+ spokojených zákazníků“ (5 hvězdiček).

**`znamkove-archy` (od 2026-07-10):** vlastní volba v adminu při zakládání produktu, bez odkazu v menu (v menu je jen „Známky“). Na eshopu se vypisuje společně s kategorií `znamky` – `/kategorie/[slug]/page.tsx` má pro slugy `znamky` a `znamkove-archy` mapování na skupinu `['znamky', 'znamkove-archy']` a produkty načítá přes `.in('category', ...)`, takže **obě URL** (`/kategorie/znamky` i `/kategorie/znamkove-archy`) zobrazují stejný společný výpis (titulek/perex se liší podle toho, na které URL zákazník je). Breadcrumb na kartě/detailu produktu (`ProductCard.tsx`, `produkt/[id]/page.tsx`) odkazuje na `/kategorie/{product.category}` beze změny – u produktu s kategorií `znamkove-archy` tedy vede na `/kategorie/znamkove-archy`, což zobrazí tentýž společný výpis.

Kliknutím na produkt se zákazník dostane na detail (`/produkt/[id]`): hlavní obrázek + galerie, název, cena (se stejnou logikou slevy jako na kartě), technické parametry (katalogové číslo, datum vydání, rozměry, designér, rytec…) a popis v rozbalovacích sekcích, plus 3 související produkty na konci stránky (ty sleva zohledňují také). Tlačítkem „Do košíku“ se produkt přidá do košíku přímo z detailu i z karty produktu na výpisu – do košíku jde vždy aktuální efektivní cena (zlevněná, pokud je nastavená).

Od 2026-07-11 podporuje **detailní popis** (`detailed_description`) základní formátování – admin může v poli psát rovnou HTML tagy `<h3>`, `<h4>`, `<strong>`, `<ul>`/`<ol>`/`<li>`, `<p>`, `<br>` (nápověda přímo ve formuláři, viz [sekce 5](05-administrace.md#3-záložka-produkty)). Na frontendu se sanitizuje přes `isomorphic-dompurify` (`src/lib/sanitize.ts`) až při vykreslení – ostatní tagy se tiše odstraní. **Krátký popis** (perex na kartě produktu, `short_description`) formátování nepodporuje a zůstává čistý text, protože je ořezaný přes `line-clamp-3` a nadpisy/seznamy by se tam vizuálně rozpadly.

**Výjimka pro kategorii `kreativni-archy`:** karta produktu i detail místo „Do košíku“ zobrazují tlačítko **„Začít tvořit“** (ikona štětce) – klik vede rovnou do editoru (`/vytvorit-arch?productId={id}`), kde se podle `productId` (mapování na `TEMPLATES` v `src/lib/editorConfig.ts`) automaticky přeskočí výběr šablony a otevře se editor s příslušnou šablonou předvyplněnou, viz [sekce 3](#3-editor-kreativní-archy). U těchto produktů se v Parametrech zobrazují jen Kategorie, Katalogové číslo, Rozměr a Hmotnost (technické parametry specifické pro známky – datum vydání, designér, rytec – dávají smysl jen u kategorie `znamky`, u archů se skrývají). Titulek popisové sekce je u všech kategorií „Detailní popis“ (dřív „Detailní popis známky“).

Košík je udržován v `CartContext` a ukládá se do `localStorage` (klíč `razitka-cart`), takže zákazníkovi zůstane i po zavření prohlížeče.

## 2. Košík

Proces objednávky (`/kosik`) má 3 kroky (Stepper):

1. **Košík** – výpis položek (produkty i vlastní archy), úprava množství, odstranění položky
2. **Doprava a platba** – výběr dopravy (Osobní odběr Praha zdarma / Česká republika 40–120 Kč podle váhy / Mezinárodní doprava 150–300 Kč) a platby (Online kartou přes Stripe / Bankovní převod)
3. **Fakturační a doručovací údaje** – kontaktní a fakturační údaje, volitelně firemní údaje (IČO, DIČ), volitelně odlišná doručovací adresa, poznámka k objednávce

Vedle kroků je po celou dobu vidět souhrn objednávky (mezisoučet, doprava, celková cena) a pole pro **slevový kód** (mezi mezisoučtem a dopravou). Kód se ověřuje přes RPC funkci `validate_discount_code` (nikdy se nečte přímo z tabulky `discount_codes`, viz [sekce 3](03-databaze.md)), po úspěšném uplatnění se zobrazí jako odstranitelný štítek a sleva se odečte z mezisoučtu (nepočítá se z dopravy). Slevu spravuje admin v dashboardu, viz [sekce 5](05-administrace.md#4-záložka-slevové-kódy).

Po odeslání formuláře se zavolá `/api/create-order`, který znovu ověří ceny i dostupnost položek proti databázi (nikdy nevěří cenám z prohlížeče) a vytvoří objednávku se stavem `Nová`. Přepočet ceny počítá i se slevou (`sale_price`, viz `src/lib/pricing.ts`) i s případným slevovým kódem, který se revaliduje znovu server-side (klientský stav se nepovažuje za platný) – i kdyby klient poslal jinou cenu nebo kód mezitím expiroval, server vždy dosadí platnou cenu z DB. Dál se liší podle zvolené platby:
- **Platba kartou** – otevře se modální okno se Stripe platebním formulářem, po úspěšné platbě přesměruje na `/dekujeme`
- **Bankovní převod** – přesměruje na `/dekujeme` okamžitě, platební údaje zákazník dostane e-mailem

Stránka „Děkujeme“ zobrazí číslo objednávky, vyčistí košík a zákazníkovi mezitím přijde potvrzovací e-mail s rekapitulací objednávky.

## 3. Editor (Kreativní archy)

Na `/vytvorit-arch` si zákazník nejprve vybere jednu z 5 šablon archu (každá má jiný motiv, počet fotek, náhled a cenu). Titulek „Vyberte si šablonu“, perex a mezery jsou od 2026-07-12 vizuálně sjednocené se stránkou kategorie (stejné CSS třídy pro nadpis/perex/rozestupy), a nad výpisem šablon je stejný select řazení i tagy `TrustBadges` jako u kategorií (viz [sekce 1](#1-homepage)) – řazení „Cena“/„Nejprodávanější“ se dopočítává nad `TEMPLATES` z `editorConfig.ts` spojenými s cenami/`sold_count` dotaženými ze Supabase. Cena karty se dotahuje ze Supabase podle `productId` šablony (`TEMPLATES` v `src/lib/editorConfig.ts`, 1:1 namapované na produkty kategorie `kreativni-archy`) a řídí se stejnou logikou slevy jako zbytek e-shopu (`src/lib/pricing.ts`). Klik kamkoliv na kartu šablony (mimo tlačítko) vede na detail odpovídajícího produktu (`/produkt/{productId}`); tlačítko „Vybrat šablonu“ naopak rovnou otevře canvas editor – samostatný textový odkaz „Detail šablony“ na kartě už není, jeho roli převzala celá karta.

Pokud zákazník přijde z karty/detailu produktu kategorie `kreativni-archy` (tlačítko „Začít tvořit“, viz [sekce 1](#1-homepage)), stránka přečte `productId` z URL (`?productId=...`), najde odpovídající šablonu a rovnou přeskočí na canvas editor – krok výběru šablony se v tomto případě vůbec nezobrazí.

V editoru zákazník:
- nahrává fotky do jednotlivých fotoslotů (klik na prázdný slot otevře výběr souboru), může je v rámci slotu posouvat a zvětšovat/zmenšovat
- vyplňuje jeden textový slot – má k dispozici zarovnání (vlevo/na střed/vpravo), výběr ze 4 fontů (moderní = Poppins, elegantní = Playfair Display, psací = Dancing Script, retro = Righteous, viz `src/components/Editor/editorFonts.ts`), velikost textu, výběr barvy a volitelný stín textu. Fonty se musí natahovat přes `next/font/google` (s `variable`, ne `className` – jinak přebijí dědičností výchozí Poppins v celém editoru) – přímý `@import url()` na Google Fonts CDN v `globals.css` se v tomto Turbopack buildu tiše nepropíše do výsledného CSS a font by nefungoval bez jakékoli chybové hlášky (opraveno 2026-07-11, dřív reálně fungoval jen Poppins).

Mobilní zobrazení má jiné ovládání než desktop – prochází se sloty postupně (mini-mapa nahoře, šipky nahoru/dolů) s vysouvacím panelem pro textové úpravy. Tato mobilní část je hotová a uzamčená, úpravy se dělají jen na desktopové verzi (výjimkou jsou cílené opravy chyb na explicitní žádost – např. 2026-07-08 oprava ořezané palety barev (`ColorPickerInput.tsx`): paleta se nadále otevírá nahoru jako dřív, ale její výška se při otevření dynamicky dopočítá z reálně dostupného místa nad tlačítkem, takže se na mobilu vejde celá).

Po dokončení (tlačítko „Dokončit“) se z plátna vygenerují **dva** obrázky a oba se nahrají do Vercel Blob:
- **Náhled** (`preview_url`) – s obrázkem šablony na pozadí, zmenšený na 1080 px šířky. Slouží jen k zobrazení (např. v adminu, e-mailu).
- **Arch pro tisk** (`print_url`) – v plném rozlišení 1:1 vůči originální šabloně (4130×2550 px), **bez** obrázku šablony na pozadí – na bílém plátně jsou jen zákazníkovy fotky a jeho text. Důvod: fyzický arch je předtištěný, dotiskují se na něj jen fotky a text z prázdných slotů.

Záznam v tabulce `custom_stamps` ukládá obě URL zvlášť. Hotový arch se automaticky vloží do košíku v množství 1 ks (množství lze případně upravit až v košíku) a zákazník vidí potvrzovací obrazovku s možností vytvořit další arch nebo přejít do košíku.
