import { Order } from '@/types/database';
import { CustomsDeclarationItem, convertCustomsItemsToUsd } from '@/lib/customsDeclaration';
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

export type OrderRecipientAddress = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  zip: string;
  countryName: string;
  phone: string;
};

/**
 * Adresa příjemce - shipping_* pokud je "doručovací adresa jiná" zaškrtnutá, jinak
 * billing_* (checkout formulář to takhle ukládá). Jedno místo pravdy, dřív duplicitní
 * i v ShipmentModal.tsx a nově i v Zonos routu.
 */
export function getOrderRecipientAddress(order: Order): OrderRecipientAddress {
  return {
    firstName: order.shipping_is_different ? order.shipping_first_name : order.billing_first_name,
    lastName: order.shipping_is_different ? order.shipping_last_name : order.billing_last_name,
    addressLine1: order.shipping_is_different ? order.shipping_address_line1 : order.billing_address_line1,
    addressLine2: order.shipping_is_different ? order.shipping_address_line2 : order.billing_address_line2,
    city: order.shipping_is_different ? order.shipping_city : order.billing_city,
    region: order.shipping_is_different ? order.shipping_region : order.billing_region,
    zip: order.shipping_is_different ? order.shipping_zip : order.billing_zip,
    countryName: order.shipping_is_different ? order.shipping_country : order.billing_country,
    phone: order.shipping_is_different ? order.shipping_phone : order.billing_phone,
  };
}

export type UsShipmentContext = {
  declarationId: string;
  czkRateToEur: number | null;
  usdRateToEur: number | null;
};

// Skutečná podací adresa (stejná jako ZONOS_ORIGIN_ADDRESS v src/lib/zonos.ts, NE sídlo
// firmy - vyjde tu stejně, ale je to schválně samostatná konstanta pro tenhle jiný účel).
// Bez tohohle ČP na štítek/do podacího systému doplní odesílatele podle údajů zaregistrovaných
// k podacímu místu (`locationNumber`) - u téhle smlouvy je to osobní jméno, ne název firmy
// (zjištěno 2026-08-05 z reálně vytištěného štítku).
const SENDER_ADDRESS = {
  companyName: 'DVKS s.r.o.',
  street: 'Nad Studánkou',
  houseNumber: '393',
  city: 'Světice',
  zipCode: '25101',
  isoCountry: 'CZ',
};

/**
 * Sestaví request tělo pro POST /parcelService, přesně podle kombinací ověřených proti demo
 * API (viz paměť projektu) - RR + služba 50, VL + služba 7 (+ insuredValue + celní prohlášení
 * category "91"), EM + služba 43 (+ celní prohlášení, vyžaduje kontakt na příjemce).
 */
export function buildParcelServiceRequest(
  order: Order,
  customsItems: CustomsDeclarationItem[] | null,
  headerConfig: { customerID: string; postCode: string; locationNumber: number },
  usContext?: UsShipmentContext
): ParcelServiceRequestResult {
  const prefix = getShipmentPrefix(order.shipping_method);
  if (!prefix) {
    return { ok: false, error: `Nepodporovaný způsob dopravy pro podání u České pošty: "${order.shipping_method}"` };
  }

  const recipient = getOrderRecipientAddress(order);
  const recipientFirstName = recipient.firstName;
  const recipientLastName = recipient.lastName;
  const recipientAddressLine = recipient.addressLine1;
  const recipientAddressLine2 = recipient.addressLine2;
  const recipientCity = recipient.city;
  const recipientRegion = recipient.region;
  const recipientZip = recipient.zip;
  const recipientCountryName = recipient.countryName;
  const recipientPhone = recipient.phone;

  const isoCountry = getCountryIsoCode(recipientCountryName || 'Česká republika');
  if (!isoCountry) {
    return { ok: false, error: `Neznámá cílová země, chybí ISO kód: "${recipientCountryName}"` };
  }

  const { street, houseNumber } = splitAddressLine(recipientAddressLine);
  const totalWeightKg = order.cart_items.reduce((sum, i) => sum + (i.weight_grams * i.quantity) / 1000, 0);

  // AddressCOMMON (ČP schéma, additionalProperties: false) nemá volné pole pro byt/patro/budovu
  // ani pro provincii/stát jako text - jediný kandidát by byl subIsoCountry, ale ten podle
  // popisu čeká ISO kód území, ne text zadaný zákazníkem ("Guangdong", "大阪府"...), takže by ho
  // šlo obsadit jen hádáním. Bezpečnější je připojit obě pole k street/city (obojí volný text,
  // stejně jako u splitAddressLine - ČP mezinárodní adresy nevaliduje tak přísně jako tuzemské).
  const streetWithLine2 = recipientAddressLine2 ? `${street}, ${recipientAddressLine2}` : street;
  const cityWithRegion = recipientRegion ? `${recipientCity}, ${recipientRegion}` : recipientCity;

  const parcelAddress: Record<string, unknown> = {
    firstName: recipientFirstName,
    surname: recipientLastName,
    address: {
      street: streetWithLine2,
      houseNumber,
      city: cityWithRegion,
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

    // USA/Portoriko vyžadují od 1.7.2026 Zonos declarationId + celní hodnotu v USD (ČP jinak
    // vrací 444/445/446, viz paměť projektu) - všechny ostatní mezinárodní zásilky posílají
    // celní hodnotu v order.currency (dřív tu bylo natvrdo "CZK", i pro EUR objednávky - bug).
    const requiresDeclarationId = isoCountry === 'US' || isoCountry === 'PR';
    let declaredCustomsItems = customsItems;
    let customValCur: string = order.currency;

    if (requiresDeclarationId) {
      if (!usContext?.declarationId) {
        return { ok: false, error: 'Zásilka do USA/Portorika vyžaduje Zonos declarationId - nejdřív ho získej tlačítkem výše.' };
      }
      const usdConversion = convertCustomsItemsToUsd(customsItems, order.currency, usContext.czkRateToEur, usContext.usdRateToEur);
      if (!usdConversion.ok) {
        const reasonText = usdConversion.reason === 'CZK_RATE_MISSING' ? 'CZK' : 'USD';
        return { ok: false, error: `Chybí kurz ${reasonText} v adminu ("Kurzy měn") - bez něj nejde spočítat celní hodnotu v USD.` };
      }
      declaredCustomsItems = usdConversion.items;
      customValCur = 'USD';
    }

    const declaredValue = Math.max(1, declaredCustomsItems.reduce((sum, i) => sum + i.customVal, 0));
    parcelCustomsDeclaration = {
      category: '91',
      customValCur,
      ...(requiresDeclarationId ? { declarationId: usContext!.declarationId } : {}),
      // "weight" v ParcelCustomGoods musí být string dle vzoru "\d{1,5}(\.\d{1,3})?" (ověřeno
      // proti demu - number selže s "Instance type (number) does not match ... string").
      parcelCustomGoods: declaredCustomsItems.map((item) => ({ ...item, weight: item.weight.toFixed(3) })),
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
        senderAddress: SENDER_ADDRESS,
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
