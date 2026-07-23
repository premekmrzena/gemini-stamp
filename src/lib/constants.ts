import { OrderStatus, ProductCategory } from '@/types/database';

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

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  desc: string;
};

// Zdroj: Přehled zemí a zahraničních služeb ČP (Prehled-zahranicnich-sluzeb_1_7_2026_CZ-EN.xlsx,
// list "CZ"), platnost k 1.7.2026 - viz [[project_ceska_posta_api]] v paměti. Obsahuje jen země,
// kam ČP aktuálně provozuje Cenné psaní A/NEBO EMS (145 z 227 zemí v přehledu - zbytek má
// listovní/EMS příjem "zastaven", tam žádnou z našich mezinárodních služeb nenabízíme).
// Cenné psaní ani EMS nejdou vždy obě do každé země (např. Cenné psaní nejde do Německa/USA/
// Švýcarska/UK, EMS zase někdy chybí u menších/vzdálenějších zemí) - proto oba kódy nepovinné.
export type CountryShippingInfo = {
  iso2: string;
  cenneDostupne: boolean;
  cenneSkupina?: 'evropska' | 'mimoevropska';
  emsSkupina?: number;
};

export const COUNTRY_SHIPPING_INFO: Record<string, CountryShippingInfo> = {
  'Albánie': { iso2: 'AL', cenneDostupne: false, emsSkupina: 104 },
  'Alžírsko': { iso2: 'DZ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 104 },
  'Angola': { iso2: 'AO', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Argentina': { iso2: 'AR', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 107 },
  'Arménie': { iso2: 'AM', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Austrálie': { iso2: 'AU', cenneDostupne: false, emsSkupina: 107 },
  'Bangladéš': { iso2: 'BD', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Barbados': { iso2: 'BB', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Belgie': { iso2: 'BE', cenneDostupne: false, emsSkupina: 104 },
  'Benin': { iso2: 'BJ', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Bhútán': { iso2: 'BT', cenneDostupne: false, emsSkupina: 106 },
  'Bosna a Hercegovina': { iso2: 'BA', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Brazílie': { iso2: 'BR', cenneDostupne: false, emsSkupina: 106 },
  'Bulharsko': { iso2: 'BG', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Burkina Faso': { iso2: 'BF', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Bělorusko': { iso2: 'BY', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Chile': { iso2: 'CL', cenneDostupne: false, emsSkupina: 105 },
  'Chorvatsko': { iso2: 'HR', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Dánsko': { iso2: 'DK', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Džibutsko': { iso2: 'DJ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Egypt': { iso2: 'EG', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Ekvádor': { iso2: 'EC', cenneDostupne: false, emsSkupina: 106 },
  'Estonsko': { iso2: 'EE', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Etiopie': { iso2: 'ET', cenneDostupne: false, emsSkupina: 105 },
  'Faerské ostrovy': { iso2: 'FO', cenneDostupne: true, cenneSkupina: 'evropska' },
  'Finsko': { iso2: 'FI', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Francie': { iso2: 'FR', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Francouzská Polynésie': { iso2: 'PF', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Gabon': { iso2: 'GA', cenneDostupne: false, emsSkupina: 105 },
  'Ghana': { iso2: 'GH', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Gruzie': { iso2: 'GE', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 104 },
  'Grónsko': { iso2: 'GL', cenneDostupne: true, cenneSkupina: 'evropska' },
  'Guinea': { iso2: 'GN', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Guinea-Bissau': { iso2: 'GW', cenneDostupne: false, emsSkupina: 105 },
  'Hongkong': { iso2: 'HK', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Indie': { iso2: 'IN', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Indonésie': { iso2: 'ID', cenneDostupne: false, emsSkupina: 105 },
  'Irsko': { iso2: 'IE', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Itálie': { iso2: 'IT', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Izrael': { iso2: 'IL', cenneDostupne: false, emsSkupina: 105 },
  'Jamajka': { iso2: 'JM', cenneDostupne: false, emsSkupina: 105 },
  'Japonsko': { iso2: 'JP', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Jižní Afrika': { iso2: 'ZA', cenneDostupne: false, emsSkupina: 105 },
  'Jordánsko': { iso2: 'JO', cenneDostupne: false, emsSkupina: 105 },
  'Kamerun': { iso2: 'CM', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Kanada': { iso2: 'CA', cenneDostupne: false, emsSkupina: 105 },
  'Kapverdy': { iso2: 'CV', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Katar': { iso2: 'QA', cenneDostupne: false, emsSkupina: 105 },
  'Kazachstán': { iso2: 'KZ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Keňa': { iso2: 'KE', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Kolumbie': { iso2: 'CO', cenneDostupne: false, emsSkupina: 105 },
  'Komory': { iso2: 'KM', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Korejská republika': { iso2: 'KR', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Kostarika': { iso2: 'CR', cenneDostupne: false, emsSkupina: 105 },
  'Kuba': { iso2: 'CU', cenneDostupne: false, emsSkupina: 107 },
  'Kuvajt': { iso2: 'KW', cenneDostupne: false, emsSkupina: 105 },
  'Kypr': { iso2: 'CY', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Kyrgyzstán': { iso2: 'KG', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Laos': { iso2: 'LA', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Libanon': { iso2: 'LB', cenneDostupne: false, emsSkupina: 104 },
  'Litva': { iso2: 'LT', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Lotyšsko': { iso2: 'LV', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Lucembursko': { iso2: 'LU', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Macao': { iso2: 'MO', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Madagaskar': { iso2: 'MG', cenneDostupne: false, emsSkupina: 105 },
  'Malajsie': { iso2: 'MY', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Maledivy': { iso2: 'MV', cenneDostupne: false, emsSkupina: 107 },
  'Mali': { iso2: 'ML', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Malta': { iso2: 'MT', cenneDostupne: false, emsSkupina: 104 },
  'Maroko': { iso2: 'MA', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Mauricius': { iso2: 'MU', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Maďarsko': { iso2: 'HU', cenneDostupne: false, emsSkupina: 104 },
  'Mexiko': { iso2: 'MX', cenneDostupne: false, emsSkupina: 105 },
  'Moldavsko': { iso2: 'MD', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Monako': { iso2: 'MC', cenneDostupne: false, emsSkupina: 104 },
  'Mongolsko': { iso2: 'MN', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Montserrat': { iso2: 'MS', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Mosambik': { iso2: 'MZ', cenneDostupne: false, emsSkupina: 107 },
  'Myanmar': { iso2: 'MM', cenneDostupne: false, emsSkupina: 105 },
  'Namibie': { iso2: 'NA', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Nauru': { iso2: 'NR', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Niger': { iso2: 'NE', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Nigérie': { iso2: 'NG', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Nikaragua': { iso2: 'NI', cenneDostupne: false, emsSkupina: 106 },
  'Niue': { iso2: 'NU', cenneDostupne: false, emsSkupina: 107 },
  'Nizozemsko': { iso2: 'NL', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Norsko': { iso2: 'NO', cenneDostupne: false, emsSkupina: 104 },
  'Nová Kaledonie': { iso2: 'NC', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Nový Zéland': { iso2: 'NZ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 107 },
  'Německo': { iso2: 'DE', cenneDostupne: false, emsSkupina: 103 },
  'Panama': { iso2: 'PA', cenneDostupne: false, emsSkupina: 107 },
  'Paraguay': { iso2: 'PY', cenneDostupne: false, emsSkupina: 106 },
  'Peru': { iso2: 'PE', cenneDostupne: false, emsSkupina: 106 },
  'Pobřeží slonoviny': { iso2: 'CI', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Polsko': { iso2: 'PL', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 101 },
  'Portoriko': { iso2: 'PR', cenneDostupne: false, emsSkupina: 106 },
  'Portugalsko': { iso2: 'PT', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Pákistán': { iso2: 'PK', cenneDostupne: false, emsSkupina: 104 },
  'Rakousko': { iso2: 'AT', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Rumunsko': { iso2: 'RO', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Rusko': { iso2: 'RU', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Rwanda': { iso2: 'RW', cenneDostupne: false, emsSkupina: 105 },
  'Salvador': { iso2: 'SV', cenneDostupne: false, emsSkupina: 106 },
  'San Marino': { iso2: 'SM', cenneDostupne: false, emsSkupina: 104 },
  'Saúdská Arábie': { iso2: 'SA', cenneDostupne: false, emsSkupina: 105 },
  'Senegal': { iso2: 'SN', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Severní Makedonie': { iso2: 'MK', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Seychely': { iso2: 'SC', cenneDostupne: false, emsSkupina: 107 },
  'Singapur': { iso2: 'SG', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Slovensko': { iso2: 'SK', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 100 },
  'Slovinsko': { iso2: 'SI', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Spojené arabské emiráty': { iso2: 'AE', cenneDostupne: false, emsSkupina: 104 },
  'Spojené státy americké': { iso2: 'US', cenneDostupne: false, emsSkupina: 105 },
  'Srbsko': { iso2: 'RS', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Svatý Martin (NL)': { iso2: 'SX', cenneDostupne: false, emsSkupina: 106 },
  'Svatý Vincenc a Grenadiny': { iso2: 'VC', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Svazijsko': { iso2: 'SZ', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Súdán': { iso2: 'SD', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Tanzanie': { iso2: 'TZ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Tchaj-wan': { iso2: 'TW', cenneDostupne: false, emsSkupina: 106 },
  'Thajsko': { iso2: 'TH', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Togo': { iso2: 'TG', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Tunisko': { iso2: 'TN', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Turecko': { iso2: 'TR', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Uganda': { iso2: 'UG', cenneDostupne: false, emsSkupina: 105 },
  'Ukrajina': { iso2: 'UA', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Uruguay': { iso2: 'UY', cenneDostupne: false, emsSkupina: 105 },
  'Uzbekistán': { iso2: 'UZ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Vatikán': { iso2: 'VA', cenneDostupne: true, cenneSkupina: 'evropska' },
  'Velká Británie': { iso2: 'GB', cenneDostupne: false, emsSkupina: 104 },
  'Venezuela': { iso2: 'VE', cenneDostupne: false, emsSkupina: 105 },
  'Vietnam': { iso2: 'VN', cenneDostupne: false, emsSkupina: 105 },
  'Wallis a Futuna': { iso2: 'WF', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Zambie': { iso2: 'ZM', cenneDostupne: true, cenneSkupina: 'mimoevropska' },
  'Zimbabwe': { iso2: 'ZW', cenneDostupne: false, emsSkupina: 105 },
  'Ázerbájdžán': { iso2: 'AZ', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Írán': { iso2: 'IR', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Čad': { iso2: 'TD', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Černá Hora': { iso2: 'ME', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 102 },
  'Čína': { iso2: 'CN', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 106 },
  'Řecko': { iso2: 'GR', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Španělsko': { iso2: 'ES', cenneDostupne: false, emsSkupina: 104 },
  'Šrí Lanka': { iso2: 'LK', cenneDostupne: true, cenneSkupina: 'mimoevropska', emsSkupina: 105 },
  'Švédsko': { iso2: 'SE', cenneDostupne: true, cenneSkupina: 'evropska', emsSkupina: 104 },
  'Švýcarsko': { iso2: 'CH', cenneDostupne: false, emsSkupina: 102 },
};

// '' = placeholder (zobrazuje se jako "Vybrat zemi"), zbytek abecedně dle českého lokále.
export const INTERNATIONAL_COUNTRIES = [
  '',
  ...Object.keys(COUNTRY_SHIPPING_INFO).sort((a, b) => a.localeCompare(b, 'cs')),
];

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
    if (countryInfo.emsSkupina) {
      options.push({
        id: 'ems',
        name: 'EMS',
        price: Math.round(getEmsPrice(countryInfo.emsSkupina, weightGrams) * PACKAGING_MARKUP),
        desc: 'Expresní doprava, nejrychlejší doručení do zahraničí, nutné převzetí',
      });
    }
  }

  return options;
};

// Nejnižší mezinárodní cena napříč VŠEMI podporovanými zeměmi pro danou váhu/hodnotu objednávky -
// orientační "od X Kč" než zákazník vybere konkrétní cílovou zemi (viz ShippingStep.tsx).
export const getMinInternationalPrice = (weightGrams: number, orderValueCzk: number = 0): number => {
  let min = Infinity;
  for (const info of Object.values(COUNTRY_SHIPPING_INFO)) {
    if (info.cenneDostupne && info.cenneSkupina) {
      min = Math.min(min, getCennePsaniPrice(info.cenneSkupina, weightGrams, orderValueCzk));
    }
    if (info.emsSkupina) {
      min = Math.min(min, getEmsPrice(info.emsSkupina, weightGrams));
    }
  }
  return Math.round(min * PACKAGING_MARKUP);
};

// Ověřeno živým dotazem na /customsContent (Česká pošta B2B-CIS, číselník celního obsahu).
// znamky/znamkove-archy: sběratelské známky, mimo EU záměrně jako neplatné poštovné v cílové zemi
// (ne cenina) - HS 9704, ne 4907 (to je pro aktuálně platné poštovní známky).
// kreativni-archy/fdc: tiskovina - HS 4911.91 "Tištěné obrazy". FDC obsahuje nalepenou známku,
// ale ta je nalepením znehodnocená a přestává být cenina, takže se řadí stejně jako kreativní archy.
// plakety: jediná shoda v číselníku ČP ("Plaketa").
const CUSTOMS_HS_CODE_BY_CATEGORY: Record<ProductCategory, string> = {
  znamky: '970400',
  'znamkove-archy': '970400',
  fdc: '491191',
  'kreativni-archy': '491191',
  plakety: '970300',
};

export const getCustomsHsCode = (category: ProductCategory): string => CUSTOMS_HS_CODE_BY_CATEGORY[category];

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
