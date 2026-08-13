// Sdílený obsah pro /prague-souvenir (kořen, auto-detekce) a /prague-souvenir/[lang]
// (pevné URL na konkrétní jazyk, pro Google Ads/QR kódy - viz page.tsx v obou složkách).
// Čistě data/logika, žádné JSX - bezpečné importovat ze server i client komponent.

export type LangCode = 'en' | 'ja' | 'zh-Hans' | 'zh-Hant' | 'ko';

export const LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'ko', label: '한국어' },
];

// BCP 47 tagy pro <html lang> - nastavují se za běhu (viz LandingContent), protože
// prague-souvenir/layout.tsx je sdílený root layout pro všechny jazyky (`lang="en"`
// natvrdo) a Next.js neumí <html lang> měnit per-route bez vlastního root layoutu
// pro každý jazyk zvlášť (zbytečná režie pro kampaňovou stránku).
export const HTML_LANG: Record<LangCode, string> = {
  en: 'en',
  ja: 'ja',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
  ko: 'ko',
};

export function isLangCode(value: string): value is LangCode {
  return LANGS.some((l) => l.code === value);
}

type Step = { title: string; text: string };

export type Content = {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaNote: string;
  heroImageAlt: string;
  steps: [Step, Step, Step];
  showcaseCaption: string;
  trustTitle: string;
  shipTitle: string;
  shipText: string;
  pickupTitle: string;
  pickupText: string;
  finalTitle: string;
  finalSubtitle: string;
  finalCta: string;
  footerText: string;
};

// POZOR: JA/ZH-Hans/ZH-Hant/KO texty jsou strojový překlad (stejná situace jako EN
// právní texty, viz docs/shrnutí-draft.md) - než se do nich pustí reálný rozpočet ve
// větším, stálo by za to nechat je zkontrolovat rodilým mluvčím.
export const CONTENT: Record<LangCode, Content> = {
  en: {
    heroTitle: 'Turn your trip into a keepsake no one else has.',
    heroSubtitle:
      'Design your own sheet of postage stamps using your own travel photos — a personal, one-of-a-kind souvenir from the Czech Republic.',
    heroCta: 'Create Your Stamp Sheet',
    heroCtaNote: 'Checkout continues in English.',
    heroImageAlt: 'Two travelers taking a selfie in front of Český Krumlov castle',
    steps: [
      { title: 'Choose a template', text: 'Inspired by Czech architecture, castles, and Alphonse Mucha’s art.' },
      { title: 'Upload your photos', text: 'Prague Castle, Charles Bridge, Český Krumlov — today’s photos are perfect.' },
      { title: 'Add your own words', text: 'A short message, a date, a name — whatever makes it yours.' },
    ],
    showcaseCaption: 'A real sheet, filled with a real trip.',
    trustTitle: 'However you’re traveling',
    shipTitle: 'We ship worldwide',
    shipText: 'Order now, and it will be waiting for you at home.',
    pickupTitle: 'Or pick it up in Prague',
    pickupText:
      'Buy it in person at our partner shop In Arte Veritas, Malá Strana — a short walk from Charles Bridge.',
    finalTitle: 'Start with your own photos.',
    finalSubtitle: 'It takes a few minutes to design, and it lasts a lot longer than the trip.',
    finalCta: 'Create Your Stamp Sheet',
    footerText: 'Shipped from Prague, Czech Republic.',
  },
  ja: {
    heroTitle: '旅の記念に、世界にひとつだけの一枚を。',
    heroSubtitle:
      '自分の旅の写真を使って、オリジナルの切手シートをデザイン。チェコ発、あなただけの特別なお土産です。',
    heroCta: '切手シートを作る',
    heroCtaNote: '購入手続きは英語のページで行われます。',
    heroImageAlt: 'チェスキー・クルムロフ城を背景に自撮りする旅行者ふたり',
    steps: [
      { title: 'テンプレートを選ぶ', text: 'チェコの建築、古城、ミュシャの美術からインスパイアされたデザイン。' },
      { title: '写真をアップロード', text: 'プラハ城、カレル橋、チェスキー・クルムロフ — 今日撮った写真でOK。' },
      { title: 'メッセージを添える', text: '短い言葉、日付、名前 — あなただけの一枚に。' },
    ],
    showcaseCaption: '実際の旅の写真で仕上げた、実物のシート。',
    trustTitle: '旅のスタイルに合わせて',
    shipTitle: '世界中に発送',
    shipText: '今すぐ注文すれば、帰国後にお手元に届きます。',
    pickupTitle: 'プラハで直接受け取りも',
    pickupText: '提携ショップ In Arte Veritas（マラー・ストラナ地区、カレル橋からすぐ）で直接お受け取りいただけます。',
    finalTitle: 'あなたの写真から、はじめよう。',
    finalSubtitle: 'デザインは数分で完成。旅よりずっと長く残ります。',
    finalCta: '切手シートを作る',
    footerText: 'チェコ・プラハより発送。',
  },
  'zh-Hans': {
    heroTitle: '把这趟旅行,变成世界上独一无二的纪念。',
    heroSubtitle: '用你自己的旅行照片,设计专属邮票纪念页——来自捷克、独一无二的私人纪念品。',
    heroCta: '制作我的邮票纪念页',
    heroCtaNote: '结账流程为英文页面。',
    heroImageAlt: '两位旅行者在捷克克鲁姆洛夫城堡前自拍',
    steps: [
      { title: '选择模板', text: '灵感来自捷克建筑、古堡与慕夏(Mucha)的艺术。' },
      { title: '上传照片', text: '布拉格城堡、查理大桥、CK小镇——今天拍的照片就可以。' },
      { title: '写下你的话', text: '一句话、一个日期、一个名字——让它专属于你。' },
    ],
    showcaseCaption: '真实的旅程,做成真实的纪念页。',
    trustTitle: '无论你怎么安排行程',
    shipTitle: '全球配送',
    shipText: '现在下单,回国后就能收到。',
    pickupTitle: '也可以在布拉格现场取货',
    pickupText: '前往合作门店 In Arte Veritas(小城区,查理大桥附近)现场取货。',
    finalTitle: '从你的照片开始。',
    finalSubtitle: '设计只需几分钟,留存却比这趟旅行更久。',
    finalCta: '制作我的邮票纪念页',
    footerText: '从捷克布拉格发货。',
  },
  'zh-Hant': {
    heroTitle: '把這趟旅行,變成世界上獨一無二的紀念。',
    heroSubtitle: '用你自己的旅行照片,設計專屬郵票紀念頁——來自捷克、獨一無二的私人紀念品。',
    heroCta: '製作我的郵票紀念頁',
    heroCtaNote: '結帳流程為英文頁面。',
    heroImageAlt: '兩位旅行者在捷克克魯姆洛夫城堡前自拍',
    steps: [
      { title: '選擇範本', text: '靈感來自捷克建築、古堡與慕夏(Mucha)的藝術。' },
      { title: '上傳照片', text: '布拉格城堡、查理大橋、CK小鎮——今天拍的照片就可以。' },
      { title: '寫下你的話', text: '一句話、一個日期、一個名字——讓它專屬於你。' },
    ],
    showcaseCaption: '真實的旅程,做成真實的紀念頁。',
    trustTitle: '無論你怎麼安排行程',
    shipTitle: '全球配送',
    shipText: '現在下單,回國後就能收到。',
    pickupTitle: '也可以在布拉格現場取貨',
    pickupText: '前往合作門店 In Arte Veritas(小城區,查理大橋附近)現場取貨。',
    finalTitle: '從你的照片開始。',
    finalSubtitle: '設計只需幾分鐘,留存卻比這趟旅行更久。',
    finalCta: '製作我的郵票紀念頁',
    footerText: '從捷克布拉格發貨。',
  },
  ko: {
    heroTitle: '여행을 세상에 하나뿐인 기념품으로.',
    heroSubtitle: '나만의 여행 사진으로 만드는 나만의 우표 시트 — 체코에서 온, 특별하고 유일한 기념품입니다.',
    heroCta: '우표 시트 만들기',
    heroCtaNote: '결제는 영어 페이지로 진행됩니다.',
    heroImageAlt: '체스키크룸로프 성을 배경으로 셀카를 찍는 두 여행자',
    steps: [
      { title: '템플릿 선택', text: '체코 건축, 고성, 알폰스 무하의 예술에서 영감을 받은 디자인.' },
      { title: '사진 업로드', text: '프라하 성, 카를교, 체스키크룸로프 — 오늘 찍은 사진이면 충분해요.' },
      { title: '메시지 남기기', text: '짧은 문구, 날짜, 이름 — 나만의 이야기를 더해보세요.' },
    ],
    showcaseCaption: '진짜 여행으로 완성한, 진짜 시트.',
    trustTitle: '여행 일정에 맞게',
    shipTitle: '전 세계 배송',
    shipText: '지금 주문하면 귀국 후 집에서 받아보실 수 있어요.',
    pickupTitle: '프라하에서 직접 수령도 가능',
    pickupText: '파트너 매장 In Arte Veritas(말라스트라나, 카를교 근처)에서 직접 받아가실 수 있습니다.',
    finalTitle: '여러분의 사진으로 시작하세요.',
    finalSubtitle: '디자인은 몇 분이면 완성되고, 여행보다 훨씬 오래 남습니다.',
    finalCta: '우표 시트 만들기',
    footerText: '체코 프라하에서 발송됩니다.',
  },
};

// Detekce jen pro kořenovou (auto) stránku - pevné /[lang] cesty svůj jazyk znají
// napřímo z URL, detekci nepotřebují. Rozděleno na dvě funkce, protože kořenová
// stránka se s nimi chová jinak: explicitní ?lang= je záměrný lokální override
// (zůstat na /prague-souvenir, jen přepnout obsah - hodí se na testování), zatímco
// jazyk odvozený z prohlížeče spouští přesměrování na pevnou /[lang] URL (viz
// page.tsx) - žádný důvod zůstávat na kořeni, když z prohlížeče víme jistě, že
// návštěvník čte japonsky/čínsky/korejsky.
export function detectLangFromQuery(): LangCode | null {
  if (typeof window === 'undefined') return null;
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  return fromQuery && isLangCode(fromQuery) ? fromQuery : null;
}

export function detectLangFromBrowser(): LangCode {
  if (typeof window === 'undefined') return 'en';

  const browserLang = (navigator.language || '').toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('zh')) {
    return browserLang.includes('tw') || browserLang.includes('hk') || browserLang.includes('hant')
      ? 'zh-Hant'
      : 'zh-Hans';
  }
  return 'en';
}
