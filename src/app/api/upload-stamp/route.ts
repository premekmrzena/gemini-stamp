import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Pokud nám frontend nepošle jméno, použijeme záložní
    const filename = searchParams.get('filename') || 'stamp-data.png';
    
    // Získáme raw data obrázku (binární buffer) z requestu
    const body = await request.blob();

    // Pošleme to do Vercel Blob (token si to vezme samo z .env.local)
    const blob = await put(filename, body, {
      access: 'public',
    });

    // Vrátíme frontendu úspěšnou odpověď včetně URL adresy nového obrázku
    return NextResponse.json(blob);
    
  } catch (error) {
    console.error('Chyba při nahrávání do Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Nahrávání do cloudového úložiště selhalo' }, 
      { status: 500 }
    );
  }
}