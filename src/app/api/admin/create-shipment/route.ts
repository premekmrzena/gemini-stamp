import { NextResponse } from 'next/server';
import { ceskaPostaRequest, getCeskaPostaConfig } from '@/lib/ceska-posta';
import { buildParcelServiceRequest } from '@/lib/ceskaPostaShipment';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/database';
import { CustomsDeclarationItem } from '@/lib/customsDeclaration';

type CreateShipmentBody = {
  order: Order;
  customsItems: CustomsDeclarationItem[] | null;
  declarationId?: string;
};

export async function POST(request: Request) {
  try {
    const { order, customsItems, declarationId }: CreateShipmentBody = await request.json();

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

    // Vždy fetchnout CZK i USD kurz (levné, buildParcelServiceRequest je použije jen u
    // zásilek do USA/Portorika) - stejný vzor jako fetch CZK kurzu v create-order.
    const { data: rates } = await supabase.from('exchange_rates').select('currency_code, rate_to_eur').in('currency_code', ['CZK', 'USD']);
    const czkRateToEur = rates?.find((r) => r.currency_code === 'CZK')?.rate_to_eur ?? null;
    const usdRateToEur = rates?.find((r) => r.currency_code === 'USD')?.rate_to_eur ?? null;

    const built = buildParcelServiceRequest(
      order,
      customsItems,
      {
        customerID: config.customerID,
        postCode: config.postCode,
        locationNumber: config.locationNumber,
      },
      declarationId ? { declarationId, czkRateToEur, usdRateToEur } : undefined
    );

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
      // Dřív se vracela jen obecná hláška "zásilku nepřijala" a ShipmentModal ukazoval
      // pouze `error`, ne `detail` - reálný důvod (responseText/parcelStateResponse) byl
      // vidět jen v server logu, ne v UI. Skládáme čitelnější zprávu rovnou sem.
      const stateReasons = (parcelResult?.parcelStateResponse ?? [])
        .filter((r) => r.responseCode !== 1)
        .map((r) => `${r.responseCode} ${r.responseText}`)
        .join(', ');
      const headerReason = resultHeader ? `${resultHeader.responseCode} ${resultHeader.responseText}` : 'bez odpovědi';
      const reason = stateReasons || headerReason;
      console.error('Česká pošta zásilku nepřijala:', JSON.stringify(responseData.responseHeader));
      return NextResponse.json(
        { error: `Česká pošta zásilku nepřijala: ${reason}`, detail: responseData.responseHeader },
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
