import { OrderStatus } from '@/types/database';

export const ORDER_STATUSES: { value: OrderStatus; group: 'neutral' | 'success' | 'danger' }[] = [
  { value: 'Nová', group: 'neutral' },
  { value: 'Připravujeme', group: 'neutral' },
  { value: 'Zaplaceno', group: 'neutral' },
  { value: 'Odesláno', group: 'neutral' },
  { value: 'K vyzvednutí', group: 'neutral' },
  { value: 'Doručeno', group: 'success' },
  { value: 'Vyzvednuto', group: 'success' },
  { value: 'Zrušeno', group: 'danger' },
  { value: 'Vráceno', group: 'danger' },
  { value: 'Vráceny peníze', group: 'success' },
  { value: 'Ztracená zásilka', group: 'danger' },
  { value: 'Reklamace', group: 'danger' },
  { value: 'Uzavřeno', group: 'success' },
];

export const INTERNATIONAL_COUNTRIES = [
  '',
  'Japonsko',
  'Jižní Korea',
  'Čína',
  'Vietnam',
  '---',
  'Austrálie',
  'Belgie',
  'Francie',
  'Itálie',
  'Kanada',
  'Německo',
  'Nizozemsko',
  'Polsko',
  'Rakousko',
  'Slovensko',
  'Spojené království',
  'Spojené státy (USA)',
  'Španělsko',
  'Švýcarsko',
];

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  desc: string;
};

// Zdroj: Přehled zemí a zahraničních služeb ČP (Prehled-zahranicnich-sluzeb_1_7_2026_CZ-EN.xlsx,
// list "CZ"), platnost k 1.7.2026 - viz [[project_ceska_posta_api]] v paměti. Cenné psaní do
// zahraničí NEJDE do všech zemí (např. Německo, USA, Švýcarsko, UK) - EMS jde prakticky všude,
// proto se v checkoutu nabízí obě varianty, jen ty, které pro danou zemi ČP skutečně provozuje.
export type CountryShippingInfo = {
  cenneDostupne: boolean;
  cenneSkupina?: 'evropska' | 'mimoevropska';
  emsSkupina: number;
};

export const COUNTRY_SHIPPING_INFO: Record<string, CountryShippingInfo> = {
  'Japonsko': { cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Jižní Korea': { cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Čína': { cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Vietnam': { cenneDostupne: false, emsSkupina: 105 },
  'Austrálie': { cenneDostupne: false, emsSkupina: 107 },
  'Belgie': { cenneDostupne: false, emsSkupina: 104 },
  'Francie': { cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Itálie': { cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Kanada': { cenneDostupne: false, emsSkupina: 105 },
  'Německo': { cenneDostupne: false, emsSkupina: 103 },
  'Nizozemsko': { cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Polsko': { cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 101 },
  'Rakousko': { cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Slovensko': { cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 100 },
  'Spojené království': { cenneDostupne: false, emsSkupina: 104 },
  'Spojené státy (USA)': { cenneDostupne: false, emsSkupina: 105 },
  'Španělsko': { cenneDostupne: false, emsSkupina: 104 },
  'Švýcarsko': { cenneDostupne: false, emsSkupina: 102 },
};

// EMS - do zahraničí, ceník ČP platný od 1.7.2026, sloupec "s DPH" - použit vždy, i pro země
// mimo EU kde je služba jinak od DPH osvobozená (rozhodnuto vědomě kvůli jednoduchosti, viz
// [[project_ceska_posta_api]]). [hmotnost do gramů, cena Kč], seřazeno vzestupně dle hmotnosti.
const EMS_PRICE_TABLE: Record<number, [number, number][]> = {
  100: [[500, 278], [1000, 315], [2000, 375], [3000, 381], [4000, 387], [5000, 393], [6000, 399], [7000, 405], [8000, 411], [9000, 417], [10000, 423], [15000, 454], [20000, 484], [25000, 514], [30000, 544]],
  101: [[500, 278], [1000, 387], [2000, 411], [3000, 436], [4000, 460], [5000, 484], [6000, 508], [7000, 532], [8000, 557], [9000, 581], [10000, 605], [15000, 726], [20000, 847]],
  102: [[500, 726], [1000, 786], [2000, 847], [3000, 907], [4000, 968], [5000, 1028], [6000, 1089], [7000, 1149], [8000, 1210], [9000, 1270], [10000, 1331], [15000, 1633], [20000, 1936], [25000, 2238], [30000, 2541]],
  103: [[500, 847], [1000, 907], [2000, 968], [3000, 1028], [4000, 1089], [5000, 1149], [6000, 1198], [7000, 1246], [8000, 1295], [9000, 1343], [10000, 1391], [15000, 1633], [20000, 1875], [25000, 2117], [30000, 2359]],
  104: [[500, 847], [1000, 968], [2000, 1089], [3000, 1210], [4000, 1331], [5000, 1452], [6000, 1573], [7000, 1694], [8000, 1815], [9000, 1936], [10000, 2057], [15000, 2662], [20000, 3418], [25000, 4235], [30000, 5142]],
  105: [[500, 1089], [1000, 1210], [2000, 1452], [3000, 1694], [4000, 1936], [5000, 2178], [6000, 2420], [7000, 2662], [8000, 2904], [9000, 3146], [10000, 3388], [15000, 4598], [20000, 5808], [25000, 7018], [30000, 8228]],
  106: [[500, 1210], [1000, 1331], [2000, 1694], [3000, 2057], [4000, 2420], [5000, 2783], [6000, 3146], [7000, 3509], [8000, 3872], [9000, 4235], [10000, 4598], [15000, 6413], [20000, 8228], [25000, 10043], [30000, 11858]],
  107: [[500, 1331], [1000, 1452], [2000, 1936], [3000, 2420], [4000, 2904], [5000, 3388], [6000, 3872], [7000, 4356], [8000, 4840], [9000, 5324], [10000, 5808], [15000, 8228], [20000, 10648], [25000, 13067], [30000, 15487]],
};

function getEmsPrice(emsSkupina: number, weightGrams: number): number {
  const table = EMS_PRICE_TABLE[emsSkupina];
  const tier = table.find(([maxWeight]) => weightGrams <= maxWeight);
  return tier ? tier[1] : table[table.length - 1][1];
}

// Cenné psaní do zahraničí nemá cenovou hladinu "Zákaznická karta" ani "Kredit" v ceníku -
// jen "Základní cena", ta se tedy použije. Podle skutečné skupiny země (evropská/do EU vs.
// mimoevropská) - viz [[project_ceska_posta_api]]. Příplatek 3,80 Kč za každý započatý
// tisíc Kč skutečné hodnoty objednávky (žádné stanovené minimum udané ceny).
function getCennePsaniPrice(cenneSkupina: 'evropska' | 'mimoevropska', weightGrams: number, orderValueCzk: number): number {
  const table: [number, number][] = cenneSkupina === 'evropska'
    ? [[50, 125], [100, 152], [250, 196], [500, 239], [1000, 340], [2000, 517]]
    : [[50, 131], [100, 160], [250, 220], [500, 295], [1000, 445], [2000, 711]];
  const tier = table.find(([maxWeight]) => weightGrams <= maxWeight);
  const basePrice = tier ? tier[1] : table[table.length - 1][1];
  const insuranceSurcharge = orderValueCzk > 0 ? Math.ceil(orderValueCzk / 1000) * 3.8 : 0;
  return basePrice + insuranceSurcharge;
}

// Skryté navýšení na pokrytí obalového materiálu - NIKDE se zákazníkovi neuvádí, projeví se
// jen jako vyšší konečná cena dopravy. Netýká se osobního odběru (zůstává zdarma).
const PACKAGING_MARKUP = 1.1;

// Ceny podle veřejného ceníku ČP platného od 1.7.2026 (viz [[project_ceska_posta_api]] v paměti),
// cenová hladina "Zákaznická karta ČP" (1-9 ks zásilek při jednorázovém podání) - bez smlouvy
// o úhradě Kreditem, kterou uživatel nemá.
//
// Vnitrostátně: Doporučené psaní, varianta Prioritní. Ceník jde jen do 2 kg - těžší objednávky
// by potřebovaly balíkový produkt (jiná API rodina, prefixParcelCode), zatím neřešeno.
//
// Mezinárodně: Cenné psaní a/nebo EMS podle toho, co ČP pro danou zemi provozuje
// (COUNTRY_SHIPPING_INFO) - dokud není země vybraná (country === ''), žádná mezinárodní
// možnost se nenabízí. EMS ceník žádnou kartu/kredit hladinu nerozlišuje (jen jedna cena).
export const getShippingOptions = (weightGrams: number, orderValueCzk: number = 0, country: string = ''): ShippingOption[] => {
  let czPrice = 109;
  if (weightGrams <= 50) czPrice = 87;
  else if (weightGrams <= 100) czPrice = 95;
  else if (weightGrams <= 500) czPrice = 97;
  else if (weightGrams <= 1000) czPrice = 103;

  const options: ShippingOption[] = [
    {
      id: 'osobni',
      name: 'Osobní odběr (Praha)',
      price: 0,
      desc: 'Svoji objednávku si můžete vyzvednout na adrese: Jindřišská 126/15, Praha 1',
    },
    {
      id: 'ceska',
      name: 'Česká republika',
      price: Math.round(czPrice * PACKAGING_MARKUP),
      desc: 'Doporučené psaní',
    },
  ];

  const countryInfo = COUNTRY_SHIPPING_INFO[country];
  if (countryInfo) {
    if (countryInfo.cenneDostupne && countryInfo.cenneSkupina) {
      options.push({
        id: 'cenne-psani',
        name: 'Cenné psaní do zahraničí',
        price: Math.round(getCennePsaniPrice(countryInfo.cenneSkupina, weightGrams, orderValueCzk) * PACKAGING_MARKUP),
        desc: 'Sledovatelná zásilka s pojištěním, nutné převzetí',
      });
    }
    options.push({
      id: 'ems',
      name: 'EMS',
      price: Math.round(getEmsPrice(countryInfo.emsSkupina, weightGrams) * PACKAGING_MARKUP),
      desc: 'Expresní doprava, nejrychlejší doručení do zahraničí, nutné převzetí',
    });
  }

  return options;
};

export type PaymentOption = {
  id: string;
  name: string;
  price: number;
  desc: string;
};

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'karta', name: 'Online platba kartou', price: 0, desc: 'Bezpečně přes Stripe' },
  { id: 'prevod', name: 'Bankovní převod', price: 0, desc: 'Pokyny obdržíte v e-mailu' },
];
