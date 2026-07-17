import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
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