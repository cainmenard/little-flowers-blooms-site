// Latest Instagram posts for the site's galleries (Vercel serverless function).
//
// Posts come from a Behold JSON feed (https://behold.so), which handles the
// Instagram login and token refresh. Behold's free plan allows 1,200 feed
// requests a month, so this function caches the feed at Vercel's CDN for
// 6 hours (Behold's free feed only updates once a day anyway). Visitors
// read the cached copy; Behold sees a handful of requests a day.
//
// Environment variable (Vercel > Project > Settings > Environment Variables):
//   BEHOLD_FEED_URL   the feed URL from Behold, e.g. https://feeds.behold.so/AbC123
//
// Without it, or when Behold is down, the function answers 200 with an empty
// post list and a status, and the pages keep their stock photos. (An error
// status would log a console error on every page view while unconnected.)

const MAX_POSTS = 12;
const OK_CACHE = "public, max-age=600, s-maxage=21600, stale-while-revalidate=86400";
const ERR_CACHE = "public, max-age=60, s-maxage=600";

function httpsUrl(value) {
  try {
    const u = new URL(String(value));
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}

function shorten(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,.;:!-]+$/, "") + "…";
}

function images(sizes) {
  if (!sizes || typeof sizes !== "object") return [];
  return ["small", "medium", "large"]
    .map((k) => sizes[k])
    .filter((s) => s && httpsUrl(s.mediaUrl) && s.width > 0 && s.height > 0)
    .map((s) => ({ url: httpsUrl(s.mediaUrl), width: Math.round(s.width), height: Math.round(s.height) }));
}

function normalize(feed) {
  const posts = Array.isArray(feed && feed.posts) ? feed.posts : [];
  const out = [];
  for (const p of posts) {
    const permalink = httpsUrl(p.permalink);
    if (!permalink.startsWith("https://www.instagram.com/")) continue;
    // Carousels: the first slide stands in for the post
    const first = p.mediaType === "CAROUSEL_ALBUM" && Array.isArray(p.children) && p.children[0];
    const imgs = images(p.sizes).length ? images(p.sizes) : images(first && first.sizes);
    if (!imgs.length) continue;
    const caption = shorten(p.prunedCaption || p.caption, 140);
    out.push({
      id: String(p.id || ""),
      permalink,
      isVideo: p.mediaType === "VIDEO",
      alt: shorten(p.altText, 200) || caption || "Flowers by Amélie, from Instagram",
      images: imgs,
    });
    if (out.length >= MAX_POSTS) break;
  }
  return { username: String((feed && feed.username) || "thelittleflowersblooms"), posts: out };
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const feedUrl = httpsUrl(process.env.BEHOLD_FEED_URL);
  if (!feedUrl.startsWith("https://feeds.behold.so/")) {
    res.setHeader("Cache-Control", ERR_CACHE);
    return res.status(200).json({ status: "not_configured", posts: [] });
  }

  try {
    const r = await fetch(feedUrl, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("feed status " + r.status);
    const data = normalize(await r.json());
    if (!data.posts.length) throw new Error("feed has no usable posts");
    res.setHeader("Cache-Control", OK_CACHE);
    return res.status(200).json({ status: "ok", ...data });
  } catch (err) {
    console.error("instagram feed failed:", err && err.message);
    res.setHeader("Cache-Control", ERR_CACHE);
    return res.status(200).json({ status: "feed_unavailable", posts: [] });
  }
}
