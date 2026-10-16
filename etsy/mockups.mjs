import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { products } from "./products.mjs";
import { artFiles, isLandscape } from "./listing.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(DIR, "mockups/templates");
export const OUT = join(DIR, "mockups/rendered");

const LEGACY = join(DIR, "mockups/legacy");

const PORTRAIT_SCENES_PER_STATE = 4;
const LANDSCAPE_SCENES_PER_STATE = 2;
const DEFAULT_FILL = 0.78;

// Frame openings in template pixels. `fill` is how much of the opening the art may take
// up. Openings that aren't blank get repainted first: `paper` is a bilinear gradient
// (corners tl, tr, bl, br), `clean` keeps the photo's shadows but erases thin dark marks.
export const LANDSCAPE = [
  { name: "copper-landscape", file: "copper-landscape.jpg", x: 480, y: 380, w: 1036, h: 772, fill: 0.9 },
  { name: "rustic-shelf", file: "original-co.jpg", from: "co", x: 539, y: 690, w: 1466, h: 1116, paper: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"] },
  { name: "brick-floor", file: "original-la.jpg", from: "la", x: 274, y: 461, w: 1121, h: 835, paper: ["#ebe7e4", "#eae6e3", "#d6d1cd", "#ccc7c3"] },
  { name: "whitewash-frame", file: "original-mt.jpg", from: "mt", x: 449, y: 619, w: 1543, h: 1230, paper: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"] },
  { name: "oak-desk", file: "original-or.jpg", from: "or", x: 251, y: 362, w: 630, h: 463, paper: ["#e9e5e2", "#eae6e3", "#eae6e3", "#ebe7e4"] },
  { name: "living-room", file: "original-va.jpg", from: "va", x: 1340, y: 224, w: 799, h: 534, paper: ["#fffeec", "#fffeeb", "#fffeec", "#fffeec"] },
];

export const PORTRAIT = [
  { name: "cactus", file: "cactus.jpg", x: 672, y: 212, w: 681, h: 916 },
  { name: "autumn-white", file: "autumn-white.jpg", x: 515, y: 825, w: 570, h: 785 },
  { name: "copper-matted", file: "copper-matted.jpg", x: 650, y: 250, w: 710, h: 950, fill: 0.9 },
  { name: "green-shelf", file: "green-shelf.jpg", x: 752, y: 285, w: 569, h: 813, paper: ["#c9c3bf", "#e8e5e0", "#f5f6f5", "#f7f7f6"] },
  { name: "copper-candles", file: "copper-candles.jpg", x: 736, y: 279, w: 526, h: 739 },
  { name: "pink-shadows", file: "pink-shadows.jpg", x: 448, y: 270, w: 292, h: 440, clean: 22, retired: true },
  { name: "monstera", file: "monstera.jpg", x: 730, y: 940, w: 505, h: 705 },
  { name: "window-white", file: "window-white.jpg", x: 388, y: 860, w: 604, h: 774, paper: ["#a8a29d", "#cfcbc7", "#9a938c", "#c4bdb7"] },
  { name: "sofa-wall", file: "sofa-wall.jpg", x: 321, y: 418, w: 661, h: 945, paper: ["#e3dfdc", "#ebebeb", "#e5e4e9", "#ebedf1"] },
  { name: "lamp-table", file: "lamp-table.jpg", x: 433, y: 86, w: 345, h: 467, paper: ["#dddddd", "#dddddd", "#dddddd", "#dedede"], retired: true },
  { name: "reading-desk", file: "original-id.jpg", from: "id", x: 810, y: 396, w: 1382, h: 1888, paper: ["#f9f9f9", "#fbfbfb", "#fafafa", "#fcfcfc"] },
  { name: "clock-shelf", file: "original-mi.jpg", from: "mi", x: 346, y: 275, w: 518, h: 732, paper: ["#fefbf5", "#fdfcf6", "#fefdf9", "#fefdf9"] },
  { name: "brick-matted", file: "original-nm.jpg", from: "nm", x: 515, y: 400, w: 970, h: 1285, fill: 0.85, paper: ["#e2dedb", "#d3ceca", "#ccc7c3", "#c5beb8"] },
  { name: "white-brick", file: "original-nv.jpg", from: "nv", x: 281, y: 167, w: 443, h: 614, paper: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"] },
  { name: "charcoal-wall", file: "original-ri.jpg", from: "ri", x: 452, y: 270, w: 988, h: 1340, paper: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"] },
];

const pick = (pool, count, start, step, p) => {
  const usable = pool.filter((s) => s.from !== p.abbr);
  return Array.from({ length: count }, (_, k) => usable[(start * step + k) % usable.length]);
};

// Retired scenes stay in the pool so every other state keeps the scenes already on Etsy.
export const scenesFor = (p) => {
  const i = products.indexOf(p);
  const picked = isLandscape(p)
    ? [...pick(LANDSCAPE, LANDSCAPE_SCENES_PER_STATE, i, 1, p), ...pick(PORTRAIT, PORTRAIT_SCENES_PER_STATE - 1, i, 4, p)]
    : pick(PORTRAIT, PORTRAIT_SCENES_PER_STATE, i, 4, p);
  return picked.filter((s) => !s.retired);
};

export const originalShot = (p) => {
  const file = join(LEGACY, `${p.abbr}_legacy.jpg`);
  return existsSync(file) ? file : null;
};

export const magick = (args) => execFileSync("magick", args, { stdio: ["ignore", "ignore", "inherit"] });

export const fitArt = (art, w, h, fill = 1) => [
  "(", art, "-background", "white", "-alpha", "remove", "-trim", "+repage",
  "-resize", `${Math.round(w * fill)}x${Math.round(h * fill)}`,
  "-gravity", "center", "-extent", `${w}x${h}`, ")",
];

const place = (x, y, compose) => ["-gravity", "northwest", "-geometry", `+${x}+${y}`, "-compose", compose, "-composite"];

export const renderScene = (scene, art, out) => {
  const { x, y, w, h, paper, clean, fill = DEFAULT_FILL } = scene;
  const template = join(TEMPLATES, scene.file);
  const repaint = paper
    ? [
        "(", "-size", `${w}x${h}`, "xc:white", "-sparse-color", "Bilinear",
        `0,0 ${paper[0]} ${w - 1},0 ${paper[1]} 0,${h - 1} ${paper[2]} ${w - 1},${h - 1} ${paper[3]}`, ")",
        ...place(x, y, "over"),
      ]
    : clean
      ? [
          "(", template, "-crop", `${w}x${h}+${x}+${y}`, "+repage",
          "-morphology", "Close", `Disk:${clean}`, "-blur", "0x12", ")",
          ...place(x, y, "over"),
        ]
      : [];
  magick(["(", template, ")", ...repaint, ...fitArt(art, w, h, fill), ...place(x, y, "multiply"), "-quality", "90", out]);
};

const renderWebArt = (p, art, out) =>
  magick([...(isLandscape(p) ? fitArt(art, 1600, 1200, 0.9) : fitArt(art, 1200, 1600, 0.9)), "-quality", "85", out]);

export const sceneOutputs = (p) => scenesFor(p).map((s) => join(OUT, p.abbr, `${p.abbr}_${s.name}.jpg`));
export const webArtOutput = (p) => join(OUT, p.abbr, `${p.abbr}_art_web.jpg`);

if (import.meta.url === `file://${process.argv[1]}`) {
  const { values: args } = parseArgs({ options: { only: { type: "string" } } });
  const only = args.only?.toLowerCase().split(",").map((s) => s.trim());
  const selected = only ? products.filter((p) => only.includes(p.abbr)) : products;

  for (const p of selected) {
    const art = artFiles(p)[0];
    mkdirSync(join(OUT, p.abbr), { recursive: true });
    scenesFor(p).forEach((s, i) => renderScene(s, art, sceneOutputs(p)[i]));
    renderWebArt(p, art, webArtOutput(p));
    console.log(`${p.abbr.toUpperCase()}  ${scenesFor(p).map((s) => s.name).join(", ")}`);
  }
}
