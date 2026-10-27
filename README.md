# The Little Flower's Blooms

Website for The Little Flower's Blooms, Amelie Menard's wedding and event florist business in Lafayette, Louisiana.

Plain HTML and CSS with one Vercel serverless function for the inquiry form. No build step: Vercel serves the files as they are, and every push to `main` redeploys.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/weddings` | `weddings/index.html` |
| `/flowers` | `flowers/index.html` (events and occasions) |
| `/about` | `about/index.html` |
| `/inquire` | `inquire/index.html` (the form) |
| `/plan` | `plan/index.html` (wedding party counter and photo palette) |
| `/seasons` | `seasons/index.html` (what's in season by month) |
| 404 | `404.html` |

Shared styles are in `assets/styles.css`; the menu toggle and form logic are in `assets/site.js`.

### Navigation

The header, footer, stock-photo note and phone action bar are repeated in every page, but they come from one place: `scripts/build-nav.py`. To add or rename a menu item, edit `MENU` (main menu and its drop-down links) or `FOOTER_COLS` in that file, then run `python3 scripts/build-nav.py` from the repo root and commit the pages it changed. A new page also needs a line in `PAGES` (which menu section it belongs to, and whether it gets the phone Inquire / Message bar).

Menu: Weddings (Plan your order, Flower styles) · Occasions (Formals, graduations & gifts; Flower meanings) · In season · About · Inquire button. On desktop the sub-links drop down on hover or keyboard focus; in the phone menu they sit under each heading. On phones the ticker is hidden and the stock-photo note is shortened so the logo sits near the top.

No prices are shown at launch. Prices for later are in the project's pricing guide.

## Interactive tools

All four live in `assets/tools.js` (data at the top of the file) plus a few lines in `assets/site.js`. None of them shows a price.

| Tool | Where | What it does |
| --- | --- | --- |
| French flower names | every page | Any `<span data-fr="pivoine">peonies</span>` becomes a name that shows its French word on hover or tap. `site.js` handles it; the tools call `window.LFB.frenchify()` on what they draw. |
| Flower meanings finder | `/flowers` (`#meanings`) | Pick a message and a recipient; shows three flowers with their meanings, quoted from Kate Greenaway's *Language of Flowers* (1884, [Project Gutenberg](https://www.gutenberg.org/ebooks/31591)). "Order this bouquet" opens the form with the picks in the notes. Edit `M` (flowers) and `MESSAGES` (which three to show) in `tools.js`. |
| Wedding party counter | `/plan` (`#planner`) | Counts bouquets, boutonnieres, corsages and altar pieces from the party size, draws one little icon per piece, and builds the inquiry link. The plan is kept in the visitor's browser (`localStorage`, key `lfb-plan-v1`). |
| Palette from a photo | `/plan` (`#palette`) | Reads up to 5 main colors from a photo in the browser (nothing is uploaded), names them, and suggests flowers per color family (`FAMILIES` in `tools.js`). The colors tint the planner icons and go into the inquiry notes. The example photo is a stock photo, credited on `/credits`. |
| In season | `/seasons` (`#seasons`) | A month wheel plus a date checker. Flags dates within 2 weeks of Valentine's Day or Mother's Day. Edit `MONTHS` and `YEAR_ROUND` in `tools.js`. |

The inquiry form reads `?event=`, `?date=`, `?count=`, `?needs=` (comma-separated, matching the checkbox values) and `?notes=` from the link, and shows a "Your plan is filled in" note.

Where the season data comes from (cited on `/seasons`): Louisiana bloom times from LSU AgCenter articles (magnolias and gardenias, sasanqua camellias, Louisiana irises, cool-season flowers, zinnias) and the LSU Botanic Gardens "What's in Season" page; grower months from the FiftyFlowers wholesale availability chart. Once Amelie has a season of her own buying behind her, replace the grower months with what Spedale's and Sam's Club actually stock.

When a script or stylesheet changes, update its `?v=` string in every page (the first 8 characters of the file's MD5) so browsers fetch the new copy.

## Inquiry form setup

The form posts to `api/inquire.js`, which emails each inquiry to Amelie through [Resend](https://resend.com). Until the two variables below are set, the form shows a message asking people to DM on Instagram instead.

1. Amelie creates a free Resend account with the email address where she wants inquiries.
2. In Resend, create an API key.
3. In Vercel, open the project, then Settings > Environment Variables, and add:
   - `RESEND_API_KEY`: the key from step 2
   - `INQUIRY_TO_EMAIL`: the email from step 1
4. Redeploy (Deployments > the latest one > Redeploy).

Resend's test sender can only deliver to the address that owns the Resend account, which is why step 1 uses Amelie's email. Once the domain is connected, verify it in Resend and add `FROM_EMAIL` (for example `The Little Flower's Blooms <hello@thelittleflowersblooms.com>`) to send from her own domain.

Replying to an inquiry email replies to the client when they gave an email address.

## Search (SEO)

What's in place:

- A unique title and description on every page, each with "Lafayette, LA" (a Lafayette, Colorado florist competes for the same words).
- Canonical URLs on the `www` address, Open Graph tags and a share image (`assets/og-image.jpg`, 1200 x 630, made from the site's own illustration, not a stock photo).
- Structured data: `WebSite` and `Florist` on the home page (towns served, services, Instagram), `Service` on Weddings and Events & occasions. Check changes with Google's Rich Results Test.
- `sitemap.xml` with `lastmod` dates. Update the date when a page changes; add every new page.
- `/credits` and the 404 page are `noindex`, so stock-photo credits never show up in Google.
- Fonts are served from this site, not Google Fonts, so pages render sooner.

When adding a page: give it a title with the service and "Lafayette, LA", one `h1`, a `Service` JSON-LD block if it describes a service, a link from at least one existing page, and a line in `sitemap.xml`.

Google Search Console: add a Domain property for `thelittleflowersblooms.com`, copy the TXT record Google gives you, add it in Vercel (Domains > thelittleflowersblooms.com > DNS Records, type TXT, name `@`), verify, then submit `https://www.thelittleflowersblooms.com/sitemap.xml`.

## Instagram gallery

The galleries on Home and About show Amelie's latest Instagram posts once the feed is connected. Until then, or if the feed is ever down, they show the stock mood board, so nothing breaks.

How it works: [Behold](https://behold.so) logs in to her Instagram and keeps the access token fresh. `api/instagram.js` reads Behold's JSON feed and Vercel's CDN caches the result for 6 hours, so Behold sees a few requests a day no matter how many people visit. `assets/site.js` swaps the stock photos for her posts on any section marked `data-instagram`; elements with `data-ig-text` change their wording at the same time ("Mood board · stock photos" becomes "Recent work · Instagram").

Behold's free plan: 1 feed, her latest 6 posts, updated once a day, 1,200 feed requests a month (the 6-hour cache keeps the site far under that). Instagram only lets Business or Creator accounts connect to outside sites, so her account has to be one of those.

### Connecting it

1. In the Instagram app on Amelie's phone: profile > Edit profile > "Switch to professional account" (or menu > Settings and activity > "Account type and tools"). Pick the Florist category and **Business** or **Creator**. It's free and can be switched back.
2. Go to [behold.so](https://behold.so), sign up (free) with thelittleflowersblooms@gmail.com.
3. Add a source: Instagram, basic (no Facebook page needed). Amelie logs in to Instagram there and approves access.
4. Create a feed of type **JSON** from that source. Copy its URL (`https://feeds.behold.so/...`).
5. In Behold's feed settings, add `www.thelittleflowersblooms.com` to the allowed domains if it asks (the site's server fetches the feed, so this is optional).
6. In Vercel: Settings > Environment Variables, add `BEHOLD_FEED_URL` = the feed URL, for Production. Redeploy.

The feed URL is not a secret; it only returns her public posts.

If she ever changes her Instagram password, reauthorize the source in Behold.

## Photos (stock for now)

The site is a work in progress. Every photo on it is a stock image from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license) (free for commercial use, no attribution required). None of them show Amelie's own work, and the site says so in three places:

- a blush notice bar above the ticker on every page, linking to `/credits`
- a line in every page footer
- `/credits` (`credits/index.html`), which lists each photo, its photographer and the page it's on

The three photo galleries are labeled "Mood board · stock photos", and the About page photo has a caption saying a portrait of Amelie is coming.

Files are in `assets/photos/`, three widths per photo (`-480`, `-800`, `-1400`, WebP), served with `srcset` so phones download the small one.

### Replacing a stock photo with one of Amelie's

1. Export her photo as WebP or JPEG at 480, 800 and 1400 px wide (each under about 300 KB).
2. Put them in `assets/photos/` with a descriptive name, for example `blush-garden-rose-bridal-bouquet-480.webp`.
3. Find the photo spot: each one has an HTML comment above it starting `STOCK for now`, saying what should go there.
4. Change the file names in `src` and `srcset`, keep `sizes`, `width` and `height` (use the new file's pixel size), and write new alt text that names the flowers and, for weddings, the venue.
5. Remove that photo's entry from `credits/index.html`.

When all of them are replaced, delete the `site-note` paragraph and the footer "Photos are stock images" line from every page, delete `credits/` and the old stock files, and change the gallery labels back (for example "Recent work").

`assets/botanical.svg` is the line illustration the home hero used before the photos went in. Nothing references it now.

## Design

Editorial and minimal: Cormorant Garamond (light) for headlines, Jost for body and spaced capital labels. Paper `#F6F3EE`, stone `#ECE7E0`, sage `#CBD2C3`, blush `#EBD5CD`, ink `#262B24`, rose accent `#8E4F4A`. Sections fade in on scroll, the top bar scrolls slowly, and petals drift over the hero; all of it switches off for visitors who set their device to reduce motion.

## To do before launch

- Confirm the delivery towns: Lafayette, Youngsville, Broussard, Scott, Carencro, Breaux Bridge (in every page footer band, the inquire page and the JSON-LD in `index.html`).
- Confirm the occasion lists on `/flowers` match what Amelie makes.
- Replace the stock photos with Amelie's own (see above), then remove the stock-photo notices.
- Add the client reviews section on the home page once there are quotes with permission (template is commented out in `index.html`).
- Connect the domain in Vercel (Settings > Domains). `robots.txt`, `sitemap.xml` and the JSON-LD already point to `https://www.thelittleflowersblooms.com`.
- Add the site to Google Search Console and submit the sitemap (steps under Search).
- Vercel's free Hobby plan is for non-commercial use only. A business site needs the Pro plan.

## Running locally

```
npx vercel dev
```
