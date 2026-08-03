import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/database';
import { CustomsDeclarationItem, convertCustomsItemsToUsd } from '@/lib/customsDeclaration';
import { getCountryIsoCode, getOrderRecipientAddress } from '@/lib/ceskaPostaShipment';
import { createZonosDeclaration, getZonosConfig } from '@/lib/zonos';
import { convertFromEur, convertToEur } from '@/lib/pricing';

type CreateZonosDeclarationBody = {
  order: Order;
  customsItems: CustomsDeclarationItem[];
};

export async function POST(request: Request) {
  try {
    const { order, customsItems }: CreateZonosDeclarationBody = await request.json();

    if (!order?.id || !customsItems?.length) {
      return NextResponse.json({ error: 'Chybí objednávka nebo položky celního prohlášení.' }, { status: 400 });
    }

    const recipient = getOrderRecipientAddress(order);
    const isoCountry = getCountryIsoCode(recipient.countryName || 'Česká republika');
    if (isoCountry !== 'US' && isoCountry !== 'PR') {
      return NextResponse.json({ error: 'Declaration ID je potřeba jen pro zásilky do USA/Portorika.' }, { status: 400 });
    }

    const { data: rates } = await supabase.from('exchange_rates').select('currency_code, rate_to_eur').in('currency_code', ['CZK', 'USD']);
    const czkRateToEur = rates?.find((r) => r.currency_code === 'CZK')?.rate_to_eur ?? null;
    const usdRateToEur = rates?.find((r) => r.currency_code === 'USD')?.rate_to_eur ?? null;

    const usdItems = convertCustomsItemsToUsd(customsItems, order.currency, czkRateToEur, usdRateToEur);
    if (!usdItems.ok) {
      const reasonText = usdItems.reason === 'CZK_RATE_MISSING' ? 'CZK' : 'USD';
      return NextResponse.json(
        { error: `Chybí kurz ${reasonText} v adminu ("Kurzy měn") - bez něj nejde spočítat celní hodnotu v USD.` },
        { status: 400 }
      );
    }

    const shippingCostEur = order.currency === 'EUR' ? order.shipping_cost : convertToEur(order.shipping_cost, czkRateToEur);
    if (shippingCostEur == null) {
      return NextResponse.json({ error: 'Chybí kurz CZK v adminu ("Kurzy měn") - bez něj nejde přepočítat poštovné do USD.' }, { status: 400 });
    }
    const shippingCostUsd = convertFromEur(shippingCostEur, usdRateToEur);
    if (shippingCostUsd == null) {
      return NextResponse.json({ error: 'Chybí kurz USD v adminu ("Kurzy měn").' }, { status: 400 });
    }

    let apiKey: string;
    try {
      apiKey = getZonosConfig().apiKey;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Chybí konfigurace Zonos.';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const result = await createZonosDeclaration(order, isoCountry, usdItems.items, usdItems.totalUsd, shippingCostUsd, apiKey);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true, declarationId: result.declarationId, amountSubtotals: result.amountSubtotals });
  } catch (error) {
    console.error('Chyba při získávání Zonos Declaration ID:', error);
    return NextResponse.json({ error: 'Získání Declaration ID selhalo.' }, { status: 500 });
  }
}

