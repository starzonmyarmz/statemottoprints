import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "./products.mjs";
import { artFiles } from "./listing.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "banner");
const LOGO = join(DIR, "smp-logo.jpg");
const BG = "#f6f3ee";

const art = (abbr) => artFiles(products.find((p) => p.abbr === abbr))[0];

// Etsy crops the big banner from the sides on phones, so the logo stays centered.
const render = ({ w, h, logoH, artH, left, right, file }) => {
  const slot = (w - logoH * 1.47) / 2 / left.length;
  const layer = (abbr, cx) => [
    "(", art(abbr), "-alpha", "remove", "-trim", "+repage", "-resize", `${Math.round(slot * 0.78)}x${artH}`, ")",
    "-gravity", "west", "-geometry", `+${Math.round(cx)}+0`, "-compose", "multiply", "-composite",
  ];
  const sideArt = [
    ...left.flatMap((a, i) => layer(a, i * slot + slot * 0.11)),
    ...right.flatMap((a, i) => layer(a, w - (right.length - i) * slot + slot * 0.11)),
  ];
  execFileSync("magick", [
    "-size", `${w}x${h}`, `xc:${BG}`,
    ...sideArt,
    "(", LOGO, "-trim", "+repage", "-resize", `x${logoH}`, ")",
    "-gravity", "center", "-geometry", "+0+0", "-compose", "multiply", "-composite",
    join(OUT, file),
  ]);
};

mkdirSync(OUT, { recursive: true });
render({ w: 3360, h: 840, logoH: 620, artH: 470, left: ["ca", "tx", "fl"], right: ["ny", "nh", "mi"], file: "banner-big-3360x840.png" });
render({ w: 1200, h: 300, logoH: 230, artH: 170, left: ["ca", "tx"], right: ["ny", "mi"], file: "banner-mini-1200x300.png" });
console.log(`wrote ${OUT}`);
