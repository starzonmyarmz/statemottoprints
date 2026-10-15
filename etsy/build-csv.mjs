import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "./products.mjs";
import { PRICE, description, stateDir, tags, title } from "./listing.mjs";
import { originalShot, sceneOutputs, webArtOutput } from "./mockups.mjs";

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

const images = (p) => [...sceneOutputs(p).slice(0, 1), originalShot(p), ...sceneOutputs(p).slice(1), webArtOutput(p)].filter(Boolean);

const header = [
  "Listing Title",
  "Description",
  "Tags",
  "Price",
  "SKU",
  "Who",
  "What",
  "When",
  "Where",
  "Type",
  "Processing Min",
  "Processing Max",
  "Is Supply",
  "Source Folder",
  "Suggested Images",
];

const rows = products.map((p) => [
  title(p),
  description(p),
  tags(p).join(", "),
  PRICE,
  `SMP-${p.abbr.toUpperCase()}`,
  p.who,
  p.what,
  p.occ,
  p.state,
  "Digital download",
  0,
  0,
  "FALSE",
  stateDir(p),
  images(p).join(" | "),
]);

const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";

const out = join(dirname(fileURLToPath(import.meta.url)), "listings.csv");
writeFileSync(out, "﻿" + csv);

const overTitle = rows.filter((r) => r[0].length > 140);
const badTags = rows.filter((r) => r[2].split(", ").length > 13);
const longTags = rows.filter((r) => r[2].split(", ").some((t) => t.length > 20));
const missingImg = rows.filter((r) => !r[14].split(" | ").some((p) => existsSync(p)));

console.log(`wrote ${rows.length} listings -> ${out}`);
console.log(`titles over 140 chars: ${overTitle.length}`);
console.log(`rows over 13 tags: ${badTags.length}`);
console.log(`tags over 20 chars: ${longTags.length}`);
console.log(`rows with no matching image: ${missingImg.length}`);
for (const r of missingImg) console.log("  MISSING", r[4]);
for (const r of longTags) console.log("  ", r[2].split(", ").filter((t) => t.length > 20));
for (const r of overTitle) console.log("  TITLE", r[0].length, r[0]);