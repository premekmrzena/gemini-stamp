import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OrderStatus } from '@/types/database';

// Service role klient - jediné místo v appce, které ho používá. Přímý PATCH na
// orders?id=eq... z prohlížeče (i pod authenticated session s korektním RLS, viz
// docs/sql/028) umí zablokovat firemní proxy na straně adminovy sítě (ověřeno
// 2026-07-27: Cisco WSA na VPN České pošty vrací vlastní HTML 405 bez CORS hlaviček,
// prohlížeč to pak nesprávně hlásí jako "blocked by CORS"). Tahle route zápis provede
// server-side (Vercel -> Supabase) - z prohlížeče jde jen běžný POST na vlastní doménu,
// který firemní proxy neřeší.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type UpdateOrderBody = {
  orderId: string;
  status?: OrderStatus;
  trackingNumber?: string;
};

export async function POST(request: Request) {
  try {
    const { orderId, status, trackingNumber }: UpdateOrderBody = await request.json();

    if (!orderId || (!status && trackingNumber === undefined)) {
      return NextResponse.json({ error: 'Chybí orderId a alespoň jedno pole ke změně.' }, { status: 400 });
    }

    const fields: Partial<Record<'status' | 'tracking_number', string>> = {};
    if (status) fields.status = status;
    if (trackingNumber !== undefined) fields.tracking_number = trackingNumber;

    const { error } = await supabaseAdmin.from('orders').update(fields).eq('id', orderId);

    if (error) {
      console.error('Chyba při aktualizaci objednávky:', error);
      return NextResponse.json({ error: 'Aktualizace objednávky selhala.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chyba při aktualizaci objednávky:', error);
    return NextResponse.json({ error: 'Aktualizace objednávky selhala.' }, { status: 500 });
  }
}
