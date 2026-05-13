// api/send-email.js — Envía email usando Resend

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { to } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Missing email' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY no configurado' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Clarity <onboarding@resend.dev>',
        to: [to],
        subject: 'Tu contenido de Clarity está listo',
        html: `<div style="font-family:Georgia,serif;background:#04080f;color:#e8edf5;padding:40px;border-radius:16px;">
          <h1 style="color:#00c8dc;">◈ Clarity</h1>
          <p>Tu contenido premium está disponible en tu dashboard.</p>
          <a href="${process.env.APP_URL}/dashboard.html" style="background:#00c8dc;color:#04080f;padding:12px 24px;border-radius:100px;text-decoration:none;">Ir a mi espacio</a>
        </div>`
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Resend error');
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
