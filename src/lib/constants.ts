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

export const getShippingOptions = (weightGrams: number): ShippingOption[] => {
  let czPrice = 120;
  if (weightGrams <= 50) czPrice = 40;
  else if (weightGrams <= 500) czPrice = 80;
  const intPrice = weightGrams <= 500 ? 150 : 300;
  return [
    {
      id: 'osobni',
      name: 'Osobní odběr (Praha)',
      price: 0,
      desc: 'Svoji objednávku si můžete vyzvednout na adrese: Jindřišská 126/15, Praha 1',
    },
    {
      id: 'ceska',
      name: 'Česká republika',
      price: czPrice,
      desc: czPrice === 40 ? 'Obyčejné psaní' : czPrice === 80 ? 'Doporučené psaní' : 'Balíček',
    },
    {
      id: 'mezinarodni',
      name: 'Mezinárodní doprava',
      price: intPrice,
      desc: 'Zemi doručení zadáte v dalším kroku',
    },
  ];
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
