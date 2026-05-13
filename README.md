# ◈ Clarity — Guía de instalación y deploy

Sitio web completo con landing page, registro, monetización con Mercado Pago, y entrega de contenido premium.

---

## 📁 Estructura del proyecto

```
clarity/
├── index.html              ← Landing page principal
├── register.html           ← Registro de usuarios
├── login.html              ← Inicio de sesión
├── dashboard.html          ← Área de usuario + Admin panel
├── payment-success.html    ← Página de pago exitoso
├── legal.html              ← Términos y privacidad
├── styles.css              ← Estilos globales
├── main.js                 ← JavaScript del frontend
├── config.js               ← Variables de configuración
├── vercel.json             ← Configuración de Vercel
├── supabase-schema.sql     ← Schema de la base de datos
└── api/
    ├── create-payment.js   ← Crea preferencia en Mercado Pago
    ├── payment-webhook.js  ← Recibe confirmación de pago
    ├── send-email.js       ← Envía emails con Resend
    └── send-whatsapp.js    ← Envía mensajes por WhatsApp Business
```

---

## 🚀 Setup paso a paso

### 1. Supabase (base de datos + auth)

1. Creá una cuenta en [supabase.com](https://supabase.com) (gratis)
2. Creá un nuevo proyecto
3. Ve a **SQL Editor** → pegá todo el contenido de `supabase-schema.sql` → Run
4. Ve a **Settings → API** y copiá:
   - `Project URL` → va en `config.js` como `SUPABASE_URL`
   - `anon public` key → va en `config.js` como `SUPABASE_ANON_KEY`
   - `service_role` key → va como variable de entorno en Vercel (`SUPABASE_SERVICE_KEY`)

### 2. Mercado Pago

1. Creá una cuenta en [mercadopago.com](https://mercadopago.com)
2. Ve a **Mis aplicaciones** → Creá una aplicación
3. Copiá tu **Access Token** (usá las credenciales de *prueba* primero)
4. Esta clave va como variable de entorno en Vercel: `MP_ACCESS_TOKEN`
5. **Para pruebas**: el Dashboard de MP tiene usuarios de prueba y tarjetas de test

### 3. Resend (emails gratis)

1. Creá cuenta en [resend.com](https://resend.com)
2. Verificá tu dominio (o usá el dominio de prueba de Resend)
3. Copiá tu API Key → va como `RESEND_API_KEY` en Vercel
4. En `api/send-email.js`, cambiá `hola@tudominio.com` por tu email verificado

### 4. WhatsApp Business API (opcional)

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Creá una app de tipo **Business**
3. Agregá el producto **WhatsApp**
4. Copiá el **Token de acceso temporal** → `WA_TOKEN` en Vercel
5. Copiá el **Phone Number ID** → `WA_PHONE_ID` en Vercel
6. Para producción, necesitás verificar tu empresa con Meta

---

## ☁️ Deploy en Vercel

### Opción A: Desde GitHub (recomendado)

1. Subí la carpeta del proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) → Import Project → elegí tu repo
3. En **Environment Variables** agregá:

| Variable | Valor |
|----------|-------|
| `MP_ACCESS_TOKEN` | Tu token de Mercado Pago |
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase |
| `RESEND_API_KEY` | Tu API key de Resend |
| `WA_TOKEN` | Token de WhatsApp Business |
| `WA_PHONE_ID` | Phone Number ID de WhatsApp |
| `APP_URL` | URL de tu sitio en Vercel |

4. Deploy → ¡listo!

### Opción B: Vercel CLI

```bash
npm i -g vercel
cd clarity/
vercel
# Seguí los prompts
vercel env add MP_ACCESS_TOKEN
# Repetí para cada variable
vercel --prod
```

---

## 🔒 Hacer a alguien administrador

Después del primer deploy, ve a **Supabase → SQL Editor** y ejecutá:

```sql
update public.profiles 
set is_admin = true 
where email = 'tu@email.com';
```

El panel de Admin aparecerá en el Dashboard del usuario con ese email.

---

## 📝 Personalización rápida

| Qué cambiar | Dónde |
|-------------|-------|
| Colores | `styles.css` → variables `:root` |
| Frases del hero | `index.html` → sección `.hero-content` |
| Precio | `index.html` + `api/create-payment.js` |
| Moneda | `api/create-payment.js` → `currency_id` |
| Logo/nombre | Buscar "Clarity" y "◈" en todos los HTML |
| Email de contacto | `legal.html` + `api/send-email.js` |

---

## 🧪 Probar pagos con Mercado Pago Sandbox

- Activá el modo sandbox con las credenciales de prueba de MP
- Usá las tarjetas de prueba que provee MP: [ver aquí](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)
- Una vez confirmado que funciona, cambiá a credenciales de producción

---

## ❓ Soporte

Para consultas: editá este README con tu email de contacto.

**Clarity** — *Tu mente despierta, tu vida cambia.* ◈
