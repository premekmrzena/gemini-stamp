import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';

// Vypne cachování pro 100% aktuálnost dat
export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Získání ID z URL (pravidla Next.js 15+)
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // 1. Stáhneme detail hlavního produktu
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

  // 2. LOGIKA PRO SOUVISEJÍCÍ PRODUKTY (ARRAY VERSION)
  let relatedProducts: any[] = [];

  // Kontrola, zda máme v poli related_stamp_id nějaká ID
  const hasRelatedIds = product.related_stamp_id && 
                        Array.isArray(product.related_stamp_id) && 
                        product.related_stamp_id.length > 0;

  if (hasRelatedIds) {
    // Stáhneme všechna ID, která jsi ručně vybral v DB
    const { data: related, error: relatedError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .in('id', product.related_stamp_id);

    if (related && !relatedError) {
      relatedProducts = related;
    }
  }

  // FALLBACK: Pokud jsi nic nevybral (nebo se nic nenašlo), ukážeme 3 nejnovější jiné známky
  if (relatedProducts.length === 0) {
    const { data: fallback } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .neq('id', product.id) // Vynecháme aktuální produkt
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (fallback) relatedProducts = fallback;
  }

  // 3. Vykreslení klientské komponenty (kterou jsme už zabezpečili proti stahování)
  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}