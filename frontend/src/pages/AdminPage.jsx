import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { PRODUCTS } from '../data/products'

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtMoney(n) { return Number(n).toLocaleString('uk-UA') + ' ₴' }
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_OPTIONS = [
  { value: 'new',       label: 'Нове',         color: 'bg-nude-100 text-brand-black/60' },
  { value: 'confirmed', label: 'Підтверджено',  color: 'bg-blue-50 text-blue-600' },
  { value: 'sent',      label: 'Відправлено',   color: 'bg-amber-50 text-amber-600' },
  { value: 'done',      label: 'Виконано',      color: 'bg-green-50 text-green-600' },
  { value: 'cancelled', label: 'Скасовано',     color: 'bg-red-50 text-red-400' },
]
function statusMeta(s) { return STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0] }

const MONTH_UA = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру']
function fmtMonth(ym) {
  const [y, m] = ym.split('-')
  return `${MONTH_UA[Number(m) - 1]} ${y}`
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Дашборд',    icon: '▦' },
  { id: 'orders',    label: 'Замовлення', icon: '◻' },
  { id: 'stock',     label: 'Залишки',    icon: '⊟' },
  { id: 'promos',    label: 'Промокоди',  icon: '🏷' },
  { id: 'newsletter',label: 'Розсилка',   icon: '◉' },
]

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`border p-6 rounded-2xl ${accent ? 'bg-brand-black border-brand-black' : 'bg-white border-nude-200'}`}>
      <p className={`font-sans text-[12px] font-semibold uppercase tracking-widest mb-2 ${accent ? 'text-white/60' : 'text-brand-black/50'}`}>{label}</p>
      <p className={`font-sans text-4xl font-semibold ${accent ? 'text-white' : 'text-brand-black'}`}>{value}</p>
      {sub && <p className={`font-sans text-[15px] font-medium mt-1.5 ${accent ? 'text-white/50' : 'text-brand-black/40'}`}>{sub}</p>}
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ stats }) {
  if (!stats) return <p className="font-sans text-[15px] font-medium text-brand-black/40">Завантаження...</p>
  const maxRevenue = Math.max(...stats.byMonth.map(m => Number(m.revenue)), 1)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Замовлень" value={stats.orders} accent />
        <StatCard label="Виручка" value={fmtMoney(stats.revenue)} />
        <StatCard label="Клієнтів" value={stats.users} />
      </div>

      {/* Monthly chart */}
      {stats.byMonth.length > 0 && (
        <div className="bg-white border border-nude-200 rounded-2xl p-6">
          <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-5">Виручка по місяцях</p>
          <div className="flex items-end gap-3 h-32">
            {[...stats.byMonth].reverse().map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="font-sans text-[12px] font-medium text-brand-black/40">{fmtMoney(m.revenue)}</p>
                <div
                  className="w-full bg-brand-black/10 rounded-t-lg relative overflow-hidden"
                  style={{ height: '80px' }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-brand-black rounded-t-lg transition-all duration-500"
                    style={{ height: `${(Number(m.revenue) / maxRevenue) * 100}%` }}
                  />
                </div>
                <p className="font-sans text-[12px] font-medium text-brand-black/40">{fmtMonth(m.month)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top products */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
          <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 px-6 py-4 border-b border-nude-100">
            Топ товарів
          </p>
          <div className="divide-y divide-nude-100">
            {stats.topProducts.map((p, i) => (
              <div key={p.product_name} className="flex items-center gap-4 px-6 py-3">
                <span className="font-sans text-[13px] font-medium text-brand-black/25 w-4">{i + 1}</span>
                <p className="font-sans text-[15px] font-medium text-brand-black flex-1">{p.product_name}</p>
                <span className="font-sans text-[14px] font-medium text-brand-black/40">{p.sold} шт.</span>
                <span className="font-sans text-[15px] font-medium text-brand-black">{fmtMoney(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.getAdminOrders().then(setOrders).catch(console.error)
  }, [])

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = o.name?.toLowerCase().includes(q) || o.phone?.includes(q) || String(o.display_id || o.id).includes(q)
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  }), [orders, search, filterStatus])

  const changeStatus = async (id, status) => {
    await api.updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Пошук по імені, телефону, ID..."
          className="flex-1 min-w-52 border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
        />
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl"
        >
          <option value="all">Всі статуси</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="font-sans text-[15px] font-medium text-brand-black/40 py-8 text-center">Замовлень не знайдено</p>
      )}

      <div className="space-y-3">
        {filtered.map(order => {
          const meta = statusMeta(order.status)
          const isOpen = expanded === order.id
          return (
            <div key={order.id} className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-nude-50/50 transition-colors text-left"
              >
                <span className="font-sans text-[13px] font-medium text-brand-black/30 w-16">#{order.display_id || order.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[15px] font-medium text-brand-black truncate">{order.name}</p>
                  <p className="font-sans text-[13px] font-medium text-brand-black/40">{order.phone} · {fmtDate(order.created_at)}</p>
                </div>
                <span className={`font-sans text-[13px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full flex-shrink-0 ${meta.color}`}>
                  {meta.label}
                </span>
                <span className="font-sans text-[15px] font-medium text-brand-black flex-shrink-0">{fmtMoney(order.total)}</span>
                <span className="text-brand-black/30 text-[11px]">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="border-t border-nude-100 px-5 py-4 space-y-3">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-[52px] bg-nude-100 rounded-lg overflow-hidden flex-shrink-0">
                        {PRODUCTS.find(p => p.id === item.product_id)?.images?.[0] && (
                          <img src={PRODUCTS.find(p => p.id === item.product_id).images[0]} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[14px] font-medium text-brand-black truncate">{item.product_name}</p>
                        <p className="font-sans text-[13px] font-medium text-brand-black/40">
                          {item.size && `${item.size} · `}{item.quantity} шт · {fmtMoney(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.city && (
                    <p className="font-sans text-[13px] font-medium text-brand-black/40 pt-1">📍 {order.city}</p>
                  )}
                  <div className="flex gap-2 pt-1 flex-wrap">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => changeStatus(order.id, s.value)}
                        className={`font-sans text-[13px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-colors ${
                          order.status === s.value
                            ? 'bg-brand-black text-white border-brand-black'
                            : 'border-nude-200 text-brand-black/50 hover:border-brand-black/40'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stock Tab ─────────────────────────────────────────────────────────────────
const CATEGORIES_UA = { sukni: 'Сукні', bluzy: 'Блузи', kostyumy: 'Костюми', bryuky: 'Брюки', kardyhany: 'Кардигани', jumpsuits: 'Комбінезони', tkanyny: 'Тканини' }

function stockStatus(qty) {
  if (qty === undefined || qty === null) return { label: '∞', color: 'text-brand-black/40', bg: '' }
  if (qty === 0) return { label: '0', color: 'text-red-700', bg: 'bg-red-100 border-l-4 border-red-400' }
  if (qty <= 3)  return { label: qty, color: 'text-amber-700', bg: 'bg-amber-100 border-l-4 border-amber-400' }
  return { label: qty, color: 'text-green-800', bg: 'bg-green-100 border-l-4 border-green-500' }
}

function StockTab() {
  const [stock, setStock]       = useState({})
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy]     = useState('default')
  const [soldMap, setSoldMap]   = useState({})

  useEffect(() => {
    api.getStock().then(rows => {
      const map = {}
      rows.forEach(r => { map[r.product_id] = r.quantity })
      setStock(map)
    }).catch(console.error)

    api.getAdminOrders().then(orders => {
      const sold = {}
      orders.forEach(o => {
        if (o.status === 'cancelled') return
        o.items?.forEach(i => {
          sold[i.product_id] = (sold[i.product_id] || 0) + i.quantity
        })
      })
      setSoldMap(sold)
    }).catch(() => {})
  }, [])

  const updateStock = async (productId, qty) => {
    const next = Math.max(0, qty)
    setStock(prev => ({ ...prev, [productId]: next }))
    await api.updateStock(productId, next)
  }

  const setOutOfStock = (productId) => updateStock(productId, 0)

  const filtered = useMemo(() => {
    const base = PRODUCTS.filter(p => {
      const qty = stock[p.id]
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || p.category === category
      const matchFilter =
        filter === 'all' ? true :
        filter === 'out' ? qty === 0 :
        filter === 'low' ? (qty !== undefined && qty > 0 && qty <= 3) :
        filter === 'ok'  ? (qty === undefined || qty > 3) : true
      return matchSearch && matchCat && matchFilter
    })
    return [...base].sort((a, b) => {
      const soldA = soldMap[a.id] || 0
      const soldB = soldMap[b.id] || 0
      const qtyA  = stock[a.id] ?? 9999
      const qtyB  = stock[b.id] ?? 9999
      if (sortBy === 'sold_desc') return soldB - soldA
      if (sortBy === 'sold_asc')  return soldA - soldB
      if (sortBy === 'qty_asc')   return qtyA  - qtyB
      if (sortBy === 'qty_desc')  return qtyB  - qtyA
      if (sortBy === 'name_asc')  return a.name.localeCompare(b.name, 'uk')
      return 0
    })
  }, [stock, soldMap, search, category, filter, sortBy])

  const outCount = PRODUCTS.filter(p => stock[p.id] === 0).length
  const lowCount = PRODUCTS.filter(p => stock[p.id] !== undefined && stock[p.id] > 0 && stock[p.id] <= 3).length

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(outCount > 0 || lowCount > 0) && (
        <div className="flex gap-3 flex-wrap">
          {outCount > 0 && (
            <button onClick={() => setFilter('out')} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl hover:border-red-400 transition-colors">
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              <span className="font-sans text-[14px] font-medium text-red-500">{outCount} товарів закінчилось</span>
            </button>
          )}
          {lowCount > 0 && (
            <button onClick={() => setFilter('low')} className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl hover:border-amber-400 transition-colors">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="font-sans text-[14px] font-medium text-amber-600">{lowCount} товарів залишилось мало (≤3)</span>
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Пошук товару..."
          className="flex-1 min-w-40 border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
        />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="border border-nude-200 bg-white px-3 py-2.5 font-sans text-[15px] font-medium focus:outline-none rounded-xl">
          <option value="all">Всі категорії</option>
          {Object.entries(CATEGORIES_UA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border border-nude-200 bg-white px-3 py-2.5 font-sans text-[15px] font-medium focus:outline-none rounded-xl">
          <option value="all">Всі</option>
          <option value="out">Закінчились</option>
          <option value="low">Мало (≤3)</option>
          <option value="ok">В наявності</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="border border-nude-200 bg-white px-3 py-2.5 font-sans text-[15px] font-medium focus:outline-none rounded-xl">
          <option value="default">Сортування</option>
          <option value="sold_desc">↓ Найбільше продано</option>
          <option value="sold_asc">↑ Найменше продано</option>
          <option value="qty_asc">↓ Менше залишку</option>
          <option value="qty_desc">↑ Більше залишку</option>
          <option value="name_asc">А→Я назва</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-1">
        {[['bg-green-500','В наявності'],['bg-amber-400','Мало (≤3)'],['bg-red-400','Закінчилось']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${c}`} />
            <span className="font-sans text-[13px] font-medium text-brand-black/40">{l}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 px-5 py-2.5 border-b border-nude-100 bg-nude-50/50">
              <div className="w-12" />
              <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35">Товар</p>
              <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35 w-16 text-center">Продано</p>
              <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35 w-32 text-center">Залишок</p>
              <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35 w-20 text-center">Дії</p>
            </div>

            <div className="divide-y divide-nude-100">
              {filtered.length === 0 && (
                <p className="font-sans text-[15px] font-medium text-brand-black/40 py-8 text-center">Нічого не знайдено</p>
              )}
              {filtered.map(product => {
                const qty = stock[product.id]
                const st = stockStatus(qty)
                const sold = soldMap[product.id] || 0
                return (
                  <div key={product.id} className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-0 px-5 py-3 ${st.bg}`}>
                    <div className="w-12 h-[56px] bg-nude-100 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                      <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 pr-4">
                      <p className="font-sans text-[15px] font-medium text-brand-black leading-snug">{product.name}</p>
                      <p className="font-sans text-[13px] font-medium text-brand-black/35 mt-0.5">{CATEGORIES_UA[product.category] || product.category}</p>
                    </div>
                    <div className="w-16 text-center">
                      <span className="font-sans text-[15px] font-medium text-brand-black/50">{sold > 0 ? sold : '—'}</span>
                    </div>
                    <div className="w-32 flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateStock(product.id, (qty ?? 0) - 1)}
                        className="w-7 h-7 rounded-lg border border-nude-200 flex items-center justify-center font-sans text-[15px] font-medium text-brand-black/50 hover:border-brand-black/40 transition-colors flex-shrink-0"
                      >−</button>
                      <span className={`font-sans text-[16px] w-8 text-center font-semibold ${st.color}`}>{st.label}</span>
                      <button
                        onClick={() => updateStock(product.id, (qty ?? 0) + 1)}
                        className="w-7 h-7 rounded-lg border border-nude-200 flex items-center justify-center font-sans text-[15px] font-medium text-brand-black/50 hover:border-brand-black/40 transition-colors flex-shrink-0"
                      >+</button>
                    </div>
                    <div className="w-20 flex justify-center">
                      {qty !== 0 && (
                        <button
                          onClick={() => setOutOfStock(product.id)}
                          title="Позначити як закінчився"
                          className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-red-400 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >Стоп</button>
                      )}
                      {qty === 0 && (
                        <button
                          onClick={() => updateStock(product.id, 1)}
                          title="Відновити продаж"
                          className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                        >Старт</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Promos Tab ────────────────────────────────────────────────────────────────
function PromosTab() {
  const [promos, setPromos]   = useState([])
  const [form, setForm]       = useState({ code: '', discount_percent: '', min_order: '', uses_left: '', expires_at: '' })
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.getPromoCodes().then(setPromos).catch(console.error)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await api.createPromoCode({
        code:             form.code,
        discount_percent: Number(form.discount_percent),
        min_order:        form.min_order ? Number(form.min_order) : 0,
        uses_left:        form.uses_left ? Number(form.uses_left) : null,
        expires_at:       form.expires_at || null,
      })
      setPromos(prev => [created, ...prev])
      setForm({ code: '', discount_percent: '', min_order: '', uses_left: '', expires_at: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    await api.deletePromoCode(id)
    setPromos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white border border-nude-200 rounded-2xl p-6 space-y-4">
        <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40">Новий промокод</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Код</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              required placeholder="ЛІТО2026"
              className="w-full border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Знижка %</label>
            <input
              type="number" min="1" max="100"
              value={form.discount_percent}
              onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
              required placeholder="10"
              className="w-full border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Мін. сума (₴)</label>
            <input
              type="number" min="0"
              value={form.min_order}
              onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
              placeholder="0 = без мінімуму"
              className="w-full border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Кількість використань</label>
            <input
              type="number" min="1"
              value={form.uses_left}
              onChange={e => setForm(f => ({ ...f, uses_left: e.target.value }))}
              placeholder="Порожньо = безліміт"
              className="w-full border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
            />
          </div>
          <div className="col-span-2">
            <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Дійсний до</label>
            <input
              type="date"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full border border-nude-200 bg-white px-4 py-2.5 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
            />
          </div>
        </div>
        {error && <p className="font-sans text-[13px] text-red-500">{error}</p>}
        <button
          type="submit" disabled={saving}
          className="w-full font-sans text-[14px] font-semibold uppercase tracking-[0.2em] bg-brand-black text-white py-3.5 rounded-xl hover:bg-nude-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Створення...' : 'Створити промокод'}
        </button>
      </form>

      {/* List */}
      {promos.length > 0 && (
        <div className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[440px]">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-5 py-2.5 border-b border-nude-100 bg-nude-50/50">
                <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35">Код</p>
                <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35 w-20 text-center">Знижка</p>
                <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35 w-24 text-center">Ліміт</p>
                <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/35 w-28 text-center">До</p>
                <div className="w-10" />
              </div>
              <div className="divide-y divide-nude-100">
                {promos.map(p => {
                  const expired  = p.expires_at && new Date(p.expires_at) < new Date()
                  const depleted = p.uses_left !== null && p.uses_left <= 0
                  const inactive = expired || depleted
                  return (
                    <div key={p.id} className={`grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-0 px-5 py-3 ${inactive ? 'opacity-40' : ''}`}>
                      <div>
                        <p className="font-sans text-[15px] font-bold tracking-[0.1em] text-brand-black">{p.code}</p>
                        {Number(p.min_order) > 0 && (
                          <p className="font-sans text-[12px] text-brand-black/40">від {Number(p.min_order).toLocaleString('uk-UA')} ₴</p>
                        )}
                      </div>
                      <div className="w-20 text-center">
                        <span className="font-sans text-[15px] font-semibold text-green-700">−{p.discount_percent}%</span>
                      </div>
                      <div className="w-24 text-center">
                        <span className="font-sans text-[14px] font-medium text-brand-black/60">
                          {p.uses_left === null ? '∞' : p.uses_left}
                        </span>
                      </div>
                      <div className="w-28 text-center">
                        <span className="font-sans text-[13px] text-brand-black/50">
                          {p.expires_at ? new Date(p.expires_at).toLocaleDateString('uk-UA') : '—'}
                        </span>
                      </div>
                      <div className="w-10 flex justify-end">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="font-sans text-[13px] text-red-400 hover:text-red-600 transition-colors p-1"
                        >✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {promos.length === 0 && (
        <p className="font-sans text-[15px] font-medium text-brand-black/40 py-8 text-center">Промокодів поки немає</p>
      )}
    </div>
  )
}

// ── Newsletter Tab ────────────────────────────────────────────────────────────
function NewsletterTab() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.getNewsletterLogs().then(setLogs).catch(console.error)
  }, [])

  const send = async (e) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      const r = await api.sendNewsletter({ subject, body })
      setResult({ ok: true, message: `Надіслано ${r.sent} з ${r.total} підписникам` })
      setSubject('')
      setBody('')
      api.getNewsletterLogs().then(setLogs)
    } catch (err) {
      setResult({ ok: false, message: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={send} className="bg-white border border-nude-200 rounded-2xl p-6 space-y-4">
        <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-2">Нова розсилка</p>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Тема листа</label>
          <input
            value={subject} onChange={e => setSubject(e.target.value)} required
            className="w-full border border-nude-200 bg-white px-4 py-3 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors"
            placeholder="Наприклад: Нові надходження Joli Tone 🌿"
          />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-1.5">Текст листа</label>
          <textarea
            value={body} onChange={e => setBody(e.target.value)} required rows={8}
            className="w-full border border-nude-200 bg-white px-4 py-3 font-sans text-[15px] font-medium focus:outline-none focus:border-brand-black rounded-xl transition-colors resize-none leading-relaxed"
            placeholder="Привіт!&#10;&#10;Хочемо поділитись чудовими новинами..."
          />
        </div>
        {result && (
          <div className={`px-4 py-3 rounded-xl border ${result.ok ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-500'}`}>
            <p className="font-sans text-[14px] font-medium">{result.message}</p>
          </div>
        )}
        <button
          type="submit" disabled={sending}
          className="w-full font-sans text-[14px] font-semibold uppercase tracking-[0.2em] bg-brand-black text-white py-3.5 rounded-xl hover:bg-nude-700 transition-colors disabled:opacity-50"
        >
          {sending ? 'Надсилається...' : 'Надіслати розсилку'}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
          <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 px-6 py-4 border-b border-nude-100">Історія розсилок</p>
          <div className="divide-y divide-nude-100">
            {logs.map(l => (
              <div key={l.id} className="px-6 py-3 flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[15px] font-medium text-brand-black truncate">{l.subject}</p>
                  <p className="font-sans text-[13px] font-medium text-brand-black/40">{fmtDate(l.sent_at)} · {l.sent_to} одержувачів</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    api.getAdminStats().then(setStats).catch(console.error)
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  const TabContent = () => (
    <>
      {tab === 'dashboard'  && <DashboardTab stats={stats} />}
      {tab === 'orders'     && <OrdersTab />}
      {tab === 'stock'      && <StockTab />}
      {tab === 'promos'     && <PromosTab />}
      {tab === 'newsletter' && <NewsletterTab />}
    </>
  )

  return (
    <div className="min-h-screen bg-nude-50" style={{ fontWeight: 500 }}>

      {/* ── Mobile: top header + tab bar ── */}
      <div className="md:hidden bg-white border-b border-nude-200 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-nude-100">
          <div>
            <p className="font-sans text-[15px] font-bold tracking-wider text-brand-black">JOLI TONE</p>
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-black/40">Адмін панель</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="font-sans text-[12px] font-medium text-brand-black/40 hover:text-brand-black transition-colors py-2 px-1"
          >
            ← На сайт
          </button>
        </div>
        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-brand-black text-brand-black'
                  : 'border-transparent text-brand-black/40'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop: sidebar + content ── */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-nude-200 flex flex-col">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-6 border-b border-nude-100 w-full text-left hover:bg-nude-50 transition-colors"
          >
            <p className="font-sans text-[18px] font-bold tracking-wider text-brand-black">JOLI TONE</p>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-black/40 mt-0.5">Адмін панель</p>
          </button>
          <nav className="flex-1 py-4">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 font-sans text-[15px] transition-colors text-left ${
                  tab === t.id
                    ? 'bg-nude-50 text-brand-black font-bold'
                    : 'text-brand-black/50 font-medium hover:text-brand-black hover:bg-nude-50/60'
                }`}
              >
                <span className="text-[16px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="px-6 py-4 border-t border-nude-100">
            <button
              onClick={() => navigate('/')}
              className="font-sans text-[14px] font-medium text-brand-black/40 hover:text-brand-black transition-colors"
            >
              ← На сайт
            </button>
          </div>
        </div>
        {/* Desktop content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <h1 className="font-sans text-3xl font-bold text-brand-black mb-6">
              {TABS.find(t => t.id === tab)?.label}
            </h1>
            <TabContent />
          </div>
        </div>
      </div>

      {/* ── Mobile: content ── */}
      <div className="md:hidden px-4 py-5">
        <h1 className="font-sans text-xl font-bold text-brand-black mb-5">
          {TABS.find(t => t.id === tab)?.label}
        </h1>
        <TabContent />
      </div>
    </div>
  )
}
