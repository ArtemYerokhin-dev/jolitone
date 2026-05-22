import { Link } from 'react-router-dom'

function InstagramIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-nude-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <span className="font-sans text-2xl tracking-wider text-brand-black">JOLI TONE</span>
          <p className="font-sans text-[15px] text-brand-black leading-relaxed">
            Авторський відбір моделей.<br />Тільки живі примірки.<br />Одяг для королев.
          </p>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-2.5 items-start">
          <p className="font-sans text-[13px] uppercase tracking-widest text-brand-black mb-1">Розділи</p>
          <Link to="/" className="font-sans text-[15px] text-brand-black hover:text-brand-black transition-colors">Головна</Link>
          <Link to="/novynky" className="font-sans text-[15px] text-brand-black hover:text-brand-black transition-colors">Новинки</Link>
          <Link to="/reviews" className="font-sans text-[15px] text-brand-black hover:text-brand-black transition-colors">Відгуки</Link>
          <Link to="/category/tkanyny" className="font-sans text-[15px] text-brand-black hover:text-brand-black transition-colors">Тканини</Link>
        </div>

        {/* Contacts */}
        <div className="flex flex-col gap-2.5 items-start">
          <p className="font-sans text-[13px] uppercase tracking-widest text-brand-black mb-1">Контакти</p>
          <a
            href="https://www.instagram.com/joli_tone_ua"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-sans text-[15px] text-brand-black hover:text-brand-black transition-colors"
          >
            <InstagramIcon size={15} />
            @joli_tone_ua
          </a>
          <p className="font-sans text-[15px] text-brand-black">Київ, 04210</p>
          <p className="font-sans text-[15px] text-brand-black">
            -5% знижки за відгук та відмітку в Instagram
          </p>
        </div>
      </div>

      <div className="border-t border-nude-200 text-center py-5">
        <p className="font-sans text-[13px] text-brand-black/40">
          © {new Date().getFullYear()} Joli Tone. Всі права захищені.
        </p>
      </div>
    </footer>
  )
}
