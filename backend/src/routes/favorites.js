import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/favorites — список обраних юзера
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT product_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(rows.map((r) => r.product_id))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// POST /api/favorites — додати в обрані
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId } = req.body
    if (!productId) return res.status(400).json({ error: 'productId обовʼязковий' })

    await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, productId]
    )
    res.status(201).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// DELETE /api/favorites/:productId — прибрати з обраних
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    )
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
