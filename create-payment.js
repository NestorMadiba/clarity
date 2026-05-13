// api/create-payment.js — Vercel Serverless Function
// Crea una preferencia de pago en Mercado Pago y retorna el checkout URL.
//
// Variables de entorno necesarias en Vercel:
//   MP_ACCESS_TOKEN   → Tu Access Token de Mercado Pago (producción o sandbox)
//   APP_URL           → URL de tu sitio (ej: https://clarity.vercel.app)
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY  → Service Role Key (NOT the anon key)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, userEmail, planName, amount } = req.body;
  if (!userId || !userEmail) return res.status(400).json({ error: 'Missing fields' });

  const APP_URL = process.env.APP_URL || 'https://tu-sitio.vercel.app';
  const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

  if (!MP_TOKEN) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  try {
    const preference = {
      items: [
        {
          title: planName || 'Clarity Premium',
          quantity: 1,
          currency_id: 'ARS', // Cambiá a USD, CLP, MXN, etc. según tu país
          unit_price: amount || 9
        }
      ],
      payer: { email: userEmail },
      external_reference: userId,  // Para identificar al usuario al confirmar el pago
      back_urls: {
        success: `${APP_URL}/payment-success.html`,
        failure: `${APP_URL}/dashboard.html`,
        pending: `${APP_URL}/dashboard.html`
      },
      auto_return: 'approved',
      notification_url: `${APP_URL}/api/payment-webhook`
    };

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
      console.error('MP Error:', mpData);
      return res.status(500).json({ error: mpData.message || 'MP error' });
    }

    return res.status(200).json({
      init_point: mpData.init_point,          // URL de producción
      sandbox_init_point: mpData.sandbox_init_point  // URL de prueba
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
