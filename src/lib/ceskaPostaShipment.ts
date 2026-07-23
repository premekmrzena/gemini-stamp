import { Order } from '@/types/database';
import { CustomsDeclarationItem } from '@/lib/customsDeclaration';
import { COUNTRY_SHIPPING_INFO } from '@/lib/constants';

export type ShipmentPrefix = 'RR' | 'VL' | 'EM';

// shipping_method na objednávce je vždy .name z getShippingOptions() (src/lib/constants.ts),
// ne .id - "Doporučené psaní" je jen desc, uložený název je "Česká republika".
const PREFIX_BY_SHIPPING_METHOD: Record<string, ShipmentPrefix> = {
  'Česká republika': 'RR',
  'Cenné psaní do zahraničí': 'VL',
  EMS: 'EM',
};

export function getShipmentPrefix(shippingMethod: string): ShipmentPrefix | null {
  return PREFIX_BY_SHIPPING_METHOD[shippingMethod] ?? null;
}

// ISO-2 kód bereme přímo z COUNTRY_SHIPPING_INFO (src/lib/constants.ts) - žádná duplicitní
// mapa zemí, jedno místo pravdy. billing_country/shipping_country ukládá český název, ne ISO,
// ČP API ale isoCountry vyžaduje.
export function getCountryIsoCode(countryName: string): string | null {
  if (countryName === 'Česká republika') return 'CZ';
  return COUNTRY_SHIPPING_INFO[countryName]?.iso2 ?? null;
}

/**
 * billing_address_line1/shipping_address_line1 je jedno volné textové pole (viz checkout
 * AddressForm), ČP ale chce ulici a číslo popisné zvlášť. Heuristika: poslední token obsahující
 * číslici je houseNumber, zbytek street. U adres, které nejdou takhle rozdělit (zahraniční
 * formáty, adresy bez čísla), zůstane celý řetězec ve street a houseNumber prázdný - u
 * mezinárodních zásilek to podle testu proti demu nevadí, ČP adresu mimo ČR tak přísně
 * nevaliduje jako tuzemskou (RUIAN).
 */
export function splitAddressLine(addressLine: string): { street: string; houseNumber: string } {
  const parts = addressLine.trim().split(/\s+/);
  const lastPart = parts[parts.length - 1] ?? '';
  if (parts.length > 1 && /\d/.test(lastPart)) {
    return { street: parts.slice(0, -1).join(' '), houseNumber: lastPart };
  }
  return { street: addressLine.trim(), houseNumber: '' };
}

export type ParcelServiceRequestResult =
  | { ok: true; request: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * Sestaví request tělo pro POST /parcelService, přesně podle kombinací ověřených proti demo
 * API (viz paměť projektu) - RR + služba 50, VL + služba 7 (+ insuredValue + celní prohlášení
 * category "91"), EM + služba 43 (+ celní prohlášení, vyžaduje kontakt na příjemce).
 */
export function buildParcelServiceRequest(
  order: Order,
  customsItems: CustomsDeclarationItem[] | null,
  headerConfig: { customerID: string; postCode: string; locationNumber: number }
): ParcelServiceRequestResult {
  const prefix = getShipmentPrefix(order.shipping_method);
  if (!prefix) {
    return { ok: false, error: `Nepodporovaný způsob dopravy pro podání u České pošty: "${order.shipping_method}"` };
  }

  const recipientFirstName = order.shipping_is_different ? order.shipping_first_name : order.billing_first_name;
  const recipientLastName = order.shipping_is_different ? order.shipping_last_name : order.billing_last_name;
  const recipientAddressLine = order.shipping_is_different ? order.shipping_address_line1 : order.billing_address_line1;
  const recipientCity = order.shipping_is_different ? order.shipping_city : order.billing_city;
  const recipientZip = order.shipping_is_different ? order.shipping_zip : order.billing_zip;
  const recipientCountryName = order.shipping_is_different ? order.shipping_country : order.billing_country;
  const recipientPhone = order.shipping_is_different ? order.shipping_phone : order.billing_phone;

  const isoCountry = getCountryIsoCode(recipientCountryName || 'Česká republika');
  if (!isoCountry) {
    return { ok: false, error: `Neznámá cílová země, chybí ISO kód: "${recipientCountryName}"` };
  }

  const { street, houseNumber } = splitAddressLine(recipientAddressLine);
  const totalWeightKg = order.cart_items.reduce((sum, i) => sum + (i.weight_grams * i.quantity) / 1000, 0);

  const parcelAddress: Record<string, unknown> = {
    firstName: recipientFirstName,
    surname: recipientLastName,
    address: {
      street,
      houseNumber,
      city: recipientCity,
      zipCode: recipientZip,
      isoCountry,
    },
  };
  if (recipientPhone) parcelAddress.mobilNumber = recipientPhone;
  if (order.billing_email) parcelAddress.emailAddress = order.billing_email;

  const parcelParams: Record<string, unknown> = {
    recordID: order.id,
    prefixParcelCode: prefix,
    weight: totalWeightKg.toFixed(3),
    amount: 0,
    currency: 'CZK',
  };

  let parcelServices: string[];
  let parcelCustomsDeclaration: Record<string, unknown> | undefined;

  if (prefix === 'RR') {
    parcelServices = ['50'];
  } else {
    if (!customsItems || customsItems.length === 0) {
      return { ok: false, error: 'Mezinárodní zásilka bez položek celního prohlášení.' };
    }
    const missingHsCode = customsItems.find((i) => !i.hsCode);
    if (missingHsCode) {
      return { ok: false, error: `Položce "${missingHsCode.customCont}" chybí HS kód.` };
    }

    const declaredValue = Math.max(1, customsItems.reduce((sum, i) => sum + i.customVal, 0));
    parcelCustomsDeclaration = {
      category: '91',
      customValCur: 'CZK',
      // "weight" v ParcelCustomGoods musí být string dle vzoru "\d{1,5}(\.\d{1,3})?" (ověřeno
      // proti demu - number selže s "Instance type (number) does not match ... string").
      parcelCustomGoods: customsItems.map((item) => ({ ...item, weight: item.weight.toFixed(3) })),
    };

    if (prefix === 'VL') {
      parcelParams.insuredValue = declaredValue;
      parcelServices = ['7'];
    } else {
      parcelServices = ['43'];
    }
  }

  return {
    ok: true,
    request: {
      parcelServiceHeader: {
        parcelServiceHeaderCom: {
          transmissionDate: new Date().toISOString().slice(0, 10),
          customerID: headerConfig.customerID,
          postCode: headerConfig.postCode,
          locationNumber: headerConfig.locationNumber,
        },
      },
      parcelServiceData: {
        parcelParams,
        parcelServices,
        parcelAddress,
        ...(parcelCustomsDeclaration ? { parcelCustomsDeclaration } : {}),
      },
    },
  };
}
