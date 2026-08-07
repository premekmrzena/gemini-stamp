Předmět: Re: My Creative Stamp (DVKS s.r.o.) — napojení na nAPI B2B-ZSK, potřebujeme doplnit informace k live provozu

Dobrý den,

děkujeme za odpovědi, posíláme zpět s tím, co jsme si mezitím ověřili vlastním testem proti demo prostředí — u bodů 2 a 3 se nám podařilo dojít k odpovědi vlastními silami, prosíme jen o potvrzení, že náš závěr sedí.

**ad 1) Podací místo**
Rozumíme, díky za `CustomerId L04150` a PSČ `25101`. Podací místo si založíme ručně přes webovou aplikaci Podání Online podle vašeho návodu (nový uživatel pod `dvks.1` → Nastavení > Odesílatel).

**ad 2) `idForm` pro tisk EMS štítku — vyřešeno**
Podle přiloženého `AS_formulare_POL.xlsx` a živého testu proti demu jsme potvrdili, že pro `EM` (EMS) funguje **`idForm 62`** ("AŠ - samostatný EMS zahraničí") — vrací `responseCode 1 OK` a vytiskne kombinovaný dokument označený "CN 23 EMS" (adresní štítek + celní prohlášení v jedné tabulce). `idForm 63` je stejný obsah v 2xA4 variantě. Díky za odkaz na přehled formulářů.

**ad 3) CN22 — potvrzujeme dílčí zjištění, prosíme o potvrzení**
Otestovali jsme `idForm 56`/`74`/`77` (CN22) proti demu na čerstvě vytvořené zásilce:
- U **`VL`** (Cenné psaní) fungují (`responseCode 1 OK`, vytiskne se samostatný formulář "CUSTOMS DECLARATION CN 22") — chápeme to tak, že u VL je CN22 skutečně **samostatný dokument navíc** k adresnímu štítku, tak jak jste psali.
- U **`EM`** (EMS) stejné `idForm` vrací `responseCode 100 INVALID_PARCEL_CODE`, konzistentně i na nové zásilce. Domníváme se, že je to v pořádku, protože u EMS je celní prohlášení (CN23) už součástí štítku z `idForm 62` (viz bod 2), takže žádný druhý dokument není potřeba.

Je tenhle závěr správně — u VL tisknout štítek (`idForm 20`) i CN22 (`idForm 56`) zvlášť, u EMS stačí jen `idForm 62`? Nebo je `INVALID_PARCEL_CODE` u EM+CN22 chyba na naší/vaší straně a mělo by to jít i tam?

**ad 4) Doplňující dotazy**
- Weight/customVal za položku — díky za potvrzení, sedí to s tím, jak to posíláme.
- Kód `44`/MRN — v pořádku, nespěchá, děkujeme že se doptáte u kolegyně.
- Posunuté číslování `resultParcelCustomsGoods[].sequence` — příklad z živého testu proti demu (2026-08-07):

Poslali jsme v requestu:
```json
"parcelCustomGoods": [
  { "sequence": 1, "customCont": "Printed picture", "quantity": 1, "weight": "0.100", "customVal": 100, "hsCode": "491191", "iso": "CZ" }
]
```

Odpověď vrátila:
```json
"resultParcelCustomsGoods": [
  {
    "sequence": 2,
    "customGoodsResponse": [
      { "responseCode": 422, "responseText": "INFO_CONTENT_CUSTOM_GOOD_WAS_MODIFIED" }
    ]
  }
]
```

Tedy `sequence` v odpovědi (`2`) neodpovídá tomu, co jsme poslali (`1`) — vždy o jedna výš, doprovázeno informativním `422 INFO_CONTENT_CUSTOM_GOOD_WAS_MODIFIED`. Podání samotné jinak proběhlo v pořádku (`responseCode 1 OK`, validní `parcelCode`).

Děkujeme, zbývá nám tedy hlavně potvrzení bodu 3 a založení podacího místa na naší straně — pak už bychom mohli přejít na live prostředí.

S pozdravem,
Přemysl Mrzena
DVKS s.r.o. — My Creative Stamp
