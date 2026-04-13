import { Resend } from 'resend';

// Tímto zajistíme, že build nespadne, pokud klíč chybí
// Resend se zinicializuje s prázdným stringem jen pro potřeby buildu
const apiKey = process.env.RESEND_API_KEY || 're_placeholder';

export const resend = new Resend(apiKey);