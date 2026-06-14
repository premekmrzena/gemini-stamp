export type SlotType = 'photo' | 'text';

export type Slot = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: SlotType;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  productId: string;
  shopUrl?: string;
  backgroundImage: string;
  width: number;
  height: number;
  stampCount: number;
  stampPreviews: string[];
  slots: Slot[];
};

export type PhotoState = {
  url: string;
  scale: number;
  x: number;
  y: number;
};

export type TextState = {
  mainText: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  textPos: { x: number; y: number };
  useShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
};

export const TEMPLATES: Template[] = [
  {
    id: 'template-01',
    name: 'Krása, která přetrvala věky',
    description: 'Arch inspirovaný českou architekturou a historií. Šest vlastních fotografií zasazených do elegantního rámce slavných staveb.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/01_Architektura_white-slots.jpg',
    width: 4130,
    height: 2550,
    stampCount: 6,
    stampPreviews: ['/templates/01_Architektura_preview.jpg'],
    slots: [
      { id: '1', x: 1042, y: 502, width: 1348, height: 1112, type: 'text' },
      { id: '2', x: 2438, y: 502, width: 650, height: 532, type: 'photo' },
      { id: '3', x: 344, y: 1082, width: 650, height: 532, type: 'photo' },
      { id: '4', x: 3136, y: 1082, width: 650, height: 532, type: 'photo' },
      { id: '5', x: 1042, y: 1662, width: 650, height: 532, type: 'photo' },
      { id: '6', x: 2438, y: 1662, width: 650, height: 532, type: 'photo' },
    ],
  },
  {
    id: 'template-02',
    name: 'Krása, která přetrvala věky',
    description: 'Kompaktnější varianta archu s českou architekturou. Pět fotografií v přehledném rozvržení.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/02_Architektura_white-slots.jpg',
    width: 4130,
    height: 2550,
    stampCount: 4,
    stampPreviews: ['/templates/02_Architektura_preview.jpg'],
    slots: [
      { id: '1', x: 1042, y: 502,  width: 1348, height: 1112, type: 'text' },
      { id: '2', x: 2438, y: 502,  width: 650,  height: 532,  type: 'photo' },
      { id: '3', x: 3136, y: 1082, width: 650,  height: 532,  type: 'photo' },
      { id: '4', x: 1042, y: 1662, width: 650,  height: 532,  type: 'photo' },
      { id: '5', x: 2438, y: 1662, width: 650,  height: 532,  type: 'photo' },
    ],
  },
  {
    id: 'template-03',
    name: 'Alfons Mucha: Čtvero ročních období',
    description: 'Arch s motivy jednoho z největších českých umělců. Osm fotografií orámovaných symbolikou čtyř ročních období.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/03_Mucha_white-slots.jpg',
    width: 4130,
    height: 2550,
    stampCount: 7,
    stampPreviews: ['/templates/03_Mucha_preview.jpg'],
    slots: [
      { id: '1', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '2', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '3', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '4', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '5', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '6', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '7', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '8', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
    ],
  },
  {
    id: 'template-04',
    name: 'Když umění vypráví dějiny Evropy',
    description: 'Arch věnovaný evropskému výtvarnému umění. Šest fotografií v kompozici inspirované galerijní tradicí.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/04_Umeni-evropy_white-slots.jpg',
    width: 4130,
    height: 2550,
    stampCount: 6,
    stampPreviews: ['/templates/04_Umeni-evropy_preview.jpg'],
    slots: [
      { id: '1', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '2', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '3', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '4', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '5', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '6', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
    ],
  },
  {
    id: 'template-05',
    name: 'Slavní umělci a jejich díla',
    description: 'Arch vzdávající hold světovým malířům a sochařům. Sedm fotografií ve formátu, který připomíná stránky uměleckého alba.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/05_Slavni-umelci_white-slots.jpg',
    width: 4130,
    height: 2550,
    stampCount: 6,
    stampPreviews: ['/templates/05_Slavni-umelci_preview.jpg'],
    slots: [
      { id: '1', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '2', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '3', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '4', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '5', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '6', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
      { id: '7', x: 0, y: 0, width: 0, height: 0, type: 'photo' },
    ],
  },
];
