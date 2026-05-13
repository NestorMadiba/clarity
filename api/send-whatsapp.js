// api/send-whatsapp.js — Envía mensaje por WhatsApp Business API

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'Missing phone' });

  const WA_TOKEN    = process.env.WA_TOKEN;
  const WA_PHONE_ID = process.env.WA_PHONE_ID;
  if (!WA_TOKEN || !WA_PHONE_ID) {
    return res.status(500).json({ error: 'WhatsApp API no configurado' });
  }

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

  try {
    const r = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WA_TOKEN}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: `🌟 *Clarity* — Tu contenido premium está listo. Ingresá a tu dashboard: ${process.env.APP_URL}/dashboard.html ◈` }
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || 'WhatsApp error');
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
