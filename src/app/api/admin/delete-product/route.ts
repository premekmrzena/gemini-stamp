import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role klient - stejný důvod jako u /api/admin/update-order (viz komentář tam):
// přímý DELETE z prohlížeče na products?... umí zablokovat firemní proxy na straně
// adminovy sítě. Tahle route zápis provede server-side (Vercel -> Supabase).
// Klient se vytváří až uvnitř handleru (ne při načtení modulu) - chybějící env
// proměnná by jinak shodila celý produkční build (viz "supabaseKey is required"
// v build logu 2026-08-03, chybějící SUPABASE_SERVICE_ROLE_KEY na Vercelu).
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { productId }: { productId: string } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Chybí productId.' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from('products').delete().eq('id', productId);

    if (error) {
      console.error('Chyba při mazání produktu:', error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chyba při mazání produktu:', error);
    return NextResponse.json({ error: 'Smazání produktu selhalo.' }, { status: 500 });
  }
}
