import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role klient - stejný důvod jako u /api/admin/update-order (viz komentář tam):
// přímý DELETE z prohlížeče na products?... umí zablokovat firemní proxy na straně
// adminovy sítě. Tahle route zápis provede server-side (Vercel -> Supabase).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { productId }: { productId: string } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Chybí productId.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);

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
