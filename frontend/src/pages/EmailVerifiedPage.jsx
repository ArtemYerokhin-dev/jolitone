import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function EmailVerifiedPage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    refreshUser().catch(() => {})
  }, [])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">

      {/* Icon */}
      <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-10">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <p className="font-sans text-[12px] uppercase tracking-[0.3em] text-brand-black/35 mb-3">
        Joli Tone
      </p>
      <h1 className="font-sans text-4xl font-light text-brand-black mb-5">
        Email підтверджено
      </h1>
      <p className="font-sans text-[18px] text-brand-black/50 mb-12 max-w-sm leading-relaxed">
        Дякуємо! Ваша електронна адреса підтверджена.
      </p>

      <button
        onClick={() => navigate('/')}
        className="font-sans text-[13px] uppercase tracking-[0.2em] bg-brand-black text-white px-10 py-4 hover:bg-nude-700 transition-colors"
      >
        На головну
      </button>
    </div>
  )
}
