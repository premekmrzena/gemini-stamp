// Obsah neveřejné stránky pro cestovní kanceláře / incomingové agentury a průvodce
// (2026-09-24, podle sekce "Neveřejná stránka pro agentury" v dokumentu
// "Oslovení CK s asijskými turisty"). Natvrdo v souboru, ne přes next-intl -
// stejný vzor jako prague-souvenir/content.ts (stránka žije mimo [locale]).
//
// POZOR: expres na hotel, pole hotel/datum odjezdu a kódy CK s automatickým
// přiřazením objednávek zatím v e-shopu nejsou - doplní se s první ostrou zakázkou.

export type PartnerLang = 'cs' | 'en';

export const PARTNER_LANGS: { code: PartnerLang; label: string }[] = [
  { code: 'cs', label: 'CZ' },
  { code: 'en', label: 'EN' },
];

export function isPartnerLang(value: unknown): value is PartnerLang {
  return value === 'cs' || value === 'en';
}

export const CONTACT_EMAIL = 'info@mycreativestamp.com';
export const CONTACT_PHONE = '+420 603 423 690';
export const CONTACT_PHONE_HREF = 'tel:+420603423690';

type Item = { title: string; text: string };

export type PartnerContent = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  heroTitle: string;
  /** Perex je rozdělený kvůli tučné části uprostřed (heroTextStrong). */
  heroText: string;
  heroTextStrong: string;
  heroTextAfter: string;
  heroCta: string;
  heroImageAlt: string;

  categories: {
    title: string;
    intro: string;
    exploreLink: string;
    featuredBadge: string;
    stamps: Item;
    sheets: Item;
    fdc: Item;
    plaques: Item;
  };

  howTitle: string;
  howText: string;
  steps: Item[];

  deliveryTitle: string;
  deliveryText: string;
  delivery: Item[];

  pricingTitle: string;
  pricingText: string;
  /** Text pod rozpětím cen, které se načítá ze Supabase (page.tsx). */
  guestPriceTitle: string;
  /** Přibližná cena v Kč pod eurovou cenou (jen v CZ verzi). */
  guestPriceCzkApprox?: string;
  guestPriceText: string;
  guestPriceFallback: string;
  commissionTitle: string;
  commissionValue: string;
  commissionText: string;
  pricingRows: Item[];

  trackingTitle: string;
  trackingText: string;
  tracking: Item[];

  materialsTitle: string;
  materialsText: string;
  materials: Item[];
  materialsNote: string;

  faqTitle: string;
  faq: { q: string; a: string }[];

  contactTitle: string;
  contactText: string;
  contactOr: string;
  form: {
    name: string;
    agency: string;
    email: string;
    phone: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };

  footerText: string;
  footerTerms: string;
  footerPrivacy: string;
};

export const CONTENT: Record<PartnerLang, PartnerContent> = {
  cs: {
    metaTitle: 'Spolupráce pro cestovní kanceláře',
    metaDescription: 'Podmínky spolupráce s My Creative Stamp pro cestovní kanceláře, incomingové agentury a průvodce.',
    badge: 'Pro cestovní kanceláře a průvodce',
    heroTitle: 'Suvenýr z Prahy, který si vaši hosté navrhnou sami',
    heroText: 'Kreativní arch s pravými českými poštovními známkami, doplněný o vlastní fotky z cesty. Host ho objedná z mobilu za pár minut, ',
    heroTextStrong: 'vy dostanete provizi',
    heroTextAfter: ' z každé objednávky.',
    heroCta: 'Chci spolupracovat',
    heroImageAlt: 'Hotový kreativní arch se známkami a fotkami z Prahy',

    categories: {
      title: 'Co si u nás hosté mohou koupit',
      intro: 'Čtyři kategorie produktů z pravých českých poštovních známek. Pro skupiny doporučujeme kreativní arch s vlastními fotkami z cesty.',
      exploreLink: '→ Jak vzniká kreativní arch',
      featuredBadge: 'Pro skupiny',
      stamps: { title: 'Poštovní známky', text: 'Sběratelské i klasické známky s českou a evropskou historií, uměním nebo přírodou.' },
      sheets: { title: 'Kreativní archy', text: 'Arch ze skutečných poštovních známek doplněný o fotografie a text hosta. Hlavní produkt pro skupiny.' },
      fdc: { title: 'First Day Cover (FDC)', text: 'Obálky prvního dne vydání se známkou a razítkem k datu, kdy známka poprvé vyšla.' },
      plaques: { title: 'Dárkové plakety', text: 'Reprezentativní plakety k darování nebo jako doplněk sběratelské kolekce.' },
    },

    howTitle: 'Jak to funguje pro skupinu',
    howText: 'Průvodce nemusí nic prodávat ani vybírat peníze. Stačí rozdat leták.',
    steps: [
      {
        title: 'Průvodce rozdá leták',
        text: 'Leták s QR kódem v jazyce skupiny. QR kód obsahuje kód vaší kanceláře.',
      },
      {
        title: 'Host objedná z mobilu',
        text: 'Vybere šablonu, nahraje fotky z cesty a zaplatí kartou. Zabere to pár minut.',
      },
      {
        title: 'Arch dorazí na hotel',
        text: 'Druhý den ho kurýr doručí na hotel v Praze. Kdo už odjíždí, dostane ho domů.',
      },
    ],

    deliveryTitle: 'Podmínky doručení',
    deliveryText: 'Doručení přizpůsobíme tomu, jak dlouho je skupina v Praze.',
    delivery: [
      {
        title: 'Expres na hotel v Praze',
        text: 'Objednávka do 14:00 = doručení kurýrem na hotel další doručovací den. Vhodné pro skupiny, které v Praze spí aspoň 2 noci.',
      },
      {
        title: 'Doručujeme pondělí až sobota',
        text: 'Objednávka ze čtvrtka po 14:00 dorazí v sobotu. Objednávky ze soboty po 14:00 a z neděle doručíme v pondělí.',
      },
      {
        title: 'Jen hotely v Praze',
        text: 'Expres doručujeme pouze na hotely na území Prahy. Host v objednávce uvede hotel a datum odjezdu.',
      },
      {
        title: 'Doručení domů kamkoli na světě',
        text: 'Pro hosty s dřívějším odjezdem pošleme arch domů (Japonsko, Korea, Tchaj-wan a dalších 140 zemí). Cena a doba dopravy se ukáže v košíku.',
      },
    ],

    pricingTitle: 'Ceny a provize',
    pricingText: 'Hosté platí běžnou cenu z e-shopu. Vy dostáváte provizi z každé objednávky přes váš kód.',
    guestPriceTitle: 'Cena pro hosty',
    guestPriceCzkApprox: 'cca {czk}',
    guestPriceText: 'Za kreativní arch, podle šablony. Doprava se účtuje zvlášť.',
    guestPriceFallback: 'Aktuální ceny kreativních archů najdete na mycreativestamp.com.',
    commissionTitle: 'Provize pro vás',
    commissionValue: 'od 15 %',
    commissionText: 'Z ceny objednávky bez DPH a dopravy. S rostoucím objemem sazba roste, přesnou výši uvedeme ve smlouvě.',
    pricingRows: [
      { title: 'Vyúčtování', text: 'Jednou měsíčně vám pošleme přehled objednávek s vaším kódem.' },
      { title: 'Fakturace', text: 'Na základě přehledu vystavíte fakturu, uhradíme ji do 14 dní.' },
      { title: 'Průvodci', text: 'Zda a jak se o provizi podělíte s průvodci, je na vaší dohodě. Rádi pomůžeme s přehledem po průvodcích.' },
    ],

    trackingTitle: 'Sledování objednávek',
    trackingText: 'Každá objednávka se vaší kanceláři připíše automaticky. Nic nemusíte hlásit.',
    tracking: [
      { title: 'Vlastní kód', text: 'Každá kancelář dostane unikátní kód, který host použije v objednávce.' },
      { title: 'Vlastní odkaz a QR kód', text: 'Odkaz s vaším kódem je předvyplněný, host ho nemusí opisovat.' },
      { title: 'Kód pro každého průvodce', text: 'Na přání vytvoříme samostatné kódy pro jednotlivé průvodce nebo zájezdy.' },
    ],

    materialsTitle: 'Materiály, které pro vás připravíme',
    materialsText: 'Připravíme vše, co průvodce potřebuje. Materiály obsahují váš kód.',
    materials: [
      { title: 'Letáky s QR kódem', text: 'Formát A5 v japonštině, korejštině, čínštině a angličtině.' },
      { title: 'Fotky do katalogů', text: 'Fotografie archů ve vysokém rozlišení pro váš katalog nebo web.' },
      { title: 'Nabídka v PDF', text: 'Jednostránkové shrnutí spolupráce k přeposlání kolegům.' },
      { title: 'Ukázkové archy', text: 'Hotové archy pro průvodce, aby je mohli ukazovat v autobuse.' },
    ],
    materialsNote: 'Materiály vám pošleme e-mailem po domluvě spolupráce.',

    faqTitle: 'Časté dotazy',
    faq: [
      {
        q: 'Jak mohou hosté platit?',
        a: 'Kartou, Apple Pay, Google Pay nebo Alipay. E-shop je pro hosty v angličtině a platí se v eurech.',
      },
      {
        q: 'Co když host změní hotel nebo odjede dřív?',
        a: 'Stačí nám napsat nejpozději den před doručením. Arch doručíme na nový hotel nebo pošleme domů.',
      },
      {
        q: 'Co když arch přijde poškozený?',
        a: 'Host nám pošle fotku a arch vyrobíme a pošleme znovu zdarma. Reklamace řešíme přímo s hostem, vás nezatěžují.',
      },
      {
        q: 'Musíme něco platit předem nebo odebírat?',
        a: 'Ne. Nic nekupujete a nic neskladujete. Provizi dostáváte jen z uskutečněných objednávek.',
      },
    ],

    contactTitle: 'Chcete to vyzkoušet?',
    contactText: 'Napište nám. Přineseme ukázky a jeden arch pro vaše průvodce zdarma.',
    contactOr: 'Nebo nám rovnou zavolejte či napište:',
    form: {
      name: 'Jméno a příjmení',
      agency: 'Cestovní kancelář',
      email: 'E-mail',
      phone: 'Telefon',
      message: 'Zpráva',
      messagePlaceholder: 'S jakými skupinami pracujete, odkud jsou hosté…',
      submit: 'Odeslat',
      sending: 'Odesílám…',
      success: 'Děkujeme, ozveme se vám do jednoho pracovního dne.',
      error: 'Zprávu se nepodařilo odeslat. Napište nám prosím e-mail nebo zavolejte.',
    },

    footerText: 'My Creative Stamp · DVKS s.r.o. · Praha',
    footerTerms: 'Obchodní podmínky',
    footerPrivacy: 'Ochrana osobních údajů',
  },

  en: {
    metaTitle: 'Partnership for Travel Agencies',
    metaDescription: 'Partnership terms with My Creative Stamp for travel agencies, DMCs and tour guides.',
    badge: 'For travel agencies and tour guides',
    heroTitle: 'A Prague souvenir your guests design themselves',
    heroText: 'A creative sheet of genuine Czech postage stamps, personalised with the guest’s own travel photos. Guests order from their phone in a few minutes, and ',
    heroTextStrong: 'you earn a commission',
    heroTextAfter: ' on every order.',
    heroCta: 'Become a partner',
    heroImageAlt: 'A finished creative sheet with stamps and photos from Prague',

    categories: {
      title: 'What your guests can buy',
      intro: 'Four product categories made from genuine Czech postage stamps. For groups we recommend the creative sheet with the guest’s own travel photos.',
      exploreLink: '→ How a creative sheet is made',
      featuredBadge: 'For groups',
      stamps: { title: 'Postage stamps', text: 'Collectible and classic stamps featuring Czech and European history, art or nature.' },
      sheets: { title: 'Creative Sheets', text: 'A sheet of real postage stamps complemented by the guest’s own photos and text. Our main product for groups.' },
      fdc: { title: 'First Day Cover (FDC)', text: 'First-day-of-issue envelopes with a stamp and postmark from the day the stamp was first issued.' },
      plaques: { title: 'Gift Plaques', text: 'Representative plaques to give as a gift or as an addition to a collector’s set.' },
    },

    howTitle: 'How it works for a group',
    howText: 'Your guide doesn’t sell anything or handle money. Just hand out a flyer.',
    steps: [
      {
        title: 'The guide hands out a flyer',
        text: 'A flyer with a QR code in the group’s language. The QR code carries your agency code.',
      },
      {
        title: 'Guests order from their phone',
        text: 'They pick a template, upload their travel photos and pay by card. It takes a few minutes.',
      },
      {
        title: 'The sheet arrives at the hotel',
        text: 'A courier delivers it to their Prague hotel the next day. Guests leaving earlier get it shipped home.',
      },
    ],

    deliveryTitle: 'Delivery terms',
    deliveryText: 'We adapt delivery to how long the group stays in Prague.',
    delivery: [
      {
        title: 'Express to Prague hotels',
        text: 'Order by 2 pm = courier delivery to the hotel on the next delivery day. Best for groups staying at least 2 nights in Prague.',
      },
      {
        title: 'We deliver Monday to Saturday',
        text: 'Orders placed on Thursday after 2 pm arrive on Saturday. Orders placed on Saturday after 2 pm or on Sunday arrive on Monday.',
      },
      {
        title: 'Prague hotels only',
        text: 'Express delivery goes to hotels within Prague only. Guests enter their hotel and departure date when ordering.',
      },
      {
        title: 'Home delivery worldwide',
        text: 'Guests leaving earlier get the sheet shipped home (Japan, Korea, Taiwan and 140 more countries). Price and delivery time are shown in the cart.',
      },
    ],

    pricingTitle: 'Prices and commission',
    pricingText: 'Guests pay the regular e-shop price. You earn a commission on every order placed with your code.',
    guestPriceTitle: 'Price for guests',
    guestPriceText: 'Per creative sheet, depending on the template. Shipping is charged separately.',
    guestPriceFallback: 'Current creative sheet prices are listed at mycreativestamp.com.',
    commissionTitle: 'Your commission',
    commissionValue: 'from 15%',
    commissionText: 'Of the order value excluding VAT and shipping. The rate grows with volume; the exact rate is set in the agreement.',
    pricingRows: [
      { title: 'Statements', text: 'Once a month we send you an overview of orders placed with your code.' },
      { title: 'Invoicing', text: 'You invoice us based on the statement; we pay within 14 days.' },
      { title: 'Tour guides', text: 'Whether you share the commission with your guides is up to you. We can provide a per-guide breakdown.' },
    ],

    trackingTitle: 'Order tracking',
    trackingText: 'Every order is credited to your agency automatically. Nothing to report.',
    tracking: [
      { title: 'Your own code', text: 'Each agency gets a unique code that guests use when ordering.' },
      { title: 'Your own link and QR code', text: 'The link has your code pre-filled, so guests don’t need to type it.' },
      { title: 'A code for each guide', text: 'On request we create separate codes for individual guides or tours.' },
    ],

    materialsTitle: 'Materials we prepare for you',
    materialsText: 'We prepare everything your guides need. All materials carry your code.',
    materials: [
      { title: 'Flyers with QR code', text: 'A5 format in Japanese, Korean, Chinese and English.' },
      { title: 'Catalogue photos', text: 'High-resolution photos of the sheets for your catalogue or website.' },
      { title: 'One-page PDF', text: 'A partnership summary to forward to your colleagues.' },
      { title: 'Sample sheets', text: 'Finished sheets for your guides to show on the bus.' },
    ],
    materialsNote: 'We send the materials by e-mail once we agree to work together.',

    faqTitle: 'FAQ',
    faq: [
      {
        q: 'How can guests pay?',
        a: 'By card, Apple Pay, Google Pay or Alipay. The e-shop is in English with prices in euros.',
      },
      {
        q: 'What if a guest changes hotel or leaves early?',
        a: 'Just let us know by the day before delivery. We deliver to the new hotel or ship the sheet home.',
      },
      {
        q: 'What if the sheet arrives damaged?',
        a: 'The guest sends us a photo and we make and send a new sheet free of charge. We handle claims directly with the guest, not through you.',
      },
      {
        q: 'Do we need to pay upfront or buy stock?',
        a: 'No. You don’t buy or store anything. You earn commission only on completed orders.',
      },
    ],

    contactTitle: 'Want to give it a try?',
    contactText: 'Write to us. We’ll bring samples and one free sheet for your guides.',
    contactOr: 'Or call or e-mail us directly:',
    form: {
      name: 'Full name',
      agency: 'Travel agency',
      email: 'E-mail',
      phone: 'Phone',
      message: 'Message',
      messagePlaceholder: 'Which groups you work with, where your guests come from…',
      submit: 'Send',
      sending: 'Sending…',
      success: 'Thank you, we’ll get back to you within one business day.',
      error: 'The message could not be sent. Please e-mail or call us instead.',
    },

    footerText: 'My Creative Stamp · DVKS s.r.o. · Prague, Czech Republic',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
  },
};
