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
    name: 'Šablona A — klasická',
    description: 'Mřížka 3×2 na výšku, ideální pro portréty a rodinné fotky.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/template01.png',
    width: 4130,
    height: 2550,
    stampCount: 6,
    stampPreviews: [],
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
    name: 'Šablona B — velké fotky',
    description: 'Mřížka 2×2 na šířku, vynikne u krajin a skupinových snímků.',
    productId: '2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    shopUrl: '/produkt/2923bbf0-2f34-4cd5-b586-7c1c7ba1977b',
    backgroundImage: '/templates/template01.png',
    width: 4130,
    height: 2550,
    stampCount: 4,
    stampPreviews: [],
    slots: [
      { id: '1', x: 344, y: 502, width: 1650, height: 1360, type: 'photo' },
      { id: '2', x: 2136, y: 502, width: 1650, height: 1360, type: 'photo' },
      { id: '3', x: 344, y: 1662, width: 1650, height: 532, type: 'photo' },
      { id: '4', x: 2136, y: 1662, width: 1650, height: 532, type: 'photo' },
    ],
  },
];
