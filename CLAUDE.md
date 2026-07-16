@AGENTS.md
@AGENTS.md

# Projekt: My Creative Stamp Eshop

## Stack
- Next.js 14+ (App Router, TypeScript)
- Supabase (databáze, autentizace, RLS)
- Vercel (hosting)
- Vercel Blob (ukládání obrázků)
- Stripe (platby)

## Struktura projektu
- /src/app – stránky a API routes
- /src/components – React komponenty
- /src/lib – pomocné funkce (supabase.ts, stripe.ts atd.)

## Důležitá pravidla
- Vždy používej TypeScript
- Používej Tailwind CSS pro styly
- API routes jsou v /src/app/api/

## Aktuálně řešíme
- HTML5 editor fotek a textu (StampEditor komponenta)
- Upload přes Vercel Blob (/api/upload-stamp)