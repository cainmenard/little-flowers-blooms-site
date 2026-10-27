// Inquiry form handler (Vercel serverless function).
// Sends each inquiry to Amélie by email through Resend (https://resend.com).
//
// Environment variables (set in Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY     required. API key from resend.com
//   INQUIRY_TO_EMAIL   required. Where inquiries go (Amélie's email)
//   FROM_EMAIL         optional. Sender once the domain is verified in Resend,
//                      e.g. "The Little Flower's Blooms <hello@thelittleflowersblooms.com>".
//                      Until then Resend's test sender is used, which can only
//                      deliver to the email address that owns the Resend account.

const LIMITS = {
  name: 120, contact: 160, event: 40, date: 20, venue: 160, count: 60,
  budget: 40, inspiration: 500, notes: 2000, source: 60
};

function clean(value, max) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function prettyDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Spam checks: hidden field filled, or form sent within 3 seconds of loading.
  const started = Number(body.started);
  if (body.company || (started && Date.now() - started < 3000)) {
    return res.status(200).json({ ok: true });
  }

  const data = {};
  for (const [key, max] of Object.entries(LIMITS)) data[key] = clean(body[key], max);
  const needs = Array.isArray(body.needs) ? body.needs.slice(0, 10).map((n) => clean(n, 60)).filter(Boolean) : [];

  const missing = ["name", "contact", "event", "date", "venue"].filter((k) => !data[k]);
  if (missing.length) return res.status(400).json({ error: "missing_fields", fields: missing });
  if (data.inspiration && !/^https?:\/\//i.test(data.inspiration)) data.inspiration = "";

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  if (!apiKey || !to) return res.status(503).json({ error: "not_configured" });

  const from = process.env.FROM_EMAIL || "The Little Flower's Blooms <onboarding@resend.dev>";
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact) ? data.contact : undefined;

  const rows = [
    ["Name", data.name],
    ["Email or phone", data.contact],
    ["Event", data.event],
    ["Date", prettyDate(data.date)],
    ["Town or venue", data.venue],
    ["Guests or pieces", data.count],
    ["Budget", data.budget],
    ["Needs", needs.join(", ")],
    ["Inspiration", data.inspiration],
    ["Heard about you from", data.source],
    ["Notes", data.notes]
  ].filter(([, v]) => v);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2 style="font-family:Georgia,serif">New inquiry: ${escapeHtml(data.event)} on ${escapeHtml(prettyDate(data.date))}</h2>
<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="color:#5A6357;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`).join("\n")}
</table>
<p style="font-family:Arial,sans-serif;color:#5A6357">Reply within 24 hours: the site promises it.</p>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject: `New ${data.event.toLowerCase()} inquiry: ${prettyDate(data.date)}, ${data.name}`,
        text,
        html
      })
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("Resend error", r.status, detail.slice(0, 500));
      return res.status(502).json({ error: "send_failed" });
    }
  } catch (err) {
    console.error("Resend request failed", err);
    return res.status(502).json({ error: "send_failed" });
  }

  return res.status(200).json({ ok: true });
}
