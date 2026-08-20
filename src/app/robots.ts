import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /ko, /ja, /zh-Hans, /zh-Hant jsou v next-intl routingu připravené
      // dopředu jako budoucí mutace, ale messages/*.json jsou zatím prázdné
      // (viz docs/09-jazykove-mutace.md) - obsah pod prefixem je jen fallback
      // na anglický text. Bez disallow je Google normálně procházel a hlásil
      // v GSC jako "Alternativní stránka se správnou značkou kanonické
      // stránky" (canonical na těch stránkách správně míří na neprefixovanou
      // /en cestu, takže se stejně neindexovaly - jen to zbytečně nafukovalo
      // hlášení). /cs se sem záměrně nedává, to řeší proxy.ts (redirect pryč
      // pro kohokoli bez site_access cookie, viz isCsPreviewPath).
      disallow: ['/admin', '/api', '/kosik', '/dekujeme', '/ko', '/ja', '/zh-Hans', '/zh-Hant'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
