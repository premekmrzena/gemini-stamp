import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/types/database';

// Service role klient - stejný důvod jako u /api/admin/update-order (viz komentář tam):
// přímý insert/update z prohlížeče na products?... umí zablokovat firemní proxy na
// straně adminovy sítě. Tahle route zápis provede server-side (Vercel -> Supabase).
// Klient se vytváří až uvnitř handleru (ne při načtení modulu) - chybějící env
// proměnná by jinak shodila celý produkční build (viz "supabaseKey is required"
// v build logu 2026-08-03, chybějící SUPABASE_SERVICE_ROLE_KEY na Vercelu).
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type SaveProductBody = {
  productId?: string;
  payload: Partial<Omit<Product, 'id' | 'created_at'>>;
};

export async function POST(request: Request) {
  try {
    const { productId, payload }: SaveProductBody = await request.json();

    if (!payload) {
      return NextResponse.json({ error: 'Chybí data produktu.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const query = productId
      ? supabaseAdmin.from('products').update(payload).eq('id', productId).select().single()
      : supabaseAdmin.from('products').insert(payload).select().single();

    const { data, error } = await query;

    if (error) {
      console.error('Chyba při ukládání produktu:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Chyba při ukládání produktu:', error);
    return NextResponse.json({ error: 'Uložení produktu selhalo.' }, { status: 500 });
  }
}
