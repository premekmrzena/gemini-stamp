import { NextResponse } from 'next/server';
import { ceskaPostaRequest, getCeskaPostaConfig } from '@/lib/ceska-posta';
import { buildParcelServiceRequest } from '@/lib/ceskaPostaShipment';
import { Order } from '@/types/database';
import { CustomsDeclarationItem } from '@/lib/customsDeclaration';

type CreateShipmentBody = {
  order: Order;
  customsItems: CustomsDeclarationItem[] | null;
};

export async function POST(request: Request) {
  try {
    const { order, customsItems }: CreateShipmentBody = await request.json();

    if (!order?.id) {
      return NextResponse.json({ error: 'Chybí objednávka.' }, { status: 400 });
    }

    // Bez explicitního přepnutí na "live" se posílá vždy jen proti demo prostředí ČP -
    // dokud nebude integrace naostro schválená a otestovaná, viz paměť projektu.
    const env = process.env.CESKA_POSTA_API_ENV === 'live' ? 'live' : 'demo';
    const config = getCeskaPostaConfig(env);

    if (!config.customerID || !config.postCode || !config.locationNumber) {
      return NextResponse.json(
        { error: `Chybí konfigurace podacího místa pro prostředí "${env}" (CUSTOMER_ID/POST_CODE/LOCATION_NUMBER).` },
        { status: 500 }
      );
    }

    const built = buildParcelServiceRequest(order, customsItems, {
      customerID: config.customerID,
      postCode: config.postCode,
      locationNumber: config.locationNumber,
    });

    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }

    const { ok, data } = await ceskaPostaRequest(env, 'zsk', '/parcelService', {
      method: 'POST',
      body: built.request,
    });

    if (!ok) {
      return NextResponse.json({ error: 'Česká pošta odmítla request.', detail: data }, { status: 502 });
    }

    const responseData = data as {
      responseHeader?: {
        resultHeader?: { responseCode: number; responseText: string };
        resultParcelData?: { parcelCode: string; parcelStateResponse?: { responseCode: number; responseText: string }[] }[];
      };
    };

    const resultHeader = responseData.responseHeader?.resultHeader;
    const parcelResult = responseData.responseHeader?.resultParcelData?.[0];
    const parcelCode = parcelResult?.parcelCode;

    if (resultHeader?.responseCode !== 1 || !parcelCode) {
      return NextResponse.json(
        { error: 'Česká pošta zásilku nepřijala.', detail: responseData.responseHeader },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      env,
      parcelCode,
      warnings: parcelResult?.parcelStateResponse?.filter((r) => r.responseCode !== 1) ?? [],
    });
  } catch (error) {
    console.error('Chyba při podání zásilky u České pošty:', error);
    return NextResponse.json({ error: 'Podání zásilky selhalo.' }, { status: 500 });
  }
}
