import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CurrencyCode } from '@/types/database';

// Service role klient - stejný důvod jako u /api/admin/update-order a /api/admin/save-product
// (viz komentáře tam): přímý update z prohlížeče umí zablokovat firemní proxy na straně
// adminovy sítě (Cisco WSA na VPN cpost.cz, viz paměť projektu). Klient se vytváří až uvnitř
// handleru, ne při načtení modulu (chybějící env proměnná by jinak shodila celý build).
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type UpdateExchangeRateBody = {
  currencyCode: CurrencyCode;
  rate: number | null;
};

export async function POST(request: Request) {
  try {
    const { currencyCode, rate }: UpdateExchangeRateBody = await request.json();

    if (!currencyCode) {
      return NextResponse.json({ error: 'Chybí měna.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('exchange_rates')
      .update({ rate_to_eur: rate, updated_at: new Date().toISOString() })
      .eq('currency_code', currencyCode)
      .select()
      .single();

    if (error) {
      console.error('Chyba při ukládání kurzu:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rate: data });
  } catch (error) {
    console.error('Chyba při ukládání kurzu:', error);
    return NextResponse.json({ error: 'Uložení kurzu selhalo.' }, { status: 500 });
  }
}
