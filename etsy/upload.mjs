import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { products } from "./products.mjs";
import { PRICE, artFiles, description, downloadName, tags, title } from "./listing.mjs";
import { originalShot, sceneOutputs, webArtOutput } from "./mockups.mjs";
import { client } from "./etsy.mjs";

// Bump one of these to push that part of every existing draft again.
const IMAGE_SET = "lifestyle-v5";
const COPY_VERSION = "hung-v1";
const FILE_SET = "named-v1";

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    only: { type: "string" },
    taxonomy: { type: "string" },
  },
});

const PROGRESS_PATH = join(dirname(fileURLToPath(import.meta.url)), "uploaded.json");
const progress = existsSync(PROGRESS_PATH) ? JSON.parse(readFileSync(PROGRESS_PATH, "utf8")) : {};
const save = () => writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2) + "\n");

const only = args.only?.toLowerCase().split(",").map((s) => s.trim());
const selected = only ? products.filter((p) => only.includes(p.abbr)) : products;
if (only && selected.length !== only.length) throw new Error(`Unknown state abbreviation in --only ${args.only}`);

const plan = (p) => ({
  title: title(p),
  tags: tags(p),
  images: [...sceneOutputs(p).slice(0, 1), originalShot(p), ...sceneOutputs(p).slice(1), webArtOutput(p)].filter(Boolean),
  files: artFiles(p).slice(0, 5),
});

if (args["dry-run"]) {
  for (const p of selected) {
    const { title, tags, images, files } = plan(p);
    console.log(`\n${p.abbr.toUpperCase()}  ${title}`);
    console.log(`  tags:   ${tags.join(", ")}`);
    console.log(`  images: ${images.map((f) => basename(f)).join(", ")}`);
    console.log(`  files:  ${files.map((f) => downloadName(p, f)).join(", ")}`);
    const prior = progress[p.abbr];
    if (prior?.listing_id) {
      const stale = [
        prior.imageSet !== IMAGE_SET && "images",
        prior.copy !== COPY_VERSION && "copy",
        prior.fileSet !== FILE_SET && "files",
      ].filter(Boolean);
      console.log(stale.length ? `  (existing draft, would update ${stale.join(", ")})` : "  (up to date, would skip)");
    }
  }
  process.exit(0);
}

const etsy = await client();
const { shop_id } = await etsy.get("/users/me");

const findTaxonomy = async () => {
  if (args.taxonomy) return Number(args.taxonomy);
  const { results } = await etsy.get("/seller-taxonomy/nodes");
  const matches = [];
  const walk = (nodes, path) => {
    for (const n of nodes) {
      const here = [...path, n.name];
      if (n.name === "Digital Prints") matches.push({ id: n.id, path: here.join(" > ") });
      walk(n.children ?? [], here);
    }
  };
  walk(results, []);
  const pick = matches.find((m) => m.path.startsWith("Art & Collectibles")) ?? matches[0];
  if (!pick) throw new Error("Couldn't find a 'Digital Prints' category. Pass --taxonomy <id>.");
  console.log(`Category: ${pick.path} (${pick.id})`);
  return pick.id;
};

const taxonomy_id = await findTaxonomy();

const upload = (path, field, file, extra, filename = basename(file)) => {
  const form = new FormData();
  form.append(field, new Blob([readFileSync(file)]), filename);
  for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
  return etsy.post(path, form);
};

for (const p of selected) {
  const state = (progress[p.abbr] ??= {});
  if (state.done && state.imageSet === IMAGE_SET && state.copy === COPY_VERSION && state.fileSet === FILE_SET) {
    console.log(`${p.abbr.toUpperCase()}  skip (listing ${state.listing_id})`);
    continue;
  }
  const { title, tags, images, files } = plan(p);

  if (state.listing_id && state.imageSet !== IMAGE_SET) {
    const { results } = await etsy.get(`/listings/${state.listing_id}/images`);
    Object.assign(state, {
      imageSet: IMAGE_SET,
      images: 0,
      staleImages: results.map((img) => img.listing_image_id),
      done: false,
    });
    save();
  }

  if (!state.listing_id) {
    const listing = await etsy.post(
      `/shops/${shop_id}/listings`,
      new URLSearchParams({
        quantity: "999",
        title,
        description: description(p),
        price: PRICE,
        who_made: "i_did",
        when_made: "2010_2019",
        is_supply: "false",
        taxonomy_id: String(taxonomy_id),
        type: "download",
        tags: tags.join(","),
      }),
    );
    Object.assign(state, { listing_id: listing.listing_id, imageSet: IMAGE_SET, copy: COPY_VERSION, fileSet: FILE_SET });
    save();
  }
  const base = `/shops/${shop_id}/listings/${state.listing_id}`;

  if (state.copy !== COPY_VERSION) {
    await etsy.patch(base, new URLSearchParams({ title, description: description(p), tags: tags.join(",") }));
    state.copy = COPY_VERSION;
    save();
  }

  if (state.fileSet !== FILE_SET) {
    const { results } = await etsy.get(`${base}/files`);
    Object.assign(state, { fileSet: FILE_SET, files: 0, staleFiles: results.map((f) => f.listing_file_id) });
    save();
  }

  state.images ??= 0;
  for (; state.images < images.length; state.images++, save()) {
    await upload(`${base}/images`, "image", images[state.images], {
      rank: state.images + 1,
      alt_text: `${p.state} state motto "${p.motto}" hand-lettered print`,
    });
  }

  while (state.staleImages?.length) {
    await etsy.del(`${base}/images/${state.staleImages[0]}`);
    state.staleImages.shift();
    save();
  }

  state.files ??= 0;
  for (; state.files < files.length; state.files++, save()) {
    const name = downloadName(p, files[state.files]);
    await upload(`${base}/files`, "file", files[state.files], { name, rank: state.files + 1 }, name);
  }

  while (state.staleFiles?.length) {
    await etsy.del(`${base}/files/${state.staleFiles[0]}`);
    state.staleFiles.shift();
    save();
  }

  state.done = true;
  save();
  console.log(`${p.abbr.toUpperCase()}  draft ${state.listing_id}  (${images.length} images, ${files.length} files)`);
}

console.log("\nDone. Review drafts at https://www.etsy.com/your/shops/me/tools/listings/state:draft");
