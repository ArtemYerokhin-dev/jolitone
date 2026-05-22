import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const FROM = process.env.SMTP_FROM || 'Joli Tone <noreply@jolitone.pp.ua>'
const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000'
const SITE    = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── Telegram ─────────────────────────────────────────────────────────────────
export async function sendTelegramOrder(order) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const items = order.items.map(i =>
    `• ${i.product_name}${i.size ? ` (${i.size})` : ''} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString('uk-UA')} ₴`
  ).join('\n')

  const discount = Number(order.discount_amount) > 0
    ? `\n🏷 Промокод <b>${order.promo_code}</b>: −${Number(order.discount_amount).toLocaleString('uk-UA')} ₴`
    : ''

  const text =
    `🛍 <b>Нове замовлення #${order.id}</b>\n\n` +
    `👤 ${order.name}\n📱 ${order.phone}` +
    (order.city ? `\n📍 ${order.city}` : '') +
    discount +
    `\n\n💰 Сума: <b>${Number(order.total).toLocaleString('uk-UA')} ₴</b>\n\n` +
    `<b>Товари:</b>\n${items}`

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch (err) {
    console.error('Telegram error:', err.message)
  }
}

// ── Email verification ────────────────────────────────────────────────────────
export async function sendVerificationEmail(to, name, token) {
  const link = `${BACKEND}/api/auth/verify-email?token=${token}`
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Підтвердьте вашу пошту — Joli Tone',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1917;">
        <h2 style="font-weight:300;font-size:24px;margin-bottom:8px;">Вітаємо, ${name}!</h2>
        <p style="font-size:14px;color:#6B6560;line-height:1.6;margin-bottom:24px;">
          Підтвердьте вашу електронну адресу, натиснувши кнопку нижче.
        </p>
        <a href="${link}" style="display:inline-block;background:#2C1A0E;color:#fff;text-decoration:none;
           font-size:12px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:12px;">
          Підтвердити пошту
        </a>
        <p style="font-size:11px;color:#9E9890;margin-top:24px;">
          Посилання дійсне 24 години. Якщо ви не реєструвалися — просто ігноруйте цей лист.
        </p>
        <hr style="border:none;border-top:1px solid #EDE8E3;margin:24px 0;" />
        <p style="font-size:11px;color:#9E9890;">© ${new Date().getFullYear()} Joli Tone</p>
      </div>
    `,
  })
}

// ── Order confirmation ────────────────────────────────────────────────────────
export async function sendOrderConfirmation(to, name, order) {
  const itemsHtml = order.items.map(i =>
    `<tr>
      <td style="padding:8px 0;font-size:13px;color:#1A1917;">${i.product_name}</td>
      <td style="padding:8px 0;font-size:13px;color:#6B6560;text-align:center;">${i.size || '—'}</td>
      <td style="padding:8px 0;font-size:13px;color:#6B6560;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;font-size:13px;color:#1A1917;text-align:right;">${(i.price * i.quantity).toLocaleString('uk-UA')} ₴</td>
    </tr>`
  ).join('')

  const discountRow = Number(order.discount_amount) > 0
    ? `<div style="padding-top:8px;text-align:right;color:#16a34a;font-size:13px;">
         Знижка (${order.promo_code}): −${Number(order.discount_amount).toLocaleString('uk-UA')} ₴
       </div>`
    : ''

  await transporter.sendMail({
    from: FROM, to,
    subject: `Замовлення #${order.id} прийнято — Joli Tone`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1917;">
        <h2 style="font-weight:300;font-size:22px;margin-bottom:4px;">Дякуємо, ${name}!</h2>
        <p style="font-size:13px;color:#6B6560;margin-bottom:24px;">
          Замовлення <b>#${order.id}</b> отримано. Ми зв'яжемось з вами найближчим часом.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="border-bottom:1px solid #EDE8E3;">
              <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#9E9890;padding-bottom:8px;">Товар</th>
              <th style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#9E9890;padding-bottom:8px;">Розмір</th>
              <th style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#9E9890;padding-bottom:8px;">Кіл.</th>
              <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#9E9890;padding-bottom:8px;">Сума</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        ${discountRow}
        <div style="border-top:1px solid #EDE8E3;padding-top:12px;text-align:right;">
          <span style="font-size:14px;color:#1A1917;font-weight:500;">Разом: ${Number(order.total).toLocaleString('uk-UA')} ₴</span>
        </div>
        <div style="margin-top:24px;">
          <a href="${SITE}/track?id=${order.id}" style="font-size:12px;color:#6B6560;">
            Відстежити замовлення →
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #EDE8E3;margin:24px 0;" />
        <p style="font-size:11px;color:#9E9890;">© ${new Date().getFullYear()} Joli Tone · <a href="${SITE}" style="color:#9E9890;">${SITE.replace('https://', '').replace('http://', '')}</a></p>
      </div>
    `,
  })
}

// ── Stock notification ────────────────────────────────────────────────────────
export async function sendStockNotification(to, productName, productId) {
  const productUrl = `${SITE}/product/${productId}`
  await transporter.sendMail({
    from: FROM, to,
    subject: `${productName} — знову в наявності! ✨`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1917;">
        <h2 style="font-weight:300;font-size:22px;margin-bottom:8px;">Товар знову є!</h2>
        <p style="font-size:14px;color:#6B6560;line-height:1.6;margin-bottom:24px;">
          <b>${productName}</b>, на який ви підписались, знову з'явився в наявності. Поспішайте!
        </p>
        <a href="${productUrl}" style="display:inline-block;background:#2C1A0E;color:#fff;text-decoration:none;
           font-size:12px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:12px;">
          Переглянути товар
        </a>
        <hr style="border:none;border-top:1px solid #EDE8E3;margin:24px 0;" />
        <p style="font-size:11px;color:#9E9890;">© ${new Date().getFullYear()} Joli Tone</p>
      </div>
    `,
  })
}
