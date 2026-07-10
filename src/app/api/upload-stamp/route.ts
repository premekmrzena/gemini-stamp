import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Jediná povolená hnízda složek ve Vercel Blobu – endpoint je veřejný (volá ho
// i nepřihlášený zákazník z editoru), takže se cesta nikdy neskládá z libovolného
// vstupu klienta, jen z tohoto seznamu.
const ALLOWED_FOLDERS = [
  'products/znamky',
  'products/znamkove-archy',
  'products/kreativni-archy',
  'products/fdc',
  'products/plakety',
  'editor-orders',
];

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'stamp-data.jpg';
    const folderParam = searchParams.get('folder');
    const folder = folderParam && ALLOWED_FOLDERS.includes(folderParam) ? folderParam : null;

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
    const pathname = folder ? `${folder}/${safeFilename}` : safeFilename;
    const blob = await put(pathname, body, { access: 'public', addRandomSuffix: true });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Chyba při nahrávání do Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Nahrávání do cloudového úložiště selhalo' },
      { status: 500 }
    );
  }
}
