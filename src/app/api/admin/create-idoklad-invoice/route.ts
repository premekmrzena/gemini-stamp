import { NextResponse } from 'next/server';
import { createInvoiceForOrder, payAndFinalizeProforma } from '@/lib/idoklad';

// Ruční záloha pro admin dashboard - automatika běží u "Zaplaceno" (viz stripe-webhook.ts
// a webhook /api/idoklad-webhook po spárování zálohové faktury), tohle je jen pro dohnání
// selhaného/starého případu. Pokud objednávka má rozvystavenou zálohovou fakturu, vyúčtuje
// ji (stejně jako by to udělal webhook) místo zakládání nové nesouvisející faktury.
export async function POST(request: Request) {
  try {
    const { orderId, idokladProformaId, totalPrice } = (await request.json()) as {
      orderId: string;
      idokladProformaId: number | null;
      totalPrice: number;
    };
    if (!orderId) {
      return NextResponse.json({ error: 'Chybí orderId.' }, { status: 400 });
    }

    const invoice = idokladProformaId
      ? await payAndFinalizeProforma(orderId, idokladProformaId, totalPrice)
      : await createInvoiceForOrder(orderId, { markAsPaid: true });

    if (!invoice) {
      return NextResponse.json({ error: 'Vytvoření faktury selhalo, zkontrolujte server log.' }, { status: 500 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Chyba při ručním vytváření iDoklad faktury:', error);
    return NextResponse.json({ error: 'Vytvoření faktury selhalo.' }, { status: 500 });
  }
}
