// api/create-payment.js — Vercel Serverless Function

module.exports = async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
  const APP_URL  = process.env.APP_URL || 'https://tu-sitio.vercel.app';

  if (!MP_TOKEN) {
    console.error('ERROR: MP_ACCESS_TOKEN no está configurado en Vercel');
    return res.status(500).json({ error: 'Configuración de pago incompleta. Contactá al administrador.' });
  }

  const { userId, userEmail } = req.body || {};
  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'Faltan datos del usuario' });
  }

  const preference = {
    items: [
      {
        title: 'Clarity Premium',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: 9
      }
    ],
    payer: { email: userEmail },
    external_reference: userId,
    back_urls: {
      success: `${APP_URL}/payment-success.html`,
      failure: `${APP_URL}/dashboard.html`,
      pending: `${APP_URL}/dashboard.html`
    },
    auto_return: 'approved',
    notification_url: `${APP_URL}/api/payment-webhook`
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago error:', JSON.stringify(mpData));
      return res.status(500).json({
        error: 'Error en Mercado Pago: ' + (mpData.message || mpData.error || 'Error desconocido')
      });
    }

    return res.status(200).json({
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
    });

  } catch (e) {
    console.error('Error inesperado:', e.message);
    return res.status(500).json({ error: 'Error interno: ' + e.message });
  }
};
