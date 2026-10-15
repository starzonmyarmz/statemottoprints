# CLAUDE.md

Two things live here: the Eleventy site (`src/`, deployed from `main` by GitHub Actions) and the Etsy listing tooling (`etsy/`). See README.md for an overview.

## Repo is public

Never commit, print, or paste anything from `etsy/etsy-credentials.json`, `etsy/etsy-token.json`, or `etsy/etsy-auth-pending.json`. Never commit the full-size print files from `~/Library/CloudStorage/Dropbox/Projects/State Mottos` (they’re the paid product) or anything under `etsy/mockups/` (the frame photos may be licensed, and renders are large). Check `git status` before committing in `etsy/`.

## Etsy scripts

Run everything from `etsy/`. Plain Node 22 ESM with no dependencies, plus ImageMagick 7 (`magick`). Every script takes `--only al,ny` (comma-separated state abbreviations). Leave it off to run all 50.

- `node mockups.mjs [--only]` renders scenes into `mockups/rendered/<abbr>/`. It needs `mockups/templates/` and `mockups/legacy/`, which exist only on Daniel’s machine.
- `node upload.mjs --dry-run [--only]` shows what would change. Always run it before a real upload.
- `node upload.mjs [--only]` creates or updates **draft** listings. It never publishes.
- `node publish.mjs [--only]` sets listings active. Each newly published listing costs Daniel $0.20, so publish only when asked.
- `node build-csv.mjs` writes `listings.csv` and validates titles, tags, and images.
- `node banner.mjs` writes the shop banners to `banner/`.

### How syncing works

`uploaded.json` stores per-state progress (`listing_id`, `imageSet`, `copy`, `fileSet`). `upload.mjs` skips any state whose stored versions match the constants at the top of the script. To push a change to existing listings, bump the matching constant:

- `IMAGE_SET` after re-rendering mockups or changing image order
- `COPY_VERSION` after editing `products.mjs` or `listing.mjs` copy
- `FILE_SET` after changing the download files or their names

Uploads are resumable. Re-running continues where it stopped. New images and files go up before the old ones are deleted, because Etsy won’t let a listing drop to zero images.

### Auth

The access token lasts 1 hour and refreshes automatically. The refresh token lasts about 90 days. If a script reports a failed refresh, Daniel runs `node auth.mjs`, signs in, and pastes back the redirected URL. Then run `node auth.mjs "<url>"`. Daniel handles credentials. Never ask for keys to be pasted into chat.

### Content rules

- Copy is short and witty and shouldn’t sound machine-written. Use typographic apostrophes (’).
- Tags: at most 13, each 20 characters or fewer, no commas or quotes. `build-csv.mjs` checks this.
- Each mockup keeps white space around the art. Landscape art (7200×5400) leads with a landscape scene.
- A scene whose `from` matches a state is skipped for that state, since that state already shows its original photo as image 2.

## Site ↔ Etsy

Each state in `src/_data/states.json` has an `etsy` listing ID (from `etsy/uploaded.json`) that the site uses for its “Buy the print on Etsy” link. A state with no ID gets no link. The shop URL is in `src/_data/site.json`.

## Known issues

- **Delaware** (`de`): the art says “Liberty and Prosperity”, but the motto is “Liberty and Independence”. `src/_data/states.json` has the same mistake. `publish.mjs` holds `de` as a draft until the art is re-lettered. When new art arrives, re-render, bump `IMAGE_SET` and `FILE_SET`, upload, and remove `de` from `HOLD` only when Daniel asks. After publishing it, add its listing ID as `"etsy"` in `src/_data/states.json` so the site links to it.
- Tennessee’s source folder is spelled `Tennesee`. `listing.mjs` handles it.
