import { Router } from 'express'

const router = Router()

// In-memory placeholder. Replace with DB queries later.
let products = []

router.get('/', (req, res) => {
  const { category } = req.query
  const result = category ? products.filter((p) => p.category === category) : products
  res.json(result)
})

router.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id)
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json(product)
})

router.post('/', (req, res) => {
  const product = { id: Date.now().toString(), ...req.body }
  products.push(product)
  res.status(201).json(product)
})

router.put('/:id', (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  products[idx] = { ...products[idx], ...req.body }
  res.json(products[idx])
})

router.delete('/:id', (req, res) => {
  products = products.filter((p) => p.id !== req.params.id)
  res.status(204).end()
})

export default router
