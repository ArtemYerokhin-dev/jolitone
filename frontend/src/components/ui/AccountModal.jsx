import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

const HEADER_IMG = '/images/auth-header.jpg'

export default function AccountModal({ onClose }) {
  const { user, login, register, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setError('')
    setEmail('')
    setPassword('')
    setName('')
  }, [tab])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email.trim(), name.trim(), password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  const [resendSent, setResendSent] = useState(false)
  const handleResend = async () => {
    try {
      await api.resendVerification()
      setResendSent(true)
    } catch { /* ignore */ }
  }

  // shared input style
  const inputWrap = 'flex items-center border border-brand-black/25 rounded-xl px-4 py-3.5 focus-within:border-brand-black/60 transition-colors bg-white'
  const inputCls  = 'w-full font-sans text-[13px] bg-transparent outline-none placeholder:text-brand-black/50 text-brand-black'

  return (
    <div className="w-full">

      {/* ── Image header — shorter, wider feel ── */}
      <div className="relative w-full overflow-hidden rounded-t-2xl bg-nude-200" style={{ height: 170 }}>
        <img
          src={HEADER_IMG}
          alt=""
          className="absolute top-1/2 left-1/2"
          style={{
            height: '260%',
            width: 'auto',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
            objectFit: 'cover',
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label="Закрити"
        >
          <X size={13} className="text-brand-black" />
        </button>

        {/* Brand label */}
        <p className="absolute bottom-4 left-6 font-sans text-[15px] font-semibold uppercase tracking-[0.35em] text-white/90">
          Joli Tone
        </p>
      </div>

      {/* ── Content ── */}
      {user ? (
        <div className="px-8 py-7">
          <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black/40 mb-1.5 font-medium">Вітаємо</p>
          <div className="flex items-center gap-2.5 mb-0.5">
            <p className="font-sans text-[24px] font-normal text-brand-black">{user.name}</p>
            {user.role === 'admin' && (
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] border-2 border-red-400 text-red-500 px-2 py-0.5 rounded-md leading-none">
                Admin
              </span>
            )}
          </div>
          <p className="font-sans text-[13px] text-brand-black/40 mb-5 font-medium">{user.email}</p>

          {/* Email not verified banner */}
          {user.emailVerified === false && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 flex flex-col gap-1.5">
              <p className="font-sans text-[12px] text-amber-700 leading-snug">
                Підтвердьте email — лист надіслано на вашу адресу.
              </p>
              {resendSent ? (
                <p className="font-sans text-[12px] text-amber-600">Лист надіслано повторно ✓</p>
              ) : (
                <button onClick={handleResend} className="font-sans text-[12px] text-amber-700 underline text-left">
                  Надіслати повторно
                </button>
              )}
            </div>
          )}

          {/* Admin panel button */}
          {user.role === 'admin' && (
            <button
              onClick={() => { onClose(); navigate('/admin') }}
              className="flex items-center justify-between w-full px-4 py-3.5 mb-3 rounded-xl border border-red-200 hover:border-red-400 transition-colors group bg-red-50/40"
            >
              <span className="font-sans text-[13px] font-semibold text-red-500 uppercase tracking-[0.18em]">Адмін панель</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* My orders link */}
          <Link
            to="/my-orders"
            onClick={onClose}
            className="flex items-center justify-between w-full px-4 py-3.5 mb-3 rounded-xl border border-nude-200 hover:border-brand-black/30 transition-colors group"
          >
            <span className="font-sans text-[13px] font-semibold text-brand-black/70 uppercase tracking-[0.18em]">Мої замовлення</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-black/30 group-hover:text-brand-black/60 transition-colors">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          {/* Track order link */}
          <Link
            to="/track"
            onClick={onClose}
            className="flex items-center justify-between w-full px-4 py-3.5 mb-3 rounded-xl border border-nude-200 hover:border-brand-black/30 transition-colors group"
          >
            <span className="font-sans text-[13px] font-semibold text-brand-black/70 uppercase tracking-[0.18em]">Відстежити замовлення</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-black/30 group-hover:text-brand-black/60 transition-colors">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full font-sans text-[13px] font-semibold uppercase tracking-[0.2em] border border-brand-black/20 text-brand-black/70 py-3.5 rounded-xl hover:bg-nude-50 hover:border-brand-black/40 transition-colors duration-200"
          >
            Вийти
          </button>
        </div>
      ) : (
        <div className="px-8 py-7">

          {/* Tabs */}
          <div className="flex gap-7 mb-6">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-sans text-[13px] font-semibold uppercase tracking-[0.18em] pb-1 border-b-[1.5px] transition-colors ${
                  tab === t
                    ? 'border-brand-black text-brand-black'
                    : 'border-transparent text-brand-black/30 hover:text-brand-black/55'
                }`}
              >
                {t === 'login' ? 'Вхід' : 'Реєстрація'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-3">
            {tab === 'register' && (
              <div className={inputWrap}>
                <input
                  type="text"
                  placeholder="Ім'я"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  className={inputCls}
                />
              </div>
            )}

            <div className={inputWrap}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus={tab === 'login'}
                className={inputCls}
              />
            </div>

            <div className={inputWrap}>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <p className="font-sans text-[12px] text-red-500 leading-snug">{error}</p>
              </div>
            )}

            {tab === 'register' && (
              <label className="flex items-start gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-[2px] w-3 h-3 accent-[#2C1A0E] flex-shrink-0"
                />
                <span className="font-sans text-[10.5px] text-brand-black/35 leading-snug">
                  Я погоджуюся отримувати акції та спеціальні пропозиції на email
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full font-sans text-[12px] font-semibold uppercase tracking-[0.2em] bg-[#2C1A0E] text-white/90 py-4 rounded-xl hover:bg-[#3D2B1F] transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? '...' : tab === 'login' ? 'Увійти' : 'Зареєструватись'}
            </button>
          </form>

          <p className="mt-4 font-sans text-[11px] text-center text-brand-black/30 leading-relaxed">
            {tab === 'login'
              ? 'Немає акаунту? Натисніть «Реєстрація»'
              : 'Вже є акаунт? Натисніть «Вхід»'}
          </p>
        </div>
      )}
    </div>
  )
}
