import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { PRODUCTS } from '../data/products'

const STATUS_META = {
  new:       { text: 'Прийнято',      color: 'bg-nude-100 text-brand-black/60'  },
  confirmed: { text: 'Підтверджено',  color: 'bg-blue-50 text-blue-600'         },
  sent:      { text: 'Відправлено',   color: 'bg-amber-50 text-amber-600'       },
  done:      { text: 'Доставлено',    color: 'bg-green-50 text-green-600'       },
  cancelled: { text: 'Скасовано',     color: 'bg-red-50 text-red-500'           },
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtMoney(n) { return Number(n).toLocaleString('uk-UA') + ' ₴' }

export default function MyOrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    api.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-sans text-[16px] text-brand-black/35">Завантаження...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">

      {/* Page header */}
      <div className="mb-12">
        <p className="font-sans text-[12px] uppercase tracking-[0.3em] text-brand-black/35 mb-3">{user?.name}</p>
        <h1 className="font-sans text-4xl font-light text-brand-black">Мої замовлення</h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-nude-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-black/30">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="font-sans text-[18px] text-brand-black/45">У вас поки немає замовлень</p>
          <Link
            to="/"
            className="font-sans text-[13px] uppercase tracking-[0.2em] text-brand-black/50 hover:text-brand-black border-b border-nude-300 hover:border-brand-black pb-0.5 transition-colors"
          >
            Перейти до каталогу
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {orders.map((order) => {
            const status = STATUS_META[order.status] || STATUS_META.new
            const displayId = order.order_number || order.id
            return (
              <div key={order.id} className="border border-nude-200 rounded-2xl overflow-hidden">

                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-nude-100 bg-nude-50/50">
                  <div className="flex flex-wrap items-center gap-5">
                    <p className="font-sans text-[17px] font-medium text-brand-black">#{displayId}</p>
                    <p className="font-sans text-[14px] text-brand-black/40">{fmtDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-sans text-[12px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    <p className="font-sans text-[17px] font-medium text-brand-black">
                      {fmtMoney(order.total)}
                    </p>
                  </div>
                </div>

                {/* Order items */}
                <div className="divide-y divide-nude-100">
                  {order.items?.map((item) => {
                    const product = PRODUCTS.find(p => p.id === item.product_id)
                    const image = product?.images?.[0]
                    return (
                      <div key={item.id} className="flex items-center gap-5 px-6 py-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-20 flex-shrink-0 bg-nude-100 overflow-hidden rounded-xl">
                          {image
                            ? <img src={image} alt={item.product_name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-nude-100" />
                          }
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[16px] font-medium text-brand-black leading-snug truncate">
                            {item.product_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-0.5">
                            {item.size && (
                              <span className="font-sans text-[14px] text-brand-black/45">Розмір: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="font-sans text-[14px] text-brand-black/45">{item.color}</span>
                            )}
                            <span className="font-sans text-[14px] text-brand-black/45">× {item.quantity}</span>
                          </div>
                        </div>
                        {/* Price */}
                        <p className="font-sans text-[15px] font-medium text-brand-black flex-shrink-0">
                          {fmtMoney(item.price * item.quantity)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Footer: delivery + track link */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-nude-100 bg-nude-50/30">
                  {order.city ? (
                    <p className="font-sans text-[14px] text-brand-black/40">
                      Доставка: {order.city}
                    </p>
                  ) : <span />}
                  <Link
                    to={`/track?id=${displayId}`}
                    className="font-sans text-[13px] uppercase tracking-[0.18em] text-brand-black/40 hover:text-brand-black transition-colors border-b border-nude-200 hover:border-brand-black pb-0.5"
                  >
                    Відстежити
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link
        to="/"
        className="block text-center font-sans text-[13px] uppercase tracking-[0.2em] text-brand-black/35 hover:text-brand-black transition-colors mt-12"
      >
        ← На головну
      </Link>
    </div>
  )
}
