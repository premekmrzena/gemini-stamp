import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'p', 'br'];

export function sanitizeDescriptionHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}
