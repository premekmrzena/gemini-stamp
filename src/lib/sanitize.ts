import sanitizeHtml from 'sanitize-html';

// isomorphic-dompurify (jsdom pod kapotou) na produkci (Vercel/Turbopack) padalo na
// `ERR_REQUIRE_ESM` v transitivní závislosti jsdom → html-encoding-sniffer →
// @exodus/bytes (viz docs/13-marketing.md, incident 2026-08-16: 500 na KAŽDÉ
// /produkt/[id] stránce, protože jsdom se inicializuje hned při importu modulu).
// sanitize-html je čistě JS/CJS, bez jsdom - bezpečné pro serverless bundling.
const ALLOWED_TAGS = ['h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'p', 'br'];

export function sanitizeDescriptionHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });
}
