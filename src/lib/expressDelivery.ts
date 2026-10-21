// Expres doručení na hotel v Praze (docs/14-plan-marketing-2026-10.md, bod 3).
// Doručuje majitel osobně: objednávka v pracovní den do 14:00 = doručení další pracovní
// den, jinak o pracovní den později. O víkendu se nedoručuje ani nevyřizuje. Státní svátky
// se zatím neřeší. Počítá se v pražském čase - shodně na klientovi (zobrazení termínu)
// i na serveru (create-order, autoritativní kontrola data odjezdu).

export const EXPRESS_HOTEL_ID = 'expres-hotel';
export const EXPRESS_CUTOFF_HOUR = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

// Kalendářní den v Praze jako UTC půlnoc - aritmetika po dnech pak nezávisí na časové
// zóně serveru/prohlížeče ani na přechodu letního času.
function pragueNow(now: Date): { day: Date; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  return { day: new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day)), hour: +parts.hour };
}

const isWorkingDay = (day: Date) => day.getUTCDay() !== 0 && day.getUTCDay() !== 6;

function nextWorkingDay(day: Date): Date {
  let next = new Date(day.getTime() + DAY_MS);
  while (!isWorkingDay(next)) next = new Date(next.getTime() + DAY_MS);
  return next;
}

/** Den doručení na hotel ve tvaru YYYY-MM-DD pro objednávku vytvořenou v `now`. */
export function getExpressDeliveryDate(now: Date = new Date()): string {
  const { day, hour } = pragueNow(now);
  const processingDay = isWorkingDay(day) && hour < EXPRESS_CUTOFF_HOUR ? day : nextWorkingDay(day);
  return nextWorkingDay(processingDay).toISOString().slice(0, 10);
}

/**
 * Host musí v Praze ještě být den po doručení - doručení v den odjezdu (typicky dopoledne
 * check-out) se nedá stihnout spolehlivě. Datum ve tvaru YYYY-MM-DD.
 */
export function isDepartureAfterDelivery(departureDate: string, now: Date = new Date()): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(departureDate) && departureDate > getExpressDeliveryDate(now);
}

/** "Tuesday, 27 October" / "úterý 27. října" podle jazyka webu (next-intl locale). */
export function formatDeliveryDate(isoDate: string, appLocale: string = 'en'): string {
  return new Intl.DateTimeFormat(appLocale === 'cs' ? 'cs-CZ' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`)
  );
}
