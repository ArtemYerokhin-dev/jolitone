import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// POST /api/notify-stock — підписатись на сповіщення
router.post('/', async (req, res) => {
  try {
    const { email, productId } = req.body
    if (!email || !productId) {
      return res.status(400).json({ error: 'email та productId obovyazkovi' })
    }
    await pool.query(
      `INSERT INTO stock_notifications (email, product_id)
       VALUES ($1, $2)
       ON CONFLICT (email, product_id) DO NOTHING`,
      [email.trim().toLowerCase(), productId]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
