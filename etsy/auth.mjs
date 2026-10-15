import { createHash, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TOKEN_PATH, TOKEN_URL, loadCredentials, writeSecret } from "./etsy.mjs";

const SCOPES = ["listings_r", "listings_w", "shops_r"];
const PENDING_PATH = join(dirname(fileURLToPath(import.meta.url)), "etsy-auth-pending.json");

const creds = loadCredentials();
const redirected = process.argv[2];

if (!redirected) {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("hex");
  writeSecret(PENDING_PATH, { verifier, state });

  const url = new URL("https://www.etsy.com/oauth/connect");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: creds.keystring,
    redirect_uri: creds.redirect_uri,
    scope: SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  execFile("open", [url.toString()]);
  console.log("Opened Etsy in your browser. Click Allow, then copy the full URL you land on and run:");
  console.log('  node auth.mjs "<that URL>"\n');
  console.log(url.toString());
  process.exit(0);
}

if (!existsSync(PENDING_PATH)) throw new Error("No pending authorization. Run node auth.mjs first.");
const { verifier, state } = JSON.parse(readFileSync(PENDING_PATH, "utf8"));

const pasted = new URL(redirected.trim());
if (pasted.searchParams.get("state") !== state) throw new Error("State mismatch — that URL is from an older attempt. Run node auth.mjs again.");
const code = pasted.searchParams.get("code");
if (!code) throw new Error(`No code in that URL: ${pasted.searchParams.get("error_description") ?? pasted}`);

const res = await fetch(TOKEN_URL, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: creds.keystring,
    redirect_uri: creds.redirect_uri,
    code,
    code_verifier: verifier,
  }),
});
if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);

const token = await res.json();
writeSecret(TOKEN_PATH, { ...token, expires_at: Date.now() + token.expires_in * 1000 });
rmSync(PENDING_PATH);
console.log("Authorized. Token saved. Next: node upload.mjs --only al");
