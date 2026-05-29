import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'stamp-data.jpg';

    const body = await request.blob();

    if (body.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Soubor je příliš velký (max 20 MB)' }, { status: 413 });
    }

    if (!ALLOWED_MIME_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: 'Nepodporovaný typ souboru. Povoleny jsou: JPEG, PNG, WebP' },
        { status: 415 }
      );
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = await put(safeFilename, body, { access: 'public' });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Chyba při nahrávání do Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Nahrávání do cloudového úložiště selhalo' },
      { status: 500 }
    );
  }
}
