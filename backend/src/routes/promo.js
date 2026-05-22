import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// POST /api/promo/check — перевірка промокоду
router.post('/check', async (req, res) => {
  try {
    const { code, orderTotal } = req.body
    if (!code) return res.status(400).json({ error: 'Введіть промокод' })

    const { rows } = await pool.query(
      `SELECT * FROM promo_codes WHERE UPPER(code) = UPPER($1)`,
      [code.trim()]
    )
    if (!rows.length) return res.status(404).json({ error: 'Промокод не знайдено' })

    const promo = rows[0]

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Промокод вже не дійсний' })
    }
    if (promo.uses_left !== null && promo.uses_left <= 0) {
      return res.status(400).json({ error: 'Промокод вже вичерпаний' })
    }
    if (promo.min_order && Number(orderTotal) < Number(promo.min_order)) {
      return res.status(400).json({
        error: `Мінімальна сума для цього промокоду: ${Number(promo.min_order).toLocaleString('uk-UA')} ₴`,
      })
    }

    const discountAmount = Math.round(Number(orderTotal) * promo.discount_percent / 100)

    res.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discount_percent,
      discountAmount,
      message: `Знижка ${promo.discount_percent}% — −${discountAmount.toLocaleString('uk-UA')} ₴`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
