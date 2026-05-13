// api/send-whatsapp.js — Envía mensaje por WhatsApp Business API
// Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api
//
// Variables de entorno:
//   WA_TOKEN       → Token de acceso de WhatsApp Business (Meta for Developers)
//   WA_PHONE_ID    → Phone Number ID de tu número de WhatsApp Business

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, message, fileUrl, fileName } = req.body;
  if (!phone) return res.status(400).json({ error: 'Missing phone number' });

  const WA_TOKEN    = process.env.WA_TOKEN;
  const WA_PHONE_ID = process.env.WA_PHONE_ID;

  if (!WA_TOKEN || !WA_PHONE_ID) {
    return res.status(500).json({ error: 'WhatsApp API not configured. Set WA_TOKEN and WA_PHONE_ID.' });
  }

  // Limpiar número: quitar espacios y guiones
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

  const body = fileUrl
    ? {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'document',
        document: {
          link: fileUrl,
          caption: `📄 *Clarity* — Tu recurso está listo: *${fileName || 'Contenido premium'}*\n\nTu mente despierta, tu vida cambia. ◈`,
          filename: fileName || 'clarity-recurso.pdf'
        }
      }
    : {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: {
          body: message || `🌟 *Clarity* — Hola! Revisá tu área personal en nuestro sitio para acceder a tu contenido premium.\n\nTu mente despierta, tu vida cambia. ◈`
        }
      };

  try {
    const r = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WA_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const d = await r.json();
    if (!r.ok) {
      console.error('WA Error:', d);
      throw new Error(d.error?.message || 'WhatsApp API error');
    }
    return res.status(200).json({ ok: true, messageId: d.messages?.[0]?.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
