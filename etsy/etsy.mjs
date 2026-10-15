import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
export const CREDENTIALS_PATH = join(DIR, "etsy-credentials.json");
export const TOKEN_PATH = join(DIR, "etsy-token.json");
export const TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";
const API = "https://api.etsy.com/v3/application";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const writeSecret = (path, data) => {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  chmodSync(path, 0o600);
};

export const loadCredentials = () => {
  if (!existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Missing ${CREDENTIALS_PATH}. Copy etsy-credentials.example.json and fill it in.`);
  }
  const c = readJson(CREDENTIALS_PATH);
  for (const k of ["keystring", "shared_secret", "redirect_uri"]) {
    if (!c[k] || c[k].startsWith("PASTE")) throw new Error(`etsy-credentials.json is missing "${k}"`);
  }
  return c;
};

const refresh = async (creds, token) => {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: creds.keystring,
      refresh_token: token.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed (${res.status}): ${await res.text()}\nRun: node auth.mjs`);
  const next = await res.json();
  const saved = { ...next, expires_at: Date.now() + next.expires_in * 1000 };
  writeSecret(TOKEN_PATH, saved);
  return saved;
};

export const client = async () => {
  const creds = loadCredentials();
  if (!existsSync(TOKEN_PATH)) throw new Error("Not authorized yet. Run: node auth.mjs");
  let token = readJson(TOKEN_PATH);

  const call = async (method, path, body) => {
    if (Date.now() > token.expires_at - 60_000) token = await refresh(creds, token);
    const headers = {
      "x-api-key": `${creds.keystring}:${creds.shared_secret}`,
      authorization: `Bearer ${token.access_token}`,
    };
    if (body instanceof URLSearchParams) headers["content-type"] = "application/x-www-form-urlencoded";

    for (let attempt = 1; ; attempt++) {
      const res = await fetch(`${API}${path}`, { method, headers, body });
      if (res.status === 429 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        continue;
      }
      const text = await res.text();
      if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
      return text ? JSON.parse(text) : null;
    }
  };

  return {
    get: (path) => call("GET", path),
    post: (path, body) => call("POST", path, body),
    patch: (path, body) => call("PATCH", path, body),
    del: (path) => call("DELETE", path),
  };
};
