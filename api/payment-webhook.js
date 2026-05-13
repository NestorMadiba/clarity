// api/payment-webhook.js — Recibe notificaciones de Mercado Pago

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();

  const { type, data } = req.body || {};
  if (type !== 'payment') return res.status(200).json({ ok: true });

  const paymentId = data?.id;
  if (!paymentId) return res.status(400).json({ error: 'No payment id' });

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const payment = await mpRes.json();

    if (payment.status !== 'approved') {
      return res.status(200).json({ ok: true, status: payment.status });
    }

    const userId = payment.external_reference;
    if (!userId) return res.status(400).json({ error: 'No userId' });

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    await supabaseAdmin
      .from('profiles')
      .update({ has_paid: true, paid_at: new Date().toISOString(), mp_payment_id: String(paymentId) })
      .eq('id', userId);

    console.log(`Pago aprobado para usuario ${userId}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: e.message });
  }
};
