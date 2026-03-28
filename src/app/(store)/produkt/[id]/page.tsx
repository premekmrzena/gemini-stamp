import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Získání ID z URL (podle pravidel Next.js 15+)
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // 1. Stáhneme detail produktu
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center bg-[#0F172A] text-[#FDFBF7]">
        <h2 className="style-h2 mb-4">Produkt nenalezen</h2>
        <p className="style-body text-[#8B95AC]">Omlouváme se, ale tato známka už v databázi pravděpodobně není.</p>
      </div>
    );
  }

  // 2. Stáhneme související
  let relatedProducts: any[] = [];
  if (product.related_stamp_id) {
    const { data: related } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('id', product.related_stamp_id)
      .single();
    
    if (related) relatedProducts.push(related);
  } else {
    const { data: fallback } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .neq('id', product.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (fallback) relatedProducts = fallback;
  }

  // 3. Vykreslíme klientskou komponentu
  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}