// Gumroad license verification proxy (avoids CORS, keeps product ref server-side)
const PRODUCT_PERMALINK = "ycwbg";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "method" });
    return;
  }
  try {
    const key = (req.body && req.body.key ? String(req.body.key) : "").trim();
    if (!key || key.length < 8 || key.length > 64) {
      res.status(400).json({ success: false, error: "bad_key" });
      return;
    }
    const r = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_permalink: PRODUCT_PERMALINK,
        license_key: key,
        increment_uses_count: "false",
      }),
    });
    const data = await r.json();
    const p = data && data.purchase;
    if (data.success && p && !p.refunded && !p.chargebacked && !p.disputed) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: "server" });
  }
};
