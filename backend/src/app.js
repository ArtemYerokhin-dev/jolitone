import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRouter       from './routes/auth.js'
import favoritesRouter  from './routes/favorites.js'
import ordersRouter     from './routes/orders.js'
import reviewsRouter    from './routes/reviews.js'
import adminRouter      from './routes/admin.js'
import promoRouter      from './routes/promo.js'
import stockRouter      from './routes/stock.js'
import notifyRouter     from './routes/notify.js'

const app  = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth',         authRouter)
app.use('/api/favorites',    favoritesRouter)
app.use('/api/orders',       ordersRouter)
app.use('/api/reviews',      reviewsRouter)
app.use('/api/admin',        adminRouter)
app.use('/api/promo',        promoRouter)
app.use('/api/stock',        stockRouter)
app.use('/api/notify-stock', notifyRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`Joli Tone API running on http://localhost:${PORT}`))

export default app
