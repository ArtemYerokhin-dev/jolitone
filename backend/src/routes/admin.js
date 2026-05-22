import { Router } from 'express'
import pool from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { transporter, FROM, sendStockNotification } from '../mail.js'

const router = Router()
router.use(requireAdmin)

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [ordersTotal, revenueTotal, ordersByMonth, topProducts, usersTotal] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM orders`),
      pool.query(`SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'`),
      pool.query(`
        SELECT TO_CHAR(created_at,'YYYY-MM') as month,
               COUNT(*) as orders,
               COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month ORDER BY month DESC
      `),
      pool.query(`
        SELECT oi.product_name, SUM(oi.quantity) as sold, SUM(oi.price * oi.quantity) as revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status != 'cancelled'
        GROUP BY oi.product_name
        ORDER BY sold DESC LIMIT 10
      `),
      pool.query(`SELECT COUNT(*) FROM users`),
    ])
    res.json({
      orders:      Number(ordersTotal.rows[0].count),
      revenue:     Number(revenueTotal.rows[0].revenue),
      byMonth:     ordersByMonth.rows,
      topProducts: topProducts.rows,
      users:       Number(usersTotal.rows[0].count),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// ── Stock ─────────────────────────────────────────────────────────────────────
router.get('/stock', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stock ORDER BY product_id')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

router.put('/stock/:productId', async (req, res) => {
  try {
    const { quantity } = req.body
    const productId = req.params.productId

    // Попередній залишок (щоб зрозуміти чи товар відновився)
    const { rows: prev } = await pool.query(
      'SELECT quantity FROM stock WHERE product_id = $1', [productId]
    )
    const prevQty = prev.length ? prev[0].quantity : null

    await pool.query(
      `INSERT INTO stock (product_id, quantity, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (product_id) DO UPDATE SET quantity = $2, updated_at = NOW()`,
      [productId, quantity]
    )

    // Якщо товар відновився з 0 → надіслати сповіщення підписникам
    if (quantity > 0 && (prevQty === 0 || prevQty === null)) {
      const { rows: subs } = await pool.query(
        `SELECT email FROM stock_notifications WHERE product_id = $1 AND notified_at IS NULL`,
        [productId]
      )
      if (subs.length > 0) {
        const { rows: nameRows } = await pool.query(
          `SELECT product_name FROM order_items WHERE product_id = $1 LIMIT 1`, [productId]
        )
        const productName = nameRows[0]?.product_name || productId
        for (const { email } of subs) {
          sendStockNotification(email, productName, productId).catch(console.error)
        }
        await pool.query(
          `UPDATE stock_notifications SET notified_at = NOW() WHERE product_id = $1 AND notified_at IS NULL`,
          [productId]
        )
      }
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { rows: orders } = await pool.query('SELECT *, COALESCE(order_number, id) as display_id FROM orders ORDER BY created_at DESC')
    for (const order of orders) {
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id])
      order.items = items
    }
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const allowed = ['new','confirmed','sent','done','cancelled']
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Невалідний статус' })
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Не знайдено' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// ── Promo codes ───────────────────────────────────────────────────────────────
router.get('/promo-codes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

router.post('/promo-codes', async (req, res) => {
  try {
    const { code, discount_percent, min_order, uses_left, expires_at } = req.body
    if (!code || !discount_percent) return res.status(400).json({ error: 'Вкажіть код та знижку' })
    const { rows } = await pool.query(
      `INSERT INTO promo_codes (code, discount_percent, min_order, uses_left, expires_at)
       VALUES (UPPER($1), $2, $3, $4, $5) RETURNING *`,
      [code.trim(), discount_percent, min_order || 0, uses_left || null, expires_at || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Такий промокод вже існує' })
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

router.delete('/promo-codes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM promo_codes WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// ── Newsletter ────────────────────────────────────────────────────────────────
router.post('/newsletter', async (req, res) => {
  try {
    const { subject, body } = req.body
    if (!subject || !body) return res.status(400).json({ error: 'Вкажіть тему та текст' })
    const { rows: users } = await pool.query(
      'SELECT email, name FROM users WHERE email_verified = TRUE'
    )
    if (!users.length) return res.status(400).json({ error: 'Немає підтверджених підписників' })
    const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1917;">
        <div style="white-space:pre-wrap;font-size:14px;line-height:1.7;">${body.replace(/\n/g, '<br>')}</div>
        <hr style="border:none;border-top:1px solid #EDE8E3;margin:32px 0;" />
        <p style="font-size:11px;color:#9E9890;">© ${new Date().getFullYear()} Joli Tone</p>
      </div>`
    let sent = 0
    for (const user of users) {
      try {
        await transporter.sendMail({ from: FROM, to: user.email, subject, html })
        sent++
      } catch { /* skip */ }
    }
    await pool.query(
      'INSERT INTO newsletter_logs (subject, body, sent_to) VALUES ($1,$2,$3)',
      [subject, body, sent]
    )
    res.json({ sent, total: users.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

router.get('/newsletter/logs', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM newsletter_logs ORDER BY sent_at DESC LIMIT 20')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: 'Помилка сервера' }) }
})

export default router
