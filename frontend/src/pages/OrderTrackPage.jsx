import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api/client'

const STATUS_META = {
  new:       { label: 'Прийнято',     color: 'bg-nude-100 text-brand-black'  },
  confirmed: { label: 'Підтверджено', color: 'bg-blue-50 text-blue-700'      },
  sent:      { label: 'Відправлено',  color: 'bg-amber-50 text-amber-700'    },
  done:      { label: 'Доставлено',   color: 'bg-green-50 text-green-700'    },
  cancelled: { label: 'Скасовано',    color: 'bg-red-50 text-red-600'        },
}

const STEPS = [
  { key: 'new',       label: 'Прийнято'     },
  { key: 'confirmed', label: 'Підтверджено' },
  { key: 'sent',      label: 'Відправлено'  },
  { key: 'done',      label: 'Доставлено'   },
]

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtMoney(n) { return Number(n).toLocaleString('uk-UA') + ' ₴' }

export default function OrderTrackPage() {
  const [searchParams] = useSearchParams()
  const [inputId, setInputId] = useState(searchParams.get('id') || '')
  const [order,   setOrder]   = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) doTrack(id)
  }, [])

  async function doTrack(id = inputId) {
    if (!String(id).trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const data = await api.trackOrder(String(id).trim())
      setOrder(data)
    } catch (err) {
      setError('Замовлення не знайдено. Перевірте номер.')
    } finally {
      setLoading(false)
    }
  }

  const statusMeta  = order ? (STATUS_META[order.status] || STATUS_META.new) : null
  const currentStep = STEPS.findIndex(s => s.key === order?.status)

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-8 py-16">

      {/* Page header */}
      <div className="mb-12">
        <p className="font-sans text-[12px] uppercase tracking-[0.3em] text-brand-black/35 mb-3">Joli Tone</p>
        <h1 className="font-sans text-4xl font-light text-brand-black mb-3">Відстежити замовлення</h1>
        <p className="font-sans text-[16px] text-brand-black/50">Введіть номер замовлення — він у листі або на сторінці після оплати</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-10">
        <input
          type="number"
          value={inputId}
          onChange={e => setInputId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doTrack()}
          placeholder="Номер замовлення"
          className="flex-1 border border-nude-300 bg-white px-5 py-4 font-sans text-[16px] focus:outline-none focus:border-brand-black transition-colors"
        />
        <button
          onClick={() => doTrack()}
          disabled={loading}
          className="px-8 py-4 bg-brand-black text-white font-sans text-[13px] uppercase tracking-[0.2em] hover:bg-nude-700 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {loading ? '...' : 'Знайти'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-nude-300 px-6 py-5 mb-8 bg-nude-50">
          <p className="font-sans text-[16px] text-brand-black/60">{error}</p>
        </div>
      )}

      {/* Result */}
      {order && (
        <div className="space-y-4">

          {/* Status */}
          <div className={`px-6 py-5 rounded-2xl ${statusMeta.color}`}>
            <p className="font-sans text-[12px] uppercase tracking-[0.2em] opacity-50 mb-1">Статус</p>
            <p className="font-sans text-[22px] font-semibold">{statusMeta.label}</p>
          </div>

          {/* Progress (not cancelled) */}
          {order.status !== 'cancelled' && (
            <div className="bg-white border border-nude-200 rounded-2xl px-6 py-6">
              <div className="flex items-center">
                {STEPS.map((step, i) => (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-sans text-[13px] font-bold flex-shrink-0 ${
                        i <= currentStep ? 'bg-brand-black text-white' : 'bg-nude-100 text-brand-black/30'
                      }`}>
                        {i <= currentStep ? '✓' : i + 1}
                      </div>
                      <p className={`font-sans text-[12px] font-medium uppercase tracking-[0.08em] mt-2 text-center whitespace-nowrap ${
                        i <= currentStep ? 'text-brand-black' : 'text-brand-black/30'
                      }`}>{step.label}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-[1.5px] mx-2 mb-5 ${i < currentStep ? 'bg-brand-black' : 'bg-nude-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order details */}
          <div className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 space-y-3 border-b border-nude-100">
              {[
                ['Замовлення', `#${order.id}`],
                ['Дата',       fmtDate(order.created_at)],
                ['Отримувач',  order.name],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center gap-4">
                  <span className="font-sans text-[14px] text-brand-black/45 uppercase tracking-[0.12em]">{k}</span>
                  <span className="font-sans text-[16px] font-medium text-brand-black">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 space-y-2">
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[14px] text-green-600 uppercase tracking-[0.12em]">
                    Знижка {order.promo_code ? `(${order.promo_code})` : ''}
                  </span>
                  <span className="font-sans text-[16px] font-medium text-green-600">−{fmtMoney(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-sans text-[14px] text-brand-black/45 uppercase tracking-[0.12em]">Разом</span>
                <span className="font-sans text-[22px] font-semibold text-brand-black">{fmtMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-nude-200 rounded-2xl overflow-hidden">
            <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black/40 px-6 py-4 border-b border-nude-100">
              Товари
            </p>
            <div className="divide-y divide-nude-100">
              {order.items.map((item, i) => (
                <div key={i} className="px-6 py-4 flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[16px] font-medium text-brand-black truncate">{item.product_name}</p>
                    <p className="font-sans text-[14px] text-brand-black/45 mt-0.5">
                      {item.size ? `${item.size} · ` : ''}{item.quantity} шт
                    </p>
                  </div>
                  <span className="font-sans text-[16px] font-medium text-brand-black flex-shrink-0">
                    {fmtMoney(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/"
            className="block text-center font-sans text-[13px] uppercase tracking-[0.2em] text-brand-black/35 hover:text-brand-black transition-colors pt-4"
          >
            ← На головну
          </Link>
        </div>
      )}
    </div>
  )
}
