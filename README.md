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
| 404 | `404.html` |

Shared styles are in `assets/styles.css`; the menu toggle and form logic are in `assets/site.js`. The header and footer are repeated in each page, so change them in every file.

No prices are shown at launch. Prices for later are in the project's pricing guide.

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

## Adding photos

Each photo spot is a `<div class="photo">` with an HTML comment above it saying which photo goes there. To fill one:

1. Export the photo about 1600 px wide as JPEG or WebP, under 300 KB.
2. Put it in `assets/photos/` with a descriptive name, for example `blush-garden-rose-bridal-bouquet-lafayette.jpg`.
3. Put an image inside the placeholder and remove `aria-hidden="true"`:

```html
<div class="photo photo--arch">
  <img src="/assets/photos/blush-garden-rose-bridal-bouquet-lafayette.jpg"
       alt="Blush garden rose bridal bouquet for a wedding in Youngsville, Louisiana"
       width="1600" height="2000" loading="lazy">
</div>
```

Leave `loading="lazy"` off the first photo on each page so it shows right away.

## To do before launch

- Confirm the delivery towns: Lafayette, Youngsville, Broussard, Scott, Carencro, Breaux Bridge (in every page footer band, the inquire page and the JSON-LD in `index.html`).
- Confirm the occasion lists on `/flowers` match what Amelie makes.
- Add photos (see above).
- Add the client reviews section on the home page once there are quotes with permission (template is commented out in `index.html`).
- Connect the domain in Vercel (Settings > Domains). `robots.txt`, `sitemap.xml` and the JSON-LD already point to `https://thelittleflowersblooms.com`.
- Add the site to Google Search Console and submit the sitemap.
- Vercel's free Hobby plan is for non-commercial use only. A business site needs the Pro plan.

## Running locally

```
npx vercel dev
```
