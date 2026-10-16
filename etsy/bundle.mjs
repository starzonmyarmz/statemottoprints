import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { products } from "./products.mjs";
import { SOURCE_DIR, artFiles, downloadName } from "./listing.mjs";
import { LANDSCAPE, fitArt, magick, renderScene } from "./mockups.mjs";

const DIR = join(import.meta.dirname, "bundle");
const FILES = join(DIR, "files");
const ZIPS = join(DIR, "zips");
export const IMAGES = join(DIR, "images");

export const USA_SOURCE = join(SOURCE_DIR, "_usa.pxd");
export const USA_ART = join(DIR, "usa_black_on_white.png");
export const USA_NAME = "USA-State-Mottos-Map.png";

// Etsy allows 5 files per listing, 20MB each. The art has no color, so grayscale PNGs are
// visually identical and about a third the size.
export const ZIP_GROUPS = [
  { name: "State-Motto-Prints-Alabama-to-Maine.zip", from: "Alabama", to: "Maine" },
  { name: "State-Motto-Prints-Maryland-to-New-York.zip", from: "Maryland", to: "New York" },
  { name: "State-Motto-Prints-North-Carolina-to-Wyoming.zip", from: "North Carolina", to: "Wyoming" },
];

export const SCENES = ["copper-landscape", "rustic-shelf", "whitewash-frame", "brick-floor", "oak-desk", "living-room"];

export const imageOutputs = () => [
  join(IMAGES, `usa_${SCENES[0]}.jpg`),
  join(IMAGES, "all-50.jpg"),
  ...SCENES.slice(1).map((s) => join(IMAGES, `usa_${s}.jpg`)),
  join(IMAGES, "usa_art_web.jpg"),
];

export const fileOutputs = () => [join(FILES, USA_NAME), ...ZIP_GROUPS.map((g) => join(ZIPS, g.name))];

const gray = (src, out) => magick([src, "-background", "white", "-alpha", "remove", "-alpha", "off", "-colorspace", "gray", "-define", "png:compression-level=9", out]);

const buildFiles = () => {
  if (!existsSync(USA_ART)) throw new Error(`Export ${USA_SOURCE} from Pixelmator Pro to ${USA_ART} first.`);
  rmSync(FILES, { recursive: true, force: true });
  rmSync(ZIPS, { recursive: true, force: true });
  mkdirSync(FILES, { recursive: true });
  mkdirSync(ZIPS, { recursive: true });
  gray(USA_ART, join(FILES, USA_NAME));

  for (const g of ZIP_GROUPS) {
    const states = products.filter((p) => p.state >= g.from && p.state <= g.to);
    const folder = join(FILES, g.name.replace(/\.zip$/, ""));
    mkdirSync(folder, { recursive: true });
    for (const p of states) for (const f of artFiles(p)) gray(f, join(folder, downloadName(p, f)));
    execFileSync("zip", ["-qr", "-0", join(ZIPS, g.name), "."], { cwd: folder });
    console.log(`${g.name}  ${states.length} states`);
  }
};

const buildCollage = (out) => {
  const cols = 10, rows = 5, cellW = 300, cellH = 400, pad = 60;
  const cells = products.flatMap((p) => fitArt(artFiles(p)[0], cellW, cellH, 0.82));
  magick([
    ...cells,
    "-background", "white", "+append", "-crop", `${cellW * cols}x${cellH}`, "+repage", "-append",
    "-gravity", "center", "-extent", `${cellW * cols + pad * 2}x${cellH * rows + pad * 2}`,
    "-quality", "90", out,
  ]);
};

const buildImages = () => {
  mkdirSync(IMAGES, { recursive: true });
  const flat = join(DIR, "usa_flat.png");
  magick([USA_ART, "-background", "white", "-alpha", "remove", "-alpha", "off", flat]);
  for (const name of SCENES) renderScene(LANDSCAPE.find((s) => s.name === name), flat, join(IMAGES, `usa_${name}.jpg`));
  magick([...fitArt(flat, 2400, 1600, 0.92), "-quality", "85", join(IMAGES, "usa_art_web.jpg")]);
  buildCollage(join(IMAGES, "all-50.jpg"));
  console.log(`images in ${IMAGES}`);
};

export const PRICE = "50.00";

export const title = () =>
  "All 50 State Mottos Bundle + Bonus USA Motto Map — Hand-lettered Printable Wall Art, Instant Download";

export const tags = () => [
  "50 states bundle",
  "state motto prints",
  "all 50 states",
  "usa map print",
  "typography map",
  "hand lettered map",
  "printable wall art",
  "digital download",
  "americana decor",
  "road trip gift",
  "classroom decor",
  "history teacher gift",
  "patriotic wall art",
];

export const description = () =>
  [
    "All 50 State Mottos + a Bonus USA Map",
    "",
    "Fifty states. Fifty mottos. Fifty tiny declarations of “we’re better than the state next door.” Here’s the whole squabbling family in one download.",
    "",
    "Every state’s motto, hand-lettered by Daniel Marino, from Alabama’s “We Dare Defend Our Rights” to Wyoming’s “Equal Rights.” Plus a bonus you can’t buy anywhere else: every motto crammed into one giant hand-lettered map of the USA, where California yells EUREKA and the tiny New England states hold their own anyway.",
    "",
    "Bought one at a time, that’s $200. Here it’s $50. Go ahead and do the math. We’ll wait.",
    "",
    "What you get:",
    "• 50 state motto prints, plus New York in the original Latin and both of South Carolina’s mottos",
    "• Bonus hand-lettered USA motto map, 10800×7200 px — prints crisp up to 36x24",
    "• Portrait states are 5400×7200 px (3:4), landscape states are 7200×5400 px (4:3)",
    "• Instant download: three zip files of state prints, plus the map",
    "",
    "Made for classrooms, road-trippers, map nerds, and anyone who’s ever started a sentence with “Well, in MY state…”",
    "",
    "Hand-lettered by Daniel Marino. Printed by you, framed by you, hung on one very long wall.",
    "",
    "Digital files only — nothing arrives in the mail.",
    "For personal use only. Please don’t resell or share the files.",
  ].join("\n");

const upload = async () => {
  const { readFileSync, writeFileSync } = await import("node:fs");
  const { basename } = await import("node:path");
  const { client } = await import("./etsy.mjs");
  const progressPath = join(import.meta.dirname, "uploaded.json");
  const progress = JSON.parse(readFileSync(progressPath, "utf8"));
  const save = () => writeFileSync(progressPath, JSON.stringify(progress, null, 2) + "\n");
  const state = (progress._bundle ??= {});

  const etsy = await client();
  const { shop_id } = await etsy.get("/users/me");
  if (!state.listing_id) {
    const listing = await etsy.post(
      `/shops/${shop_id}/listings`,
      new URLSearchParams({
        quantity: "999",
        title: title(),
        description: description(),
        price: PRICE,
        who_made: "i_did",
        when_made: "2010_2019",
        is_supply: "false",
        taxonomy_id: "2078",
        type: "download",
        tags: tags().join(","),
      }),
    );
    Object.assign(state, { listing_id: listing.listing_id, images: 0, files: 0 });
    save();
  }
  const base = `/shops/${shop_id}/listings/${state.listing_id}`;
  const send = (path, field, file, extra, name = basename(file)) => {
    const form = new FormData();
    form.append(field, new Blob([readFileSync(file)]), name);
    for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
    return etsy.post(path, form);
  };

  const images = imageOutputs();
  for (; state.images < images.length; state.images++, save()) {
    await send(`${base}/images`, "image", images[state.images], {
      rank: state.images + 1,
      alt_text: "Hand-lettered US state mottos map and all 50 state motto prints",
    });
  }
  const files = fileOutputs();
  for (; state.files < files.length; state.files++, save()) {
    const name = basename(files[state.files]);
    await send(`${base}/files`, "file", files[state.files], { name, rank: state.files + 1 }, name);
  }
  console.log(`bundle draft ${state.listing_id}  (${images.length} images, ${files.length} files)`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--upload")) await upload();
  else {
    buildImages();
    buildFiles();
  }
}
