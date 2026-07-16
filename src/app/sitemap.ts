import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';
import { INDEXABLE_CATEGORY_SLUGS } from '@/lib/categoryContent';

export const revalidate = 3600;

const staticRoutes = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: '/co-je-kreativni-arch', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/jak-nakupovat', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/vytvorit-arch', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/kontakt', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/obchodni-podminky', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/ochrana-osobnich-udaju', priority: 0.2, changeFrequency: 'yearly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = INDEXABLE_CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/kategorie/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const { data: products } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('is_active', true);

  const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${SITE_URL}/produkt/${product.id}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
