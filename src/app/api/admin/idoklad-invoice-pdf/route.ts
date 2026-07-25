import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getInvoicePdf } from '@/lib/idoklad';

// iDoklad je zdrojem pravdy pro PDF - appka ho neukládá, jen si ho při každém stažení
// znovu vyžádá podle orders.idoklad_invoice_id.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'Chybí orderId.' }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('idoklad_invoice_id, idoklad_invoice_number')
    .eq('id', orderId)
    .single();

  if (error || !order?.idoklad_invoice_id) {
    return NextResponse.json({ error: 'Objednávka nemá vystavenou iDoklad fakturu.' }, { status: 404 });
  }

  try {
    const pdf = await getInvoicePdf(order.idoklad_invoice_id);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="faktura-${order.idoklad_invoice_number || order.idoklad_invoice_id}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Chyba při stahování iDoklad PDF:', err);
    return NextResponse.json({ error: 'Stažení PDF selhalo.' }, { status: 500 });
  }
}
