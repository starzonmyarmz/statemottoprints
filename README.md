# State Motto Prints

Hand-lettered mottos for all 50 US states by Daniel Marino.

- Site: <https://states.iamdanielmarino.com>
- Shop: <https://www.etsy.com/shop/StateMottoPrints>

## Website

An [Eleventy](https://www.11ty.dev) site. Pages come from `src/`, and each state’s motto comes from `src/_data/states.json`.

```bash
npm install
npm run serve
```

Every push to `main` builds the site and deploys it to GitHub Pages.

## Etsy listings

`etsy/` holds the scripts that write the listing copy, render lifestyle mockups, and sync the listings through the Etsy Open API v3. They need Node 22+ and ImageMagick 7 (`magick`). Nothing to install.

Only the code is in git. Credentials, tokens, upload progress, frame photos, and all rendered images stay local (see `etsy/.gitignore`). The full-size print files live outside the repo in `~/Desktop/State Mottos/<State>/` (set `STATE_MOTTOS_DIR` to use a different folder).

| Script | What it does |
|---|---|
| `products.mjs` | Per-state copy: motto, one-liner, tags |
| `listing.mjs` | Builds title, description, tags, and download file names |
| `mockups.mjs` | Renders lifestyle mockups into `mockups/rendered/` |
| `auth.mjs` | Etsy OAuth login, which saves `etsy-token.json` |
| `upload.mjs` | Creates or updates draft listings |
| `publish.mjs` | Makes drafts live |
| `build-csv.mjs` | Exports `listings.csv` for review |
| `banner.mjs` | Renders the shop banners |

### First-time setup

1. Copy `etsy/etsy-credentials.example.json` to `etsy/etsy-credentials.json` and fill in the app’s keystring and shared secret from <https://www.etsy.com/developers/your-apps>.
2. Run `node auth.mjs`, sign in, then run `node auth.mjs "<the URL you were redirected to>"`.

### Typical update

```bash
cd etsy
node mockups.mjs --only al
node upload.mjs --dry-run --only al
node upload.mjs --only al
node publish.mjs --only al
```
