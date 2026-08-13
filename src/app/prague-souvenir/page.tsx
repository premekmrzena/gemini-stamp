'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Kampaňová landing page pro cílovou skupinu z 2026-08-13 (asijský turista v ČR,
// viz memory project_target_customer_asian_tourist) - JEDNA stránka, ne next-intl
// mutace, viz syntéza v "Poštovní itinerář" artefaktu: nejlevnější první krok je
// cílená landing page, ne celý next-intl storefront rollout.
//
// Jazyk se přepíná čistě v klientovi (žádný next-intl routing, viz proxy.ts
// LOCALE_EXEMPT_PATHS): ?lang= parametr v URL (pro konkrétní jazykové ad varianty)
// > jazyk prohlížeče (navigator.language) > anglický fallback. Server vždy vrací
// anglickou verzi (hydratační shoda), přepnutí proběhne až po mountu.
//
// POZOR: JA/ZH-Hans/ZH-Hant/KO texty jsou strojový překlad (stejná situace jako
// EN právní texty, viz docs/shrnutí-draft.md) - než se do nich pustí reálný
// rozpočet ve větším, stálo by za to nechat je zkontrolovat rodilým mluvčím.

type LangCode = 'en' | 'ja' | 'zh-Hans' | 'zh-Hant' | 'ko';

const LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'ko', label: '한국어' },
];

type Step = { title: string; text: string };

type Content = {
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

const CONTENT: Record<LangCode, Content> = {
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

function detectLang(): LangCode {
  if (typeof window === 'undefined') return 'en';

  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery && LANGS.some((l) => l.code === fromQuery)) return fromQuery as LangCode;

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

// Primární CTA - stejné třídy jako Button.tsx (variant="contained"), replikované
// na <a>, protože <button> uvnitř <a> je neplatné HTML a odkaz musí vést na
// /vytvorit-arch (next/link zdvojení by tu nic nepřineslo, cesta je mimo [locale]).
function PrimaryCta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/vytvorit-arch"
      className={`inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95 text-[16px] md:text-[18px] p-[16px] bg-primary text-black hover:bg-primary-hover ${className}`}
    >
      {children}
    </Link>
  );
}

export default function PragueSouvenirPage() {
  // Začíná na 'en', aby se první vykreslení shodovalo se serverem (žádný hydration
  // mismatch) - detekce (?lang=, navigator.language) je dostupná až po mountu na
  // klientovi, stejný vzor jako TrustBadges.tsx.
  const [lang, setLang] = useState<LangCode>('en');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(detectLang());
  }, []);

  const c = CONTENT[lang];
  // Poppins nemá CJK znaky (viz .font-cjk v globals.css) - anglický obsah zůstává
  // v brandovém Poppins, ostatní 4 jazyky přepnou na systémový CJK stack.
  const contentFontClass = lang === 'en' ? '' : 'font-cjk';

  return (
    <main className={`flex flex-col w-full min-h-screen bg-black text-secondary ${contentFontClass}`}>
      {/* TOP BAR - jen logo + přepínač jazyků, žádná plná navigace (fokusovaná
          kampaňová stránka, ne kopie hlavního webu) */}
      <div className="layout-container flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/images/creative-stamp_logo.svg" alt="My Creative Stamp" width={28} height={28} />
          <span className="style-body-bold hidden sm:inline">My Creative Stamp</span>
        </Link>
        {/* font-cjk natvrdo (ne podmíněně) - vlastní název jazyka (日本語, 한국어...)
            musí být čitelný, i když je zrovna aktivní jiný jazyk. */}
        <div className="flex flex-wrap justify-end gap-1.5 font-cjk" role="group" aria-label="Language">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`style-label px-2.5 py-1.5 rounded-[4px] border transition-colors cursor-pointer ${
                lang === code
                  ? 'bg-primary text-black border-primary'
                  : 'border-black300/30 text-black300 hover:text-secondary hover:border-black300/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* HERO - split layout, stejná barevná logika jako homepage Hero (bg-black,
          text-secondary), obrázek je reálná fotka z hero slideru homepage. */}
      <section className="layout-container grid md:grid-cols-2 gap-10 md:gap-12 items-center pt-4 pb-12 md:pb-20">
        <div className="flex flex-col md:order-1 order-2">
          <h1 className="style-h1 mb-4">{c.heroTitle}</h1>
          <p className="style-perex text-secondary/70 mb-8 max-w-[520px]">{c.heroSubtitle}</p>
          <div>
            <PrimaryCta>{c.heroCta}</PrimaryCta>
            <p className="style-label text-black300 mt-3">{c.heroCtaNote}</p>
          </div>
        </div>
        <div className="relative w-full aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden md:order-2 order-1">
          <Image
            src="/images/hero02.png"
            alt={c.heroImageAlt}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* KROKY - číslovaná mřížka, vzor z feedback_static_page_pattern */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {c.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-4">
                  {i + 1}
                </div>
                <h3 className="style-h3 mb-2">{step.title}</h3>
                <p className="style-body text-secondary/60 max-w-[26rem]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UKÁZKA - reálný vyplněný arch, bez pozadí (střídání pásů) */}
      <section>
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px] flex flex-col items-center">
          <div className="relative w-full max-w-[820px] aspect-[4/3] min-w-0 min-h-0 rounded-[4px] overflow-hidden">
            <Image
              src="/images/hero01.png"
              alt={c.showcaseCaption}
              fill
              sizes="(max-width: 900px) 100vw, 820px"
              className="object-contain"
            />
          </div>
          <p className="style-body text-secondary/50 mt-6 text-center">{c.showcaseCaption}</p>
        </div>
      </section>

      {/* DOPRAVA / ODBĚR - dvě rovnocenné karty, ne kroky (bez čísel) */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">{c.trustTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-[760px] mx-auto">
            <div className="bg-black border border-white/5 rounded-[4px] p-6">
              <h3 className="style-h3 mb-2">{c.shipTitle}</h3>
              <p className="style-body text-secondary/60">{c.shipText}</p>
            </div>
            <div className="bg-black border border-white/5 rounded-[4px] p-6">
              <h3 className="style-h3 mb-2">{c.pickupTitle}</h3>
              <p className="style-body text-secondary/60">{c.pickupText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PÁS - poslední, vzor z feedback_static_page_pattern bod 7 */}
      <section className="bg-[#0B1120] border-t border-white/5">
        <div className="layout-container py-[56px] md:py-[80px] text-center flex flex-col items-center">
          <h2 className="style-h2 mb-4">{c.finalTitle}</h2>
          <p className="style-perex text-secondary/70 max-w-[480px] mx-auto mb-10">{c.finalSubtitle}</p>
          <PrimaryCta>{c.finalCta}</PrimaryCta>
        </div>
      </section>

      {/* FOOTER - minimální, jen právní odkazy, žádná plná patička */}
      <footer className="layout-container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-black300">
        <p className="style-label">{c.footerText}</p>
        <div className="flex gap-4 style-label">
          <Link href="/obchodni-podminky" className="hover:text-secondary transition-colors">Terms</Link>
          <Link href="/ochrana-osobnich-udaju" className="hover:text-secondary transition-colors">Privacy</Link>
        </div>
      </footer>
    </main>
  );
}
