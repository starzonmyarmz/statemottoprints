import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { products } from "./products.mjs";
import { client } from "./etsy.mjs";

const HOLD = new Set(["de"]);

const { values: args } = parseArgs({ options: { only: { type: "string" } } });
const only = args.only?.toLowerCase().split(",").map((s) => s.trim());

const progress = JSON.parse(readFileSync(new URL("./uploaded.json", import.meta.url), "utf8"));
const etsy = await client();
const { shop_id } = await etsy.get("/users/me");

for (const p of products) {
  if (HOLD.has(p.abbr) || (only && !only.includes(p.abbr))) continue;
  const id = progress[p.abbr].listing_id;
  const { state } = await etsy.get(`/listings/${id}`);
  if (state === "active") {
    console.log(`${p.abbr.toUpperCase()}  already active`);
    continue;
  }
  const res = await etsy.patch(`/shops/${shop_id}/listings/${id}`, new URLSearchParams({ state: "active" }));
  console.log(`${p.abbr.toUpperCase()}  ${res.state}  https://www.etsy.com/listing/${id}`);
}
