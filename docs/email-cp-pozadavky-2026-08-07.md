Předmět: My Creative Stamp (DVKS s.r.o.) — napojení na nAPI B2B-ZSK, potřebujeme doplnit informace k live provozu

Dobrý den,

jsme e-shop My Creative Stamp (provozovatel DVKS s.r.o.) a máme s Českou poštou uzavřenou smlouvu na podávání zásilek přes API (nAPI B2B-ZSK). Napojení máme naprogramované a funkčně otestované proti demo prostředí, teď se chystáme na ostrý provoz. Řešili jsme to v uplynulých týdnech s kolegy z ČP, ale kontakt se mezitím změnil, proto shrnuji celou situaci od začátku.

Potřebujeme od vás doplnit/potvrdit několik věcí, než integraci spustíme naostro:

**1) Přístupové údaje k živému prostředí**
Pro live prostředí máme zatím jen ID smlouvy, API token a privátní klíč. K odesílání zásilek přes `/parcelService` ale potřebujeme ještě:
- Customer ID (zákaznické číslo)
- PSČ podacího místa
- Číslo podacího místa (location number)

Bez těchto tří údajů (musí být zadané všechny najednou) nám live prostředí vrací chybu.

**2) Tisk adresního štítku pro EMS zásilky (prefix `EM`)**
U zásilek typu Doporučené psaní (`RR`) a Cenné psaní (`VL`) se nám podařilo najít funkční `idForm` pro tisk štítku přes `/parcelPrinting` (konkrétně `idForm 20` a `idForm 103`). U EMS zásilek (prefix `EM`) jsme vyzkoušeli stejné hodnoty i řadu dalších (`100`–`103`) — vrací se chyba `378 INVALID_PREFIX_COMBINATION`. Jediná hodnota, která projde bez chyby, je `idForm 40`, ale vytiskne nesmyslný/poškozený dokument (chybí čárový kód, chybná adresa příjemce, jiná firma v hlavičce).

Potřebujeme: který `idForm` je správný pro tisk štítku k zásilce s prefixem `EM` (EMS)? Případně, pokud existuje, prosíme o odkaz na dokumentaci s mapováním prefix → idForm.

**3) Celní prohlášení u zásilek Cenné psaní / EMS do zahraničí (`VL`/`EM`) — CN22**
Naše zásilky typu Cenné psaní a EMS do zahraničí dnes posílají celní údaje elektronicky přímo v rámci `/parcelService` (pole `parcelCustomsDeclaration` — kategorie zboží, celní hodnota, obsah, HS kód). Zkoušeli jsme také samostatné endpointy `/letterWithCN22*`, ty ale odmítají odkaz na již vytvořenou zásilku a chtějí kompletně novou adresu/podání — vypadá to na oddělený produkt, ne na doplněk k naší zásilce.

Potřebujeme potvrdit: stačí naší zásilce (`VL`/`EM` s vyplněným `parcelCustomsDeclaration`) elektronické celní prohlášení tak, jak ho posíláme, nebo je pro doručení do zahraničí potřeba ještě fyzická CN22 nálepka / jiný dodatečný úkon z naší strany? Je to pro nás důležité kvůli riziku, že by zaplacená zásilka mohla uváznout na celnici cílové země.

**4) Doplňující technické dotazy (nižší priorita, může zodpovědět API specialista)**
- V poli `parcelCustomGoods[]` (celní deklarace) — hodnota `weight`/`customVal` má být za kus zboží, nebo za celou položku (kus × počet)? My teď posíláme za celou položku.
- U zásilek s vyšší celní hodnotou je v číselníku služeb kód `44` „Zboží s VDD" (vyžaduje MRN kód) — je tenhle kód potřeba přidávat vždy nad určitou hodnotu zásilky, nebo jen v konkrétních případech? Prosíme o upřesnění prahu/podmínky.
- V odpovědi na podání zásilky nám pole `resultParcelCustomsGoods[].sequence` vrací jinou hodnotu, než jakou jsme poslali (posunuté o 1) — je to očekávané chování?

Budeme moc rádi za odpověď k bodům 1–3, ideálně i s kontaktem, na kterém můžeme věci ověřovat průběžně (blížíme se ostrému spuštění e-shopu). Body 4 nespěchají, ale budeme rádi za jakoukoliv odpověď.

Předem děkujeme a jsme k dispozici na telefonu/e-mailu k upřesnění čehokoliv z výše uvedeného.

S pozdravem,
Přemysl Mrzena
DVKS s.r.o. — My Creative Stamp
