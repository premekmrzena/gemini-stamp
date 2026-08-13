import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OrderStatus } from '@/types/database';
import { ORDER_STATUS_TRANSITIONS } from '@/lib/constants';

// Service role klient - jediné místo v appce, které ho používá. Přímý PATCH na
// orders?id=eq... z prohlížeče (i pod authenticated session s korektním RLS, viz
// docs/sql/028) umí zablokovat firemní proxy na straně adminovy sítě (ověřeno
// 2026-07-27: Cisco WSA na VPN České pošty vrací vlastní HTML 405 bez CORS hlaviček,
// prohlížeč to pak nesprávně hlásí jako "blocked by CORS"). Tahle route zápis provede
// server-side (Vercel -> Supabase) - z prohlížeče jde jen běžný POST na vlastní doménu,
// který firemní proxy neřeší.
// Klient se vytváří až uvnitř handleru (ne při načtení modulu) - chybějící env
// proměnná by jinak shodila celý produkční build (viz "supabaseKey is required"
// v build logu 2026-08-03, chybějící SUPABASE_SERVICE_ROLE_KEY na Vercelu -
// touhle chybou byl produkční build rozbitý od 27.7. do 3.8., žádný push
// mezitím se nikdy nenasadil).
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

    const supabaseAdmin = getSupabaseAdmin();

    // Validace přechodu stavu (viz ORDER_STATUS_TRANSITIONS) - musí sedět server-side,
    // klient (dashboard select) zúžení jen zrcadlí pro UX, dá se obejít přímým voláním
    // téhle route. Nevalidovat, pokud se stav vůbec nemění (žádný skok) ani pokud request
    // mění jen trackingNumber.
    if (status) {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json({ error: 'Objednávka nenalezena.' }, { status: 404 });
      }

      const currentStatus = existing.status as OrderStatus;
      const allowedNext = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

      if (status !== currentStatus && !allowedNext.includes(status)) {
        return NextResponse.json(
          {
            error: allowedNext.length
              ? `Přechod z „${currentStatus}“ na „${status}“ není povolený. Povolené další stavy: ${allowedNext.join(', ')}.`
              : `Stav „${currentStatus}“ je konečný, nejde z něj dál měnit.`,
          },
          { status: 409 }
        );
      }
    }

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
