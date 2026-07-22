// Ověří, že messages/cs.json a messages/en.json mají přesně stejnou sadu
// klíčů (rekurzivně) - pojistka proti tomu, že při úpravě UI textů (např.
// v košíku/checkoutu) zapomeneš doplnit protějšek v druhém jazyce.
// Spustit ručně: node scripts/check-message-keys.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(dir, '..', 'messages');

function loadKeys(locale) {
  const raw = readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8');
  const json = JSON.parse(raw);
  const keys = new Set();

  function walk(obj, prefix) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        walk(value, fullKey);
      } else {
        keys.add(fullKey);
      }
    }
  }

  walk(json, '');
  return keys;
}

const csKeys = loadKeys('cs');
const enKeys = loadKeys('en');

const missingInEn = [...csKeys].filter((k) => !enKeys.has(k)).sort();
const missingInCs = [...enKeys].filter((k) => !csKeys.has(k)).sort();

if (missingInEn.length === 0 && missingInCs.length === 0) {
  console.log(`OK: cs.json a en.json mají shodnou sadu klíčů (${csKeys.size} klíčů).`);
  process.exit(0);
}

if (missingInEn.length > 0) {
  console.error(`Chybí v en.json (${missingInEn.length}):`);
  for (const key of missingInEn) console.error(`  - ${key}`);
}

if (missingInCs.length > 0) {
  console.error(`Chybí v cs.json (${missingInCs.length}):`);
  for (const key of missingInCs) console.error(`  - ${key}`);
}

process.exit(1);
