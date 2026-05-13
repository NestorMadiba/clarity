// api/send-email.js — Envía email usando Resend (gratis hasta 3000/mes)
// Documentación: https://resend.com/docs
//
// Variables de entorno:
//   RESEND_API_KEY   → Obtenelo gratis en https://resend.com
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, type, fileUrl, fileName } = req.body;
  if (!to) return res.status(400).json({ error: 'Missing email' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  // Obtener contenido más reciente si no se especifica
  let contentUrl = fileUrl;
  let contentName = fileName || 'Recurso Clarity';

  if (!contentUrl) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data } = await supabase
      .from('content_items')
      .select('file_url, title')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) { contentUrl = data.file_url; contentName = data.title; }
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Georgia, serif; background: #04080f; color: #e8edf5; padding: 40px 20px; margin:0;">
      <div style="max-width:520px;margin:0 auto;background:#0b1526;border-radius:16px;padding:40px;border:1px solid rgba(0,200,220,0.15);">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:2rem;color:#00c8dc;">◈</span>
          <h1 style="font-size:1.8rem;font-weight:300;color:#e8edf5;margin:8px 0 0;">Clarity</h1>
        </div>
        <h2 style="font-size:1.4rem;font-weight:400;color:#00c8dc;margin-bottom:16px;">Tu recurso está listo</h2>
        <p style="color:#7a8fa8;line-height:1.7;margin-bottom:24px;">
          Hola,<br/><br/>
          Desde el equipo de <strong style="color:#e8edf5;">Clarity</strong> te enviamos el siguiente recurso:
          <strong style="color:#e8edf5;">${contentName}</strong>.
        </p>
        ${contentUrl ? `
        <div style="text-align:center;margin:32px 0;">
          <a href="${contentUrl}" 
             style="background:#00c8dc;color:#04080f;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:500;display:inline-block;">
            Descargar recurso
          </a>
        </div>` : ''}
        <p style="color:#7a8fa8;font-size:0.85rem;line-height:1.7;border-top:1px solid rgba(0,200,220,0.1);padding-top:20px;margin-top:20px;">
          Tu mente despierta, tu vida cambia.<br/>
          <em>— Equipo Clarity</em>
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: 'Clarity <hola@tudominio.com>',   // ← cambiá por tu dominio verificado en Resend
        to: [to],
        subject: `Tu recurso de Clarity: ${contentName}`,
        html: emailHtml
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Resend error');
    return res.status(200).json({ ok: true, id: d.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
