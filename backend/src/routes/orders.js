import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { sendOrderConfirmation, sendTelegramOrder } from '../mail.js'

const router = Router()

// Генерує унікальний 6-значний номер замовлення
async function generateOrderNumber(client) {
  for (let i = 0; i < 20; i++) {
    const n = Math.floor(Math.random() * 900000) + 100000
    const { rows } = await client.query('SELECT id FROM orders WHERE order_number = $1', [n])
    if (!rows.length) return n
  }
  throw new Error('Не вдалося згенерувати номер замовлення')
}

// POST /api/orders — створити замовлення
router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const { name, phone, email, city, delivery, comment, items, userId, promoCode } = req.body
    if (!name || !phone || !items?.length) {
      return res.status(400).json({ error: 'Вкажіть імʼя, телефон та товари' })
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0)

    // Перевірити та застосувати промокод
    let discountAmount = 0
    let validPromoCode = null

    if (promoCode) {
      const { rows: promoRows } = await pool.query(
        `SELECT * FROM promo_codes WHERE UPPER(code) = UPPER($1)`,
        [promoCode.trim()]
      )
      const promo = promoRows[0]
      if (
        promo &&
        (!promo.expires_at || new Date(promo.expires_at) >= new Date()) &&
        (promo.uses_left === null || promo.uses_left > 0) &&
        subtotal >= Number(promo.min_order || 0)
      ) {
        discountAmount = Math.round(subtotal * promo.discount_percent / 100)
        validPromoCode = promo.code
      }
    }

    const total = subtotal - discountAmount

    await client.query('BEGIN')

    const orderNumber = await generateOrderNumber(client)

    const { rows } = await client.query(
      `INSERT INTO orders (user_id, name, phone, email, city, delivery, comment, total, promo_code, discount_amount, order_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, order_number`,
      [userId || null, name, phone, email || null, city || null, delivery || null,
       comment || null, total, validPromoCode, discountAmount, orderNumber]
    )
    const orderId     = rows[0].id
    const orderNum    = rows[0].order_number

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, size, color, price, quantity)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [orderId, item.productId, item.productName,
         item.size || null, item.color || null, item.price, item.quantity || 1]
      )
    }

    // Знижуємо кількість використань промокоду
    if (validPromoCode) {
      await client.query(
        `UPDATE promo_codes SET uses_left = uses_left - 1 WHERE code = $1 AND uses_left IS NOT NULL`,
        [validPromoCode]
      )
    }

    await client.query('COMMIT')

    // Листи та Telegram асинхронно
    const { rows: orderItems } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1', [orderId]
    )
    const fullOrder = { id: orderNum, name, phone, city, total, promo_code: validPromoCode, discount_amount: discountAmount, items: orderItems }

    if (email) {
      sendOrderConfirmation(email, name, fullOrder).catch(err =>
        console.error('Order email error:', err.message)
      )
    }
    sendTelegramOrder(fullOrder).catch(err =>
      console.error('Telegram error:', err.message)
    )

    res.status(201).json({ id: orderNum, message: 'Замовлення прийнято' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  } finally {
    client.release()
  }
})

// GET /api/orders/track/:orderNumber — публічний трекінг за 6-значним номером
router.get('/track/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, order_number, name, status, total, discount_amount, promo_code, created_at FROM orders WHERE order_number = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Замовлення не знайдено' })
    const order = rows[0]
    const { rows: items } = await pool.query(
      `SELECT product_name, size, quantity, price FROM order_items WHERE order_id = $1`,
      [order.id]
    )
    order.items = items
    order.id = order.order_number  // показуємо order_number як id для фронтенду
    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// GET /api/orders/my — замовлення поточного юзера
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    for (const order of orders) {
      const { rows: items } = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1', [order.id]
      )
      order.items = items
    }
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
