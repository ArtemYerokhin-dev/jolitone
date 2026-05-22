import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { sendVerificationEmail } from '../mail.js'

const router = Router()

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Заповніть всі поля' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль мінімум 6 символів' })
    }

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Такий email вже зареєстрований' })
    }

    const hash = await bcrypt.hash(password, 10)
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password, verify_token, verify_token_expires)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, email_verified`,
      [email.toLowerCase(), name, hash, verifyToken, verifyExpires]
    )
    const user = rows[0]

    // Відправити email підтвердження (не блокуємо відповідь)
    sendVerificationEmail(user.email, user.name, verifyToken).catch(err =>
      console.error('Email send error:', err.message)
    )

    res.status(201).json({
      token: makeToken(user),
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.email_verified },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ error: 'Токен відсутній' })

    const { rows } = await pool.query(
      `SELECT id FROM users WHERE verify_token = $1 AND verify_token_expires > NOW()`,
      [token]
    )
    if (!rows.length) {
      return res.status(400).json({ error: 'Токен недійсний або прострочений' })
    }

    await pool.query(
      `UPDATE users SET email_verified = TRUE, verify_token = NULL, verify_token_expires = NULL WHERE id = $1`,
      [rows[0].id]
    )

    // Редіректимо на фронтенд зі статусом
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontend}/email-verified`)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// POST /api/auth/resend-verification — повторно надіслати лист
router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' })
    if (user.email_verified) return res.status(400).json({ error: 'Email вже підтверджено' })

    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await pool.query(
      `UPDATE users SET verify_token = $1, verify_token_expires = $2 WHERE id = $3`,
      [verifyToken, verifyExpires, user.id]
    )
    await sendVerificationEmail(user.email, user.name, verifyToken)
    res.json({ message: 'Лист надіслано' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Введіть email та пароль' })
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неправильний email або пароль' })
    }

    res.json({ token: makeToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.email_verified } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// GET /api/auth/me — перевірити токен і отримати дані юзера
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, email_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Користувача не знайдено' })
    const u = rows[0]
    res.json({ ...u, emailVerified: u.email_verified })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// PATCH /api/auth/me — оновити профіль
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, password } = req.body
    if (name) {
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id])
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Пароль мінімум 6 символів' })
      const hash = await bcrypt.hash(password, 10)
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id])
    }
    const { rows } = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router
