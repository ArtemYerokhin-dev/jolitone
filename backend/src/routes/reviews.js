import { Router } from 'express'
import pool from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/reviews — публічні затверджені відгуки
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, author, text, product, created_at FROM reviews WHERE approved = TRUE ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// POST /api/reviews — залишити відгук
router.post('/', async (req, res) => {
  try {
    const { author, text, product } = req.body
    if (!author || !text) return res.status(400).json({ error: 'Заповніть всі поля' })

    await pool.query(
      'INSERT INTO reviews (author, text, product) VALUES ($1, $2, $3)',
      [author, text, product || null]
    )
    res.status(201).json({ message: 'Відгук отримано, чекає модерації' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// GET /api/reviews/pending — всі відгуки на модерацію (адмін)
router.get('/pending', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE approved = FALSE ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// PATCH /api/reviews/:id/approve — затвердити відгук (адмін)
router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET approved = TRUE WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// DELETE /api/reviews/:id — видалити відгук (адмін)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
