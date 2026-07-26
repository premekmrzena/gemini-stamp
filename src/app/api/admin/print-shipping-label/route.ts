import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ceskaPostaRequest, getCeskaPostaConfig } from '@/lib/ceska-posta';

// idForm 101 = "Harmonized label, samostatný" - běžný A4 tisk (ne Zebra termotiskárna).
// Snadno změnitelné, pokud se pořídí štítková tiskárna - viz docs/api/ceska-posta-b2b-zsk-1.13.0.yaml
// (schema IdForm) pro další kódy (200/201/202 = Zebra 105x148/100x150/100x125).
const LABEL_FORM_ID = 101;

// Vrací PDF adresního štítku pro už podanou zásilku (POST /parcelPrinting, ZSK služba) -
// stejný `inline` PDF response pattern jako /api/admin/idoklad-invoice-pdf.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'Chybí orderId.' }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('tracking_number')
    .eq('id', orderId)
    .single();

  if (error || !order?.tracking_number) {
    return NextResponse.json({ error: 'Objednávka nemá sledovací číslo (zásilka zatím nebyla podána).' }, { status: 404 });
  }

  try {
    const env = process.env.CESKA_POSTA_API_ENV === 'live' ? 'live' : 'demo';
    const config = getCeskaPostaConfig(env);

    if (!config.customerID) {
      return NextResponse.json({ error: `Chybí CUSTOMER_ID konfigurace pro prostředí "${env}".` }, { status: 500 });
    }

    const { ok, data } = await ceskaPostaRequest(env, 'zsk', '/parcelPrinting', {
      method: 'POST',
      body: {
        printingHeader: {
          customerID: config.customerID,
          idForm: LABEL_FORM_ID,
          shiftHorizontal: 0,
          shiftVertical: 0,
        },
        printingData: [order.tracking_number],
      },
    });

    if (!ok) {
      return NextResponse.json({ error: 'Česká pošta odmítla request na tisk štítku.', detail: data }, { status: 502 });
    }

    const responseData = data as { printingDataResult?: string };
    if (!responseData.printingDataResult) {
      return NextResponse.json({ error: 'Česká pošta nevrátila žádný štítek.', detail: data }, { status: 502 });
    }

    const pdfBuffer = Buffer.from(responseData.printingDataResult, 'base64');
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="stitek-${order.tracking_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Chyba při tisku štítku České pošty:', err);
    return NextResponse.json({ error: 'Tisk štítku selhal.' }, { status: 500 });
  }
}
