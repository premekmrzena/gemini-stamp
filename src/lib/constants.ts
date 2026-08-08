import { OrderStatus, ProductCategory } from '@/types/database';

// Pořadí odpovídá skutečnému toku objednávky (viz PICKUP_FLOW/SHIPPING_FLOW v adminu) -
// nejdřív společná část, pak větev doprava/osobní odběr, na konci mimořádné/terminální stavy.
// 'Nová' už appka nikdy sama nezapisuje (od 2026-07-26 nahrazeno "Čekáme na platbu" hned
// při vytvoření objednávky) - v seznamu zůstává jen kvůli historickým objednávkám, v adminu
// se z reálného stavu přeměnila na dočasný badge "čerstvá objednávka" (viz isFreshOrder).
export const ORDER_STATUSES: { value: OrderStatus; group: 'neutral' | 'success' | 'danger' }[] = [
  { value: 'Nová', group: 'neutral' },
  { value: 'Čekáme na platbu', group: 'neutral' },
  { value: 'Zaplaceno', group: 'neutral' },
  { value: 'Připravujeme', group: 'neutral' },
  { value: 'Odesláno', group: 'neutral' },
  { value: 'Doručeno', group: 'success' },
  { value: 'K vyzvednutí', group: 'neutral' },
  { value: 'Vyzvednuto', group: 'success' },
  { value: 'Uzavřeno', group: 'success' },
  { value: 'Zrušeno', group: 'danger' },
  { value: 'Vráceno', group: 'danger' },
  { value: 'Vráceny peníze', group: 'success' },
  { value: 'Reklamace', group: 'danger' },
  { value: 'Ztracená zásilka', group: 'danger' },
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

// Telefonní předvolby - vygenerováno skriptem z libphonenumber-js metadat (ne ručně opsáno,
// viz [[feedback_generate_large_datasets_mechanically]]) pro všechny země z COUNTRY_SHIPPING_INFO
// + tuzemsko. Víc zemí sdílí stejnou předvolbu (např. +1 USA/Kanada/Karibik) - v selectu je proto
// jen jedna položka na předvolbu, se "hezčím" zástupným názvem země (viz PRIORITY_COUNTRY_NAMES
// v generujícím skriptu). Řazeno abecedně dle českého názvu, stejně jako INTERNATIONAL_COUNTRIES.
export const PHONE_DIAL_CODES: { dial: string; iso2: string; name: string }[] = [
  { dial: '+355', iso2: 'AL', name: 'Albánie' },
  { dial: '+213', iso2: 'DZ', name: 'Alžírsko' },
  { dial: '+244', iso2: 'AO', name: 'Angola' },
  { dial: '+54', iso2: 'AR', name: 'Argentina' },
  { dial: '+374', iso2: 'AM', name: 'Arménie' },
  { dial: '+61', iso2: 'AU', name: 'Austrálie' },
  { dial: '+994', iso2: 'AZ', name: 'Ázerbájdžán' },
  { dial: '+880', iso2: 'BD', name: 'Bangladéš' },
  { dial: '+32', iso2: 'BE', name: 'Belgie' },
  { dial: '+375', iso2: 'BY', name: 'Bělorusko' },
  { dial: '+229', iso2: 'BJ', name: 'Benin' },
  { dial: '+975', iso2: 'BT', name: 'Bhútán' },
  { dial: '+387', iso2: 'BA', name: 'Bosna a Hercegovina' },
  { dial: '+55', iso2: 'BR', name: 'Brazílie' },
  { dial: '+359', iso2: 'BG', name: 'Bulharsko' },
  { dial: '+226', iso2: 'BF', name: 'Burkina Faso' },
  { dial: '+235', iso2: 'TD', name: 'Čad' },
  { dial: '+382', iso2: 'ME', name: 'Černá Hora' },
  { dial: '+420', iso2: 'CZ', name: 'Česká republika' },
  { dial: '+86', iso2: 'CN', name: 'Čína' },
  { dial: '+45', iso2: 'DK', name: 'Dánsko' },
  { dial: '+253', iso2: 'DJ', name: 'Džibutsko' },
  { dial: '+20', iso2: 'EG', name: 'Egypt' },
  { dial: '+593', iso2: 'EC', name: 'Ekvádor' },
  { dial: '+372', iso2: 'EE', name: 'Estonsko' },
  { dial: '+251', iso2: 'ET', name: 'Etiopie' },
  { dial: '+298', iso2: 'FO', name: 'Faerské ostrovy' },
  { dial: '+358', iso2: 'FI', name: 'Finsko' },
  { dial: '+33', iso2: 'FR', name: 'Francie' },
  { dial: '+689', iso2: 'PF', name: 'Francouzská Polynésie' },
  { dial: '+241', iso2: 'GA', name: 'Gabon' },
  { dial: '+233', iso2: 'GH', name: 'Ghana' },
  { dial: '+299', iso2: 'GL', name: 'Grónsko' },
  { dial: '+995', iso2: 'GE', name: 'Gruzie' },
  { dial: '+224', iso2: 'GN', name: 'Guinea' },
  { dial: '+245', iso2: 'GW', name: 'Guinea-Bissau' },
  { dial: '+852', iso2: 'HK', name: 'Hongkong' },
  { dial: '+56', iso2: 'CL', name: 'Chile' },
  { dial: '+385', iso2: 'HR', name: 'Chorvatsko' },
  { dial: '+91', iso2: 'IN', name: 'Indie' },
  { dial: '+62', iso2: 'ID', name: 'Indonésie' },
  { dial: '+98', iso2: 'IR', name: 'Írán' },
  { dial: '+353', iso2: 'IE', name: 'Irsko' },
  { dial: '+39', iso2: 'IT', name: 'Itálie' },
  { dial: '+972', iso2: 'IL', name: 'Izrael' },
  { dial: '+81', iso2: 'JP', name: 'Japonsko' },
  { dial: '+27', iso2: 'ZA', name: 'Jižní Afrika' },
  { dial: '+962', iso2: 'JO', name: 'Jordánsko' },
  { dial: '+237', iso2: 'CM', name: 'Kamerun' },
  { dial: '+238', iso2: 'CV', name: 'Kapverdy' },
  { dial: '+974', iso2: 'QA', name: 'Katar' },
  { dial: '+254', iso2: 'KE', name: 'Keňa' },
  { dial: '+57', iso2: 'CO', name: 'Kolumbie' },
  { dial: '+269', iso2: 'KM', name: 'Komory' },
  { dial: '+82', iso2: 'KR', name: 'Korejská republika' },
  { dial: '+506', iso2: 'CR', name: 'Kostarika' },
  { dial: '+53', iso2: 'CU', name: 'Kuba' },
  { dial: '+965', iso2: 'KW', name: 'Kuvajt' },
  { dial: '+357', iso2: 'CY', name: 'Kypr' },
  { dial: '+996', iso2: 'KG', name: 'Kyrgyzstán' },
  { dial: '+856', iso2: 'LA', name: 'Laos' },
  { dial: '+961', iso2: 'LB', name: 'Libanon' },
  { dial: '+370', iso2: 'LT', name: 'Litva' },
  { dial: '+371', iso2: 'LV', name: 'Lotyšsko' },
  { dial: '+352', iso2: 'LU', name: 'Lucembursko' },
  { dial: '+853', iso2: 'MO', name: 'Macao' },
  { dial: '+261', iso2: 'MG', name: 'Madagaskar' },
  { dial: '+36', iso2: 'HU', name: 'Maďarsko' },
  { dial: '+60', iso2: 'MY', name: 'Malajsie' },
  { dial: '+960', iso2: 'MV', name: 'Maledivy' },
  { dial: '+223', iso2: 'ML', name: 'Mali' },
  { dial: '+356', iso2: 'MT', name: 'Malta' },
  { dial: '+212', iso2: 'MA', name: 'Maroko' },
  { dial: '+230', iso2: 'MU', name: 'Mauricius' },
  { dial: '+52', iso2: 'MX', name: 'Mexiko' },
  { dial: '+373', iso2: 'MD', name: 'Moldavsko' },
  { dial: '+377', iso2: 'MC', name: 'Monako' },
  { dial: '+976', iso2: 'MN', name: 'Mongolsko' },
  { dial: '+258', iso2: 'MZ', name: 'Mosambik' },
  { dial: '+95', iso2: 'MM', name: 'Myanmar' },
  { dial: '+264', iso2: 'NA', name: 'Namibie' },
  { dial: '+674', iso2: 'NR', name: 'Nauru' },
  { dial: '+49', iso2: 'DE', name: 'Německo' },
  { dial: '+227', iso2: 'NE', name: 'Niger' },
  { dial: '+234', iso2: 'NG', name: 'Nigérie' },
  { dial: '+505', iso2: 'NI', name: 'Nikaragua' },
  { dial: '+683', iso2: 'NU', name: 'Niue' },
  { dial: '+31', iso2: 'NL', name: 'Nizozemsko' },
  { dial: '+47', iso2: 'NO', name: 'Norsko' },
  { dial: '+687', iso2: 'NC', name: 'Nová Kaledonie' },
  { dial: '+64', iso2: 'NZ', name: 'Nový Zéland' },
  { dial: '+92', iso2: 'PK', name: 'Pákistán' },
  { dial: '+507', iso2: 'PA', name: 'Panama' },
  { dial: '+595', iso2: 'PY', name: 'Paraguay' },
  { dial: '+51', iso2: 'PE', name: 'Peru' },
  { dial: '+225', iso2: 'CI', name: 'Pobřeží slonoviny' },
  { dial: '+48', iso2: 'PL', name: 'Polsko' },
  { dial: '+351', iso2: 'PT', name: 'Portugalsko' },
  { dial: '+43', iso2: 'AT', name: 'Rakousko' },
  { dial: '+40', iso2: 'RO', name: 'Rumunsko' },
  { dial: '+7', iso2: 'RU', name: 'Rusko' },
  { dial: '+250', iso2: 'RW', name: 'Rwanda' },
  { dial: '+30', iso2: 'GR', name: 'Řecko' },
  { dial: '+503', iso2: 'SV', name: 'Salvador' },
  { dial: '+378', iso2: 'SM', name: 'San Marino' },
  { dial: '+966', iso2: 'SA', name: 'Saúdská Arábie' },
  { dial: '+221', iso2: 'SN', name: 'Senegal' },
  { dial: '+389', iso2: 'MK', name: 'Severní Makedonie' },
  { dial: '+248', iso2: 'SC', name: 'Seychely' },
  { dial: '+65', iso2: 'SG', name: 'Singapur' },
  { dial: '+421', iso2: 'SK', name: 'Slovensko' },
  { dial: '+386', iso2: 'SI', name: 'Slovinsko' },
  { dial: '+971', iso2: 'AE', name: 'Spojené arabské emiráty' },
  { dial: '+1', iso2: 'US', name: 'Spojené státy americké' },
  { dial: '+381', iso2: 'RS', name: 'Srbsko' },
  { dial: '+249', iso2: 'SD', name: 'Súdán' },
  { dial: '+268', iso2: 'SZ', name: 'Svazijsko' },
  { dial: '+34', iso2: 'ES', name: 'Španělsko' },
  { dial: '+94', iso2: 'LK', name: 'Šrí Lanka' },
  { dial: '+46', iso2: 'SE', name: 'Švédsko' },
  { dial: '+41', iso2: 'CH', name: 'Švýcarsko' },
  { dial: '+255', iso2: 'TZ', name: 'Tanzanie' },
  { dial: '+66', iso2: 'TH', name: 'Thajsko' },
  { dial: '+886', iso2: 'TW', name: 'Tchaj-wan' },
  { dial: '+228', iso2: 'TG', name: 'Togo' },
  { dial: '+216', iso2: 'TN', name: 'Tunisko' },
  { dial: '+90', iso2: 'TR', name: 'Turecko' },
  { dial: '+256', iso2: 'UG', name: 'Uganda' },
  { dial: '+380', iso2: 'UA', name: 'Ukrajina' },
  { dial: '+598', iso2: 'UY', name: 'Uruguay' },
  { dial: '+998', iso2: 'UZ', name: 'Uzbekistán' },
  { dial: '+44', iso2: 'GB', name: 'Velká Británie' },
  { dial: '+58', iso2: 'VE', name: 'Venezuela' },
  { dial: '+84', iso2: 'VN', name: 'Vietnam' },
  { dial: '+681', iso2: 'WF', name: 'Wallis a Futuna' },
  { dial: '+260', iso2: 'ZM', name: 'Zambie' },
  { dial: '+263', iso2: 'ZW', name: 'Zimbabwe' },
];

// Název země (klíče COUNTRY_SHIPPING_INFO + tuzemsko) -> předvolba, pro předvyplnění PhoneField
// podle už vybrané země v adrese (viz AddressForm.tsx). Víc zemí může mít stejnou předvolbu
// (Kanada i USA +1) - na rozdíl od PHONE_DIAL_CODES tu proto zůstávají všechny, ne jen unikáty.
export const DIAL_CODE_BY_COUNTRY: Record<string, string> = {
  'Albánie': '+355',
  'Alžírsko': '+213',
  'Angola': '+244',
  'Argentina': '+54',
  'Arménie': '+374',
  'Austrálie': '+61',
  'Ázerbájdžán': '+994',
  'Bangladéš': '+880',
  'Barbados': '+1',
  'Belgie': '+32',
  'Bělorusko': '+375',
  'Benin': '+229',
  'Bhútán': '+975',
  'Bosna a Hercegovina': '+387',
  'Brazílie': '+55',
  'Bulharsko': '+359',
  'Burkina Faso': '+226',
  'Čad': '+235',
  'Černá Hora': '+382',
  'Česká republika': '+420',
  'Čína': '+86',
  'Dánsko': '+45',
  'Džibutsko': '+253',
  'Egypt': '+20',
  'Ekvádor': '+593',
  'Estonsko': '+372',
  'Etiopie': '+251',
  'Faerské ostrovy': '+298',
  'Finsko': '+358',
  'Francie': '+33',
  'Francouzská Polynésie': '+689',
  'Gabon': '+241',
  'Ghana': '+233',
  'Grónsko': '+299',
  'Gruzie': '+995',
  'Guinea': '+224',
  'Guinea-Bissau': '+245',
  'Hongkong': '+852',
  'Chile': '+56',
  'Chorvatsko': '+385',
  'Indie': '+91',
  'Indonésie': '+62',
  'Írán': '+98',
  'Irsko': '+353',
  'Itálie': '+39',
  'Izrael': '+972',
  'Jamajka': '+1',
  'Japonsko': '+81',
  'Jižní Afrika': '+27',
  'Jordánsko': '+962',
  'Kamerun': '+237',
  'Kanada': '+1',
  'Kapverdy': '+238',
  'Katar': '+974',
  'Kazachstán': '+7',
  'Keňa': '+254',
  'Kolumbie': '+57',
  'Komory': '+269',
  'Korejská republika': '+82',
  'Kostarika': '+506',
  'Kuba': '+53',
  'Kuvajt': '+965',
  'Kypr': '+357',
  'Kyrgyzstán': '+996',
  'Laos': '+856',
  'Libanon': '+961',
  'Litva': '+370',
  'Lotyšsko': '+371',
  'Lucembursko': '+352',
  'Macao': '+853',
  'Madagaskar': '+261',
  'Maďarsko': '+36',
  'Malajsie': '+60',
  'Maledivy': '+960',
  'Mali': '+223',
  'Malta': '+356',
  'Maroko': '+212',
  'Mauricius': '+230',
  'Mexiko': '+52',
  'Moldavsko': '+373',
  'Monako': '+377',
  'Mongolsko': '+976',
  'Montserrat': '+1',
  'Mosambik': '+258',
  'Myanmar': '+95',
  'Namibie': '+264',
  'Nauru': '+674',
  'Německo': '+49',
  'Niger': '+227',
  'Nigérie': '+234',
  'Nikaragua': '+505',
  'Niue': '+683',
  'Nizozemsko': '+31',
  'Norsko': '+47',
  'Nová Kaledonie': '+687',
  'Nový Zéland': '+64',
  'Pákistán': '+92',
  'Panama': '+507',
  'Paraguay': '+595',
  'Peru': '+51',
  'Pobřeží slonoviny': '+225',
  'Polsko': '+48',
  'Portoriko': '+1',
  'Portugalsko': '+351',
  'Rakousko': '+43',
  'Rumunsko': '+40',
  'Rusko': '+7',
  'Rwanda': '+250',
  'Řecko': '+30',
  'Salvador': '+503',
  'San Marino': '+378',
  'Saúdská Arábie': '+966',
  'Senegal': '+221',
  'Severní Makedonie': '+389',
  'Seychely': '+248',
  'Singapur': '+65',
  'Slovensko': '+421',
  'Slovinsko': '+386',
  'Spojené arabské emiráty': '+971',
  'Spojené státy americké': '+1',
  'Srbsko': '+381',
  'Súdán': '+249',
  'Svatý Martin (NL)': '+1',
  'Svatý Vincenc a Grenadiny': '+1',
  'Svazijsko': '+268',
  'Španělsko': '+34',
  'Šrí Lanka': '+94',
  'Švédsko': '+46',
  'Švýcarsko': '+41',
  'Tanzanie': '+255',
  'Thajsko': '+66',
  'Tchaj-wan': '+886',
  'Togo': '+228',
  'Tunisko': '+216',
  'Turecko': '+90',
  'Uganda': '+256',
  'Ukrajina': '+380',
  'Uruguay': '+598',
  'Uzbekistán': '+998',
  'Vatikán': '+39',
  'Velká Británie': '+44',
  'Venezuela': '+58',
  'Vietnam': '+84',
  'Wallis a Futuna': '+681',
  'Zambie': '+260',
  'Zimbabwe': '+263',
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
      desc: 'Svoji objednávku si můžete vyzvednout v centru Prahy na adrese: Tržiště 3, Malá Strana (In Arte veritas)',
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
