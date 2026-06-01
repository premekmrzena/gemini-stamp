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
    name: 'Alfons Mucha: čtyři roční období',
    description: 'Kreativní arch s díly českého umělce, který výrazně ovlivnil japonskou mangu, zejména žánr shōjo a fantasy/sci-fi tituly od 70. let 20. století.',
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
    name: 'Historické skvosty Česka',
    description: 'Umělecké ilustrace slavných historických památek.',
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
  {
    id: 'template-03',
    name: 'Rodinné vzpomínky',
    description: 'Klasické rozvržení pro rodinné fotografie a osobní vzkazy blízkým.',
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
    id: 'template-04',
    name: 'Cestovatelský deník',
    description: 'Sdílejte zážitky z cest a dovolených v elegantním čtyřdílném formátu.',
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
