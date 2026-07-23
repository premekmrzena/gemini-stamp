import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Agent } from "undici";

// Servery ČP nAPI běží na certifikátu z jejich vlastní CA (PostSignum), kterou Node
// nemá v defaultní sadě důvěryhodných kořenů. Bez tohoto agenta selže TLS handshake
// s "self-signed certificate in certificate chain" - a to i v produkci na Vercelu,
// ne jen lokálně. NODE_EXTRA_CA_CERTS nejde použít, protože Next.js načítá .env až
// po startu Node procesu (pozdě na inicializaci TLS), proto CA vážeme přímo na fetch.
const postSignumRootCA = fs.readFileSync(
  path.join(process.cwd(), "src/lib/certs/postsignum-root-qca4.pem"),
  "utf8"
);
const postSignumAgent = new Agent({ connect: { ca: postSignumRootCA } });

// Každá B2B služba ČP (ZSK = zásilky, CIS = číselníky, ...) běží na vlastní cestě
// pod stejným HMAC auth schématem, viz jejich OpenAPI specs v docs/api/.
const SERVICE_PATHS = {
  zsk: "ZSKService/v1",
  cis: "CISService/v1",
} as const;

type CeskaPostaService = keyof typeof SERVICE_PATHS;
export type CeskaPostaEnv = "demo" | "live";

function getBaseUrl(env: CeskaPostaEnv, service: CeskaPostaService) {
  const host = env === "demo" ? "b2b-test.postaonline.cz" : "b2b.postaonline.cz";
  return `https://${host}:444/restservices/${SERVICE_PATHS[service]}`;
}

export function getCeskaPostaConfig(env: CeskaPostaEnv) {
  const prefix = env === "demo" ? "CESKA_POSTA_DEMO_" : "CESKA_POSTA_LIVE_";

  const idContract = process.env[`${prefix}ID_CONTRACT`];
  const apiToken = process.env[`${prefix}API_TOKEN`];
  const privateKey = process.env[`${prefix}PRIVATE_KEY`];
  const customerID = process.env[`${prefix}CUSTOMER_ID`];
  const postCode = process.env[`${prefix}POST_CODE`];
  const locationNumberRaw = process.env[`${prefix}LOCATION_NUMBER`];
  const locationNumber = locationNumberRaw ? Number(locationNumberRaw) : undefined;

  if (!idContract || !apiToken || !privateKey) {
    throw new Error(`Chybí env proměnné pro Českou poštu (${env}): ${prefix}ID_CONTRACT / API_TOKEN / PRIVATE_KEY`);
  }

  return { idContract, apiToken, privateKey, customerID, postCode, locationNumber };
}

/**
 * Signature = HMAC-SHA256(secretKey, `${contentSha256};${timestamp};${nonce}`).
 * Klíč se použije jako syrové UTF-8 bajty base64 řetězce ze zadání ČP - NE dekódovaný
 * z base64 na bajty (ověřeno proti demo API: dekódovaný klíč = "signature does not match",
 * klíč jako text = 200 OK). Bez těla requestu (GET) se contentSha256 vynechává: `;${timestamp};${nonce}`.
 * Formát hlavičky Authorization vyžaduje mezeru za čárkou (`nonce="...", signature="..."`) -
 * bez mezery vrací ČP "Header Authorization is in invalid format" ještě před kontrolou podpisu.
 */
function signRequest(privateKey: string, timestamp: number, nonce: string, contentSha256?: string) {
  const message = `${contentSha256 ?? ""};${timestamp};${nonce}`;
  const key = Buffer.from(privateKey, "utf8");
  const signature = crypto.createHmac("sha256", key).update(message).digest("base64");
  return `CP-HMAC-SHA256 nonce="${nonce}", signature="${signature}"`;
}

function buildAuthHeaders(apiToken: string, privateKey: string, body?: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID();
  const contentSha256 = body ? crypto.createHash("sha256").update(body).digest("hex") : undefined;

  const headers: Record<string, string> = {
    "Api-Token": apiToken,
    "Authorization-Timestamp": String(timestamp),
    Authorization: signRequest(privateKey, timestamp, nonce, contentSha256),
  };

  if (contentSha256) {
    headers["Authorization-Content-SHA256"] = contentSha256;
  }

  return headers;
}

export async function ceskaPostaRequest(
  env: CeskaPostaEnv,
  service: CeskaPostaService,
  path: string,
  init?: { method?: string; body?: unknown }
) {
  const config = getCeskaPostaConfig(env);
  const body = init?.body !== undefined ? JSON.stringify(init.body) : undefined;
  const authHeaders = buildAuthHeaders(config.apiToken, config.privateKey, body);

  const response = await fetch(`${getBaseUrl(env, service)}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      ...authHeaders,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    // @ts-expect-error - `dispatcher` je nestandardní undici rozšíření fetch(), TS typy z lib.dom.d.ts ho neznají
    dispatcher: postSignumAgent,
  });

  const text = await response.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = text;
  }

  return { status: response.status, ok: response.ok, data: json };
}

/** Ověří platnost přístupových údajů voláním Location (seznam podacích míst) - GET bez těla. */
export async function testCeskaPostaConnection(env: CeskaPostaEnv) {
  const config = getCeskaPostaConfig(env);
  return ceskaPostaRequest(env, "zsk", `/location/idContract/${config.idContract}`);
}
