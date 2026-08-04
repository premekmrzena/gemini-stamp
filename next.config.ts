import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    // /kategorie/kreativni-archy nemá vlastní obsah (viz kategorie/[slug]/page.tsx
    // - jen klientský router.replace na /vytvorit-arch po mountu). Žádný odkaz na
    // webu tam nevede, ale kdyby existoval starý/vnější odkaz, ať dostane rovnou
    // 301 misto krátkého probliknutí prázdné stránky s generickým titulkem.
    return [
      {
        source: '/kategorie/kreativni-archy',
        destination: '/vytvorit-arch',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Povolí stahování obrázků ze Supabase
        port: '',
        pathname: '/storage/v1/object/public/**', // Konkrétní cesta do tvého veřejného Storage
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com', // Povolí stahování náhledů z Vercel Blob
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);