import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { imgUrl } from '../utils/img'

export default function CheckoutPage() {
  const { items, total, clearCart, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', phone: '', city: '', address: '', delivery: 'nova_poshta', comment: '',
  })
  const [orderId, setOrderId] = useState(null)

  // Promo
  const [promoInput, setPromoInput]     = useState('')
  const [promoData, setPromoData]       = useState(null)
  const [promoError, setPromoError]     = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const discountAmount = promoData?.discountAmount || 0
  const finalTotal     = total - discountAmount

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoData(null)
    try {
      const data = await api.checkPromo(promoInput.trim(), total)
      setPromoData(data)
    } catch (err) {
      setPromoError(err.message)
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromo = () => {
    setPromoData(null)
    setPromoInput('')
    setPromoError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await api.createOrder({
        name:      form.name,
        phone:     form.phone,
        email:     user?.email || null,
        city:      form.city + (form.address ? ', ' + form.address : ''),
        delivery:  form.delivery,
        comment:   form.comment,
        userId:    user?.id || null,
        promoCode: promoData?.code || null,
        items:     items.map(item => ({
          productId:   item.id,
          productName: item.name,
          color:       item.selectedColor || null,
          size:        item.size || null,
          price:       item.price,
          quantity:    item.qty,
        })),
      })
      clearCart()
      setOrderId(result.id)
    } catch (err) {
      console.error('Order error:', err)
    }
  }

  // ── Success screen ──
  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-8">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-sans text-[12px] uppercase tracking-[0.3em] text-brand-black/35 mb-3">Joli Tone</p>
        <h1 className="font-sans text-4xl font-light text-brand-black mb-4">Дякуємо за замовлення!</h1>
        <p className="font-sans text-[18px] text-brand-black/60 mb-2">
          Замовлення <span className="font-semibold text-brand-black">#{orderId}</span> прийнято.
        </p>
        <p className="font-sans text-[16px] text-brand-black/40 mb-12">
          Ми зв'яжемось найближчим часом для підтвердження.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Link
            to={`/track?id=${orderId}`}
            className="font-sans text-[13px] uppercase tracking-[0.2em] bg-brand-black text-white px-10 py-4 hover:bg-nude-700 transition-colors"
          >
            Відстежити замовлення
          </Link>
          <button
            onClick={() => navigate('/')}
            className="font-sans text-[13px] uppercase tracking-[0.2em] text-brand-black/35 hover:text-brand-black transition-colors"
          >
            На головну
          </button>
        </div>
      </div>
    )
  }

  const inputCls = 'w-full border border-nude-300 bg-white px-5 py-4 font-sans text-[16px] focus:outline-none focus:border-brand-black transition-colors'
  const labelCls = 'block font-sans text-[13px] uppercase tracking-[0.2em] text-brand-black/60 mb-2'

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-16 py-12 md:py-16">

      {/* Page header */}
      <div className="mb-8 md:mb-12">
        <p className="font-sans text-[12px] uppercase tracking-[0.3em] text-brand-black/35 mb-3">Joli Tone</p>
        <h1 className="font-sans text-3xl md:text-4xl font-light text-brand-black">Оформлення замовлення</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_400px] gap-8 md:gap-12 items-start">

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelCls}>Ім'я *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className={inputCls} placeholder="Ваше ім'я" />
          </div>
          <div>
            <label className={labelCls}>Телефон *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required type="tel"
              className={inputCls} placeholder="+380" />
          </div>
          <div>
            <label className={labelCls}>Місто *</label>
            <input name="city" value={form.city} onChange={handleChange} required
              className={inputCls} placeholder="Напр.: Київ" />
          </div>
          <div>
            <label className={labelCls}>Вулиця і будинок або відділення Нової Пошти *</label>
            <input name="address" value={form.address} onChange={handleChange} required
              className={inputCls} placeholder="Напр.: вул. Хрещатик 1 або НП №5" />
          </div>
          <div>
            <label className={labelCls}>Коментар</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Побажання до замовлення" />
          </div>

          {/* ── Promo code ── */}
          <div>
            <label className={labelCls}>Промокод</label>
            {promoData ? (
              <div className="flex items-center gap-3 px-4 py-4 bg-green-50 border border-green-200">
                <span className="font-sans text-[15px] text-green-700 flex-1">{promoData.message}</span>
                <button type="button" onClick={removePromo} className="text-green-500 hover:text-green-700 flex-shrink-0 p-1">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                  placeholder="Введіть промокод"
                  className="flex-1 min-w-0 border border-nude-300 bg-white px-4 py-4 font-sans text-[16px] focus:outline-none focus:border-brand-black transition-colors"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoLoading}
                  className="px-4 md:px-6 py-4 border border-nude-300 font-sans text-[12px] md:text-[13px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-brand-black hover:border-brand-black transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {promoLoading ? '...' : 'Застосувати'}
                </button>
              </div>
            )}
            {promoError && (
              <p className="font-sans text-[14px] text-red-500 mt-2">{promoError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-black text-white py-5 font-sans text-[13px] uppercase tracking-[0.2em] hover:bg-nude-700 transition-colors"
          >
            Підтвердити замовлення
          </button>
        </form>

        {/* ── Order summary ── */}
        <div className="sticky top-24 border border-nude-200 rounded-2xl overflow-hidden">
          <p className="font-sans text-[12px] uppercase tracking-[0.25em] text-brand-black/40 px-6 pt-6 pb-5 border-b border-nude-200">
            Ваше замовлення
          </p>

          <div className="overflow-y-auto max-h-[380px] flex flex-col divide-y divide-nude-100">
            {items.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 items-start px-6 py-5">
                <div className="w-16 h-20 flex-shrink-0 bg-nude-100 overflow-hidden rounded-lg">
                  {item.images?.[0]
                    ? <img src={imgUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-nude-100" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[15px] font-medium text-brand-black leading-snug">{item.name}</p>
                  <p className="font-sans text-[13px] text-brand-black/45 mt-1">Розмір: {item.size} × {item.qty}</p>
                  <p className="font-sans text-[15px] font-medium text-brand-black mt-2">
                    {(item.price * item.qty).toLocaleString('uk-UA')} ₴
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id, item.size)}
                  className="text-brand-black/25 hover:text-brand-black transition-colors flex-shrink-0 mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-5 border-t border-nude-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-sans text-[13px] uppercase tracking-[0.15em] text-brand-black/45">Підсумок</span>
              <span className="font-sans text-[16px] text-brand-black">{total.toLocaleString('uk-UA')} ₴</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-sans text-[13px] uppercase tracking-[0.15em] text-green-600">
                  Знижка ({promoData.discountPercent}%)
                </span>
                <span className="font-sans text-[16px] text-green-600">−{discountAmount.toLocaleString('uk-UA')} ₴</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-nude-100">
              <span className="font-sans text-[13px] uppercase tracking-[0.15em] text-brand-black">Разом</span>
              <span className="font-sans text-[22px] font-semibold text-brand-black">{finalTotal.toLocaleString('uk-UA')} ₴</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
