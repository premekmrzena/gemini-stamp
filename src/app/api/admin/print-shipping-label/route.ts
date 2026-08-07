import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ceskaPostaRequest, getCeskaPostaConfig } from '@/lib/ceska-posta';

// idForm 20 = "adresní štítek bianco - 4x (A4)" - běžný A4 tisk (ne Zebra termotiskárna).
// Původně nastaveno na 101 ("Harmonizovaný štítek") - to je ale určené pro balíkové
// zásilky, ne pro dopisové produkty (Doporučené/Cenné psaní), které eshop posílá; ČP na
// ně vracela 378 INVALID_PREFIX_COMBINATION (ověřeno živě proti demu 2026-08-05, viz
// docs/06). idForm 20 funguje spolehlivě pro RR/VL, ale NE pro EM (EMS) - viz níže.
// Snadno změnitelné, pokud se pořídí štítková tiskárna - viz
// docs/api/ceska-posta-b2b-zsk-1.13.0.yaml (schema IdForm) pro další kódy (200/201/202 =
// Zebra 105x148/100x150/100x125).
const LABEL_FORM_ID_DEFAULT = 20;

// EM (EMS) odmítá idForm 20 (378 INVALID_PREFIX_COMBINATION). Podle AS_formulare_POL.xlsx
// (postaonline.cz/pol/AS_formulare_POL.xlsx, list "Mezinárodní zásilky") je pro EMS správně
// idForm 62 ("AŠ - samostatný EMS zahraničí") - ověřeno živě proti demu 2026-08-07: vrací
// combined dokument "CN 23 EMS" (adresní štítek + celní prohlášení v jednom, ne jen štítek).
// To znamená EM zásilky NEPOTŘEBUJÍ samostatné CN22 navíc - idForm 62 ho v sobě už má.
// idForm 63 je stejný obsah jako 2xA4 varianta, needs-confirm od uživatele který preferuje.
const LABEL_FORM_ID_EM = 62;

// CN22 (celní prohlášení) pro VL (Cenné psaní) je samostatný dokument, NENÍ součástí
// adresního štítku (na rozdíl od EM, viz výš) - ověřeno živě proti demu 2026-08-07,
// idForm 20 na VL parcelCode vytiskne jen štítek bez celních údajů. idForm 56/74/77 (A4/A6
// varianty CN22) fungují pro VL, NEfungují pro EM (INVALID_PARCEL_CODE - tam se netiskne,
// protože ho nepotřebuje). Pro RR se CN22 netiskne vůbec (vnitrostátní, žádné celní řízení).
const CN22_FORM_ID_VL = 56;

function getLabelFormId(parcelCode: string): number {
  return parcelCode.startsWith('EM') ? LABEL_FORM_ID_EM : LABEL_FORM_ID_DEFAULT;
}

// Vrací PDF adresního štítku (nebo CN22 celního prohlášení, ?type=cn22) pro už podanou
// zásilku (POST /parcelPrinting, ZSK služba) - stejný `inline` PDF response pattern jako
// /api/admin/idoklad-invoice-pdf.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const type = searchParams.get('type') === 'cn22' ? 'cn22' : 'label';
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

  if (type === 'cn22' && !order.tracking_number.startsWith('VL')) {
    return NextResponse.json({ error: 'CN22 se tiskne jen pro Cenné psaní (VL) - EMS má celní prohlášení přímo na štítku, RR je vnitrostátní.' }, { status: 400 });
  }

  const idForm = type === 'cn22' ? CN22_FORM_ID_VL : getLabelFormId(order.tracking_number);
  const fileNamePrefix = type === 'cn22' ? 'cn22' : 'stitek';

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
          idForm,
          shiftHorizontal: 0,
          shiftVertical: 0,
        },
        printingData: [order.tracking_number],
      },
    });

    if (!ok) {
      return NextResponse.json({ error: 'Česká pošta odmítla request na tisk dokumentu.', detail: data }, { status: 502 });
    }

    const responseData = data as { printingDataResult?: string };
    if (!responseData.printingDataResult) {
      return NextResponse.json({ error: 'Česká pošta nevrátila žádný dokument.', detail: data }, { status: 502 });
    }

    const pdfBuffer = Buffer.from(responseData.printingDataResult, 'base64');
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileNamePrefix}-${order.tracking_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Chyba při tisku dokumentu České pošty:', err);
    return NextResponse.json({ error: 'Tisk dokumentu selhal.' }, { status: 500 });
  }
}
