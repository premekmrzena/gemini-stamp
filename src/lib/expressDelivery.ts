// Expres doručení na hotel v Praze (docs/14-plan-marketing-2026-10.md, bod 3).
// Doručuje majitel osobně, jen v pracovní dny (víkendy a české státní svátky ne):
// - objednávka v pracovní den do 14:00 = doručení další pracovní den,
// - po 14:00 o pracovní den později - ledaže následuje volno (pátek, den před svátkem),
//   to se arch připraví přes volno a doručí se hned první pracovní den (pátek -> pondělí),
// - objednávka o víkendu/svátku = doručení první pracovní den (rozhodnutí 2026-10-21).
// Počítá se v pražském čase - shodně na klientovi (zobrazení termínu) i na serveru
// (create-order, autoritativní kontrola data odjezdu).

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

// Velikonoční neděle (anonymní gregoriánský algoritmus) - z ní Velký pátek a Velikonoční pondělí.
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const dayOfMonth = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, dayOfMonth));
}

// České státní svátky a ostatní svátky dle zákona č. 245/2000 Sb. (MM-DD).
const FIXED_HOLIDAYS = ['01-01', '05-01', '05-08', '07-05', '07-06', '09-28', '10-28', '11-17', '12-24', '12-25', '12-26'];

function isHoliday(day: Date): boolean {
  if (FIXED_HOLIDAYS.includes(day.toISOString().slice(5, 10))) return true;
  const easter = easterSunday(day.getUTCFullYear()).getTime();
  return day.getTime() === easter - 2 * DAY_MS || day.getTime() === easter + DAY_MS;
}

const isWorkingDay = (day: Date) => day.getUTCDay() !== 0 && day.getUTCDay() !== 6 && !isHoliday(day);

function nextWorkingDay(day: Date): Date {
  let next = new Date(day.getTime() + DAY_MS);
  while (!isWorkingDay(next)) next = new Date(next.getTime() + DAY_MS);
  return next;
}

/** Den doručení na hotel ve tvaru YYYY-MM-DD pro objednávku vytvořenou v `now`. */
export function getExpressDeliveryDate(now: Date = new Date()): string {
  const { day, hour } = pragueNow(now);
  const next = nextWorkingDay(day);
  const tomorrowIsOff = !isWorkingDay(new Date(day.getTime() + DAY_MS));
  const deliveryDay =
    !isWorkingDay(day) || hour < EXPRESS_CUTOFF_HOUR || tomorrowIsOff ? next : nextWorkingDay(next);
  return deliveryDay.toISOString().slice(0, 10);
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
