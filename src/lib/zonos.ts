import { Order } from '@/types/database';
import { CustomsDeclarationItem } from '@/lib/customsDeclaration';
import { getOrderRecipientAddress } from '@/lib/ceskaPostaShipment';

const ZONOS_API_URL = 'https://api.zonos.com/graphql';

// Skutečná podací adresa (potvrzeno uživatelem 2026-08-03) - partyInput ORIGIN pro
// declarationCreateWorkflow. NE sídlo firmy.
const ZONOS_ORIGIN_ADDRESS = {
  countryCode: 'CZ',
  postalCode: '25101',
  locality: 'Světice',
  line1: 'Nad studánkou 393',
};

// ČP nevyžaduje declarationId u zásilek nad 800 USD (jiný celní režim) - viz docs/10.
const ZONOS_DECLARATION_VALUE_LIMIT_USD = 800;

export function getZonosConfig(): { apiKey: string } {
  const apiKey = process.env.ZONOS_API_KEY;
  if (!apiKey) {
    throw new Error('Chybí env proměnná ZONOS_API_KEY - Zonos účet ještě není napojený (registrace + platební karta musí proběhnout ručně, viz docs/10).');
  }
  return { apiKey };
}

type ZonosGraphqlResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function zonosGraphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  apiKey: string
): Promise<ZonosGraphqlResult<T>> {
  const res = await fetch(ZONOS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', credentialToken: apiKey },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    return { ok: false, error: json.errors.map((e: { message: string }) => e.message).join('; ') };
  }
  return { ok: true, data: json.data as T };
}

/**
 * Zonos "*Workflow" mutace sdílené v JEDNÉ GraphQL request se implicitně provazují server-side
 * (potvrzeno proti živému schématu 2026-08-03 - viz docs/10) - žádné explicitní rootId/cartId
 * mezi nimi netřeba, pokud běží společně. Vrací jen "quote" (LandedCost) - žádná finanční akce,
 * karta se autorizuje/zadrží až u declarationCreateWorkflow (druhý, samostatný request níže).
 */
const LANDED_COST_QUOTE_MUTATION = `
  mutation CreateLandedCostQuote(
    $parties: [PartyCreateWorkflowInput!]!
    $items: [ItemCreateWorkflowInput!]!
    $shipmentRating: ShipmentRatingCreateWorkflowInput!
    $landedCostConfig: LandedCostWorkFlowInput!
  ) {
    partyCreateWorkflow(input: $parties) { id type }
    itemCreateWorkflow(input: $items) { id productId }
    shipmentRatingCreateWorkflow(input: $shipmentRating) { id amount }
    landedCostCalculateWorkflow(input: $landedCostConfig) {
      id
      amountSubtotals { duties taxes fees shipping items landedCostTotal discounts }
    }
  }
`;

/**
 * Samostatný request - vytvoří skutečnou Declaration (a spustí autorizaci karty), referencí na
 * landedCostId z předchozího requestu. "source: POST" = declarace pro Českou poštu (viz memory).
 */
const DECLARATION_CREATE_MUTATION = `
  mutation CreateDeclarationFromLandedCost($input: DeclarationCreateWorkflowInput!) {
    declarationCreateWorkflow(input: $input) { id }
  }
`;

type LandedCostQuoteData = {
  landedCostCalculateWorkflow: { id: string; amountSubtotals: Record<string, number> | null }[] | null;
};

type DeclarationCreateData = {
  declarationCreateWorkflow: { id: string }[] | null;
};

export type ZonosDeclarationResult =
  | { ok: true; declarationId: string; amountSubtotals: Record<string, number> | null }
  | { ok: false; error: string };

/**
 * Získá Zonos Declaration ID pro zásilku do USA/Portorika - dvoukrokové volání (viz komentáře
 * u mutací výše): 1) quote landed cost (bez finančního dopadu), 2) vytvoření deklarace ze
 * získaného landedCostId (tady se autorizuje karta, 5denní platnost - viz docs/10).
 * usdCustomsItems musí už být v USD (viz convertCustomsItemsToUsd v customsDeclaration.ts).
 */
export async function createZonosDeclaration(
  order: Order,
  isoCountry: 'US' | 'PR',
  usdCustomsItems: CustomsDeclarationItem[],
  totalCustomsValueUsd: number,
  shippingCostUsd: number,
  apiKey: string
): Promise<ZonosDeclarationResult> {
  if (totalCustomsValueUsd >= ZONOS_DECLARATION_VALUE_LIMIT_USD) {
    return {
      ok: false,
      error: `Celní hodnota zásilky (${totalCustomsValueUsd.toFixed(2)} USD) přesahuje limit ${ZONOS_DECLARATION_VALUE_LIMIT_USD} USD - Česká pošta v tomhle případě declarationId nevyžaduje, řeš zásilku mimo tenhle flow (jiný celní režim).`,
    };
  }
  if (usdCustomsItems.length === 0) {
    return { ok: false, error: 'Celní prohlášení bez položek.' };
  }

  const recipient = getOrderRecipientAddress(order);

  const parties = [
    {
      type: 'DESTINATION',
      location: {
        countryCode: isoCountry,
        administrativeArea: recipient.region || undefined,
        postalCode: recipient.zip,
        locality: recipient.city,
        line1: recipient.addressLine1,
        line2: recipient.addressLine2 || undefined,
      },
      person: {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        phone: recipient.phone || undefined,
        email: order.billing_email || undefined,
      },
    },
    {
      type: 'ORIGIN',
      location: ZONOS_ORIGIN_ADDRESS,
    },
  ];

  const items = usdCustomsItems.map((item) => ({
    productId: String(item.sequence),
    name: item.customCont,
    description: item.customCont,
    hsCode: item.hsCode,
    amount: item.customVal,
    currencyCode: 'USD',
    countryOfOrigin: 'CZ',
    quantity: item.quantity,
  }));

  const shipmentRating = {
    amount: shippingCostUsd,
    currencyCode: 'USD',
    serviceLevelCode: 'postal_de_minimis_us',
  };

  const landedCostConfig = {
    endUse: 'NOT_FOR_RESALE',
    calculationMethod: 'DDP',
    currencyCode: 'USD',
    tariffRate: 'ZONOS_PREFERRED',
  };

  const quoteRes = await zonosGraphqlRequest<LandedCostQuoteData>(
    LANDED_COST_QUOTE_MUTATION,
    { parties, items, shipmentRating, landedCostConfig },
    apiKey
  );
  if (!quoteRes.ok) return { ok: false, error: `Zonos odmítl výpočet cla: ${quoteRes.error}` };

  const landedCost = quoteRes.data.landedCostCalculateWorkflow?.[0];
  if (!landedCost?.id) return { ok: false, error: 'Zonos nevrátil landed cost ID.' };

  const declarationRes = await zonosGraphqlRequest<DeclarationCreateData>(
    DECLARATION_CREATE_MUTATION,
    { input: { landedCostIds: [landedCost.id], source: 'POST' } },
    apiKey
  );
  if (!declarationRes.ok) return { ok: false, error: `Zonos odmítl vytvoření deklarace: ${declarationRes.error}` };

  const declaration = declarationRes.data.declarationCreateWorkflow?.[0];
  if (!declaration?.id) return { ok: false, error: 'Zonos nevrátil declarationId.' };

  return { ok: true, declarationId: declaration.id, amountSubtotals: landedCost.amountSubtotals };
}
