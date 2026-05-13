// ============================================================
// CLARITY — CONFIGURACIÓN
// Reemplazá estos valores con los tuyos antes de deployar.
// En Vercel, ponelos como Variables de Entorno y usá el 
// archivo config-vercel.js para inyectarlos en el frontend.
// ============================================================

// ── SUPABASE ─────────────────────────────────────────────
// Obtené estos valores en: https://supabase.com → Settings → API
const SUPABASE_URL      = 'https://nkuxstcilmbtvqradsdj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdXhzdGNpbG1idHZxcmFkc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzUyMjgsImV4cCI6MjA5NDIxMTIyOH0.lxfvYZ8Q1sImz-Xbmm7Kxcs_ODLwGvHJIVZXXLl30uw';

// ── MERCADO PAGO ─────────────────────────────────────────
// Esta clave se usa SOLO en el backend (api/create-payment.js)
// NUNCA la pongas en el frontend
// const MP_ACCESS_TOKEN = 'APP_USR-XXXXXXXXX...';

// ── WHATSAPP BUSINESS API ─────────────────────────────────
// Se usa en el backend (api/send-whatsapp.js)
// const WA_TOKEN      = 'tu_token_de_whatsapp_business';
// const WA_PHONE_ID   = 'tu_phone_number_id';
