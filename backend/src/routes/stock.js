import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/stock/:productId — публічна перевірка залишку
router.get('/:productId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT quantity FROM stock WHERE product_id = $1`,
      [req.params.productId]
    )
    res.json({ quantity: rows.length ? rows[0].quantity : null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
