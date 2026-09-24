import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

// Formulář "Chci spolupracovat" ze stránky /partners (CK, incomingy, průvodci).
// Nahrazuje mailto, které na mobilu často nic neotevře. Poptávka jde jako prostý
// e-mail na info@, replyTo = odesílatel, takže se odpovídá přímo z Gmailu.
// ref = kód agentury z odkazu v e-mailu (?ref=ck-xxx), ať je jasné, odkud přišla.

const TO = 'info@mycreativestamp.com';
const FROM = 'My Creative Stamp <objednavky@mycreativestamp.com>';
const MAX_LEN = 2000;

function field(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot - skryté pole, které vyplní jen boti. Tváříme se jako úspěch.
  if (field(body.website)) return NextResponse.json({ ok: true });

  const name = field(body.name);
  const agency = field(body.agency);
  const email = field(body.email);
  const phone = field(body.phone, 50);
  const message = field(body.message, MAX_LEN);
  const ref = field(body.ref, 80);
  const lang = field(body.lang, 5);

  if (!name || !agency || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const text = [
    `Kancelář: ${agency}`,
    `Kontaktní osoba: ${name}`,
    `E-mail: ${email}`,
    `Telefon: ${phone || '–'}`,
    `Kód z odkazu (ref): ${ref || '–'}`,
    `Jazyk stránky: ${lang || '–'}`,
    '',
    message || '(bez zprávy)',
  ].join('\n');

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `Spolupráce CK: ${agency}${ref ? ` (${ref})` : ''}`,
    text,
  });

  if (error) {
    console.error('[partner-inquiry] Resend error', error);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
