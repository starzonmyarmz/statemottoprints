import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { products } from "./products.mjs";

export const PRICE = "4.00";
export const SOURCE_DIR = process.env.STATE_MOTTOS_DIR ?? join(homedir(), "Library", "CloudStorage", "Dropbox", "Projects", "State Mottos");

export const title = (p) => `${p.state} State Motto — "${p.motto}" Hand-lettered Printable Wall Art`;

export const description = (p) =>
  [
    `${p.motto}${p.sub ? ` (${p.sub})` : ""}`,
    "",
    p.line,
    "",
    `Hand-lettered by Daniel Marino. Printed by you, framed by you, ${HUNG[products.indexOf(p) % HUNG.length]}`,
    "",
    "• Instant download, no shipping",
    "• Print at home, or send to any print shop",
    isLandscape(p)
      ? "• 7200×5400 px, 4:3 ratio — prints crisp at 8x6, 12x9, 16x12, or 24x18"
      : "• 5400×7200 px, 3:4 ratio — prints crisp at 6x8, 9x12, 12x16, or 18x24",
    ...(BONUS[p.abbr] ? [BONUS[p.abbr]] : []),
    "",
    "Digital file only — nothing arrives in the mail.",
    "For personal use only. Please don’t resell or share the file.",
  ].join("\n");

const HUNG = [
  "hung wherever you argue your point most often.",
  "hung where the in-laws will definitely see it.",
  "hung right above the thermostat nobody else is allowed to touch.",
  "hung at eye level for maximum hometown bragging.",
  "hung by the front door, so guests know where they stand.",
  "hung somewhere the dog can’t reach it.",
  "hung over the couch, ready to settle the argument for you.",
  "hung behind you on every video call.",
  "hung in the hallway, where everyone has to walk past it.",
  "hung slightly crooked, exactly how you’ll leave it.",
  "hung in the kitchen, the true seat of state government.",
  "hung wherever you need a little hometown pep talk.",
  "hung in the guest room, so visitors know whose house rules apply.",
  "hung across from your desk, for staring at during long meetings.",
  "hung by the grill, where the strongest opinions get cooked up.",
  "hung in the entryway, like a welcome mat for the wall.",
];

const BONUS = {
  ny: "• Two files: English (Ever Upward) and the original Latin (Excelsior)",
  sc: "• Two files: both of South Carolina’s mottos, Animis Opibusque Parati and Dum Spiro Spero",
};

const VARIANTS = {
  ny_black_on_white_english: "Ever-Upward",
  ny_black_on_white_latin: "Excelsior",
  sc_black_on_white_1: "Animis-Opibusque-Parati",
  sc_black_on_white_2: "Dum-Spiro-Spero",
};

export const downloadName = (p, file) => {
  const [stem, ext] = basename(file).split(".");
  const variant = VARIANTS[stem];
  return `${p.state.replace(/ /g, "-")}-State-Motto-Print${variant ? `-${variant}` : ""}.${ext}`;
};

const FILLER = new Set(["a", "and", "as", "be", "but", "is", "of", "or", "our", "the", "to", "we", "with"]);

const cap20 = (words) => {
  const kept = [];
  for (const w of words.split(/[\s,]+/)) {
    if (([...kept, w].join(" ") + " ").length > 20) break;
    kept.push(w);
  }
  while (kept.length > 1 && FILLER.has(kept.at(-1))) kept.pop();
  return kept.join(" ");
};

export const tags = (p) =>
  [
    p.state,
    `${p.state} gift`,
    "state motto",
    p.tag ?? cap20(p.motto.toLowerCase()),
    "printable wall art",
    "hand lettered print",
    "digital download",
    cap20(p.who.toLowerCase().replace(/s$/, "")),
    p.occ,
    "50 states print",
    "typography print",
    "minimalist wall art",
    p.who,
  ]
    .map((t) => t.trim().replace(/[,"]/g, ""))
    .filter(Boolean)
    .slice(0, 13);

export const stateDir = (p) => join(SOURCE_DIR, p.state === "Tennessee" ? "Tennesee" : p.state);

export const artFiles = (p) =>
  readdirSync(stateDir(p))
    .filter((f) => f.startsWith(`${p.abbr}_black_on_white`))
    .sort()
    .map((f) => join(stateDir(p), f));

const orientation = new Map();
export const isLandscape = (p) => {
  if (!orientation.has(p.abbr)) {
    const [w, h] = execFileSync("magick", ["identify", "-format", "%w %h", artFiles(p)[0]]).toString().split(" ").map(Number);
    orientation.set(p.abbr, w > h);
  }
  return orientation.get(p.abbr);
};
