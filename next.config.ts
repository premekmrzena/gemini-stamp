import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Povolí stahování obrázků ze Supabase
        port: '',
        pathname: '/storage/v1/object/public/**', // Konkrétní cesta do tvého veřejného Storage
      },
    ],
  },
};

export default nextConfig;