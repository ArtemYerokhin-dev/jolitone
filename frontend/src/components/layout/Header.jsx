import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, Heart, User } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { CATEGORIES } from '../../data/categories'
import { PRODUCTS } from '../../data/products'
import CartDrawer from '../ui/CartDrawer'
import AccountModal from '../ui/AccountModal'

// Only show categories that actually have products
const slugsWithProducts = new Set(PRODUCTS.map(p => p.category))
const VISIBLE_CATS = CATEGORIES.filter(c => !c.hidden && slugsWithProducts.has(c.slug))

const col1 = VISIBLE_CATS.slice(0, 4)
const col2 = VISIBLE_CATS.slice(4, 8)
const col3 = VISIBLE_CATS.slice(8)

export default function Header() {
  const { count } = useCart()
  const { count: favCount } = useFavorites()
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()

  const isHome = location.pathname === '/'
  const isProductPage = location.pathname.startsWith('/product/')

  const transparent = isHome && !scrolled && !hovered && !dropdownOpen
  const logoVisible = !isHome || !scrolled
  const bgWhite = !isHome || scrolled || hovered || dropdownOpen

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 30)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
    setAccountOpen(false)
  }, [location])

  // Close account modal on Escape key
  useEffect(() => {
    if (!accountOpen) return
    const handler = (e) => { if (e.key === 'Escape') setAccountOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [accountOpen])

  // Open account modal when favorites require auth
  useEffect(() => {
    const handler = () => setAccountOpen(true)
    window.addEventListener('jolitone:requireAuth', handler)
    return () => window.removeEventListener('jolitone:requireAuth', handler)
  }, [])

  const navLinkClass = (active) =>
    `font-sans text-[14px] uppercase tracking-[0.25em] border-b-[1.5px] pb-0.5 transition-all duration-200 ${
      active
        ? 'border-current text-brand-black'
        : transparent
        ? 'border-transparent text-white/80 hover:text-white hover:border-white'
        : 'border-transparent text-brand-black hover:border-current'
    }`

  const iconCls = `relative transition-colors ${
    transparent ? 'text-white/80 hover:text-white' : 'text-brand-black hover:opacity-60'
  }`

  // Shared counter badge
  const Badge = ({ n, dark }) => n > 0 ? (
    <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-sans flex items-center justify-center ${
      dark ? 'bg-brand-black/80 text-white' : 'bg-nude-500 text-white'
    }`}>
      {n}
    </span>
  ) : null

  // Desktop icon group (reused in logo row and collapsed nav row)
  const DesktopIcons = ({ size }) => (
    <div className="flex items-center gap-4">
      <button
        data-account
        onClick={() => setAccountOpen(v => !v)}
        className={iconCls}
        aria-label="Акаунт"
      >
        <User size={size} strokeWidth={2} />
      </button>

      <Link to="/favorites" className={iconCls} aria-label="Обрані">
        <Heart size={size} strokeWidth={2} className={favCount > 0 ? 'fill-current' : ''} />
        <Badge n={favCount} />
      </Link>

      <button
        onClick={() => setCartOpen(true)}
        className={iconCls}
        aria-label="Кошик"
      >
        <ShoppingBag size={size} strokeWidth={2} />
        <Badge n={count} />
      </button>
    </div>
  )

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${bgWhite ? 'bg-white shadow-sm' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setDropdownOpen(false) }}
      >

        {/* ── Logo row — desktop only ── */}
        <div className={`hidden md:block transition-all duration-500 overflow-hidden ${logoVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="relative flex items-center justify-center px-16 h-[58px]">
            <Link
              to="/"
              className={`font-sans font-normal text-[22px] tracking-[0.3em] uppercase transition-colors duration-300 ${transparent ? 'text-white' : 'text-brand-black'}`}
            >
              Joli Tone
            </Link>
            <div className="absolute right-16">
              <DesktopIcons size={24} />
            </div>
          </div>
        </div>

        {/* ── Nav row ── */}
        <div className={`relative transition-all duration-500 border-b ${transparent ? 'border-white/15' : 'border-nude-200'}`}>
          <div className="relative flex items-center justify-center px-10 md:px-20 h-11">

            {/* Mobile: hamburger */}
            <button
              className={`md:hidden absolute left-3 p-2.5 transition-colors ${transparent ? 'text-white/80 hover:text-white' : 'text-brand-black'}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Меню"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile: logo */}
            <Link to="/" className="md:hidden absolute left-1/2 -translate-x-1/2">
              <span className={`font-sans font-normal text-[13px] tracking-[0.25em] uppercase transition-colors duration-500 ${transparent ? 'text-white' : 'text-brand-black'}`}>
                Joli Tone
              </span>
            </Link>

            {/* Mobile: heart + cart on the right */}
            <div className="md:hidden absolute right-3 flex items-center">
              <Link
                to="/favorites"
                className={`relative p-2.5 transition-colors ${transparent ? 'text-white/80 hover:text-white' : 'text-brand-black'}`}
                aria-label="Обрані"
              >
                <Heart size={20} strokeWidth={2} className={favCount > 0 ? 'fill-current' : ''} />
                {favCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-nude-500 text-white rounded-full text-[10px] font-sans flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className={`relative p-2.5 transition-colors ${transparent ? 'text-white/80 hover:text-white' : 'text-brand-black'}`}
                aria-label="Кошик"
              >
                <ShoppingBag size={20} strokeWidth={2} />
                {count > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-nude-500 text-white rounded-full text-[10px] font-sans flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop: logo left when top row collapsed */}
            {!logoVisible && (
              <Link to="/" className="hidden md:block absolute left-16 font-sans font-normal text-sm tracking-[0.25em] uppercase text-brand-black">
                Joli Tone
              </Link>
            )}

            {/* Desktop: nav links */}
            <nav className="hidden md:flex items-center gap-14">
              <Link
                to="/novynky"
                onMouseEnter={() => setDropdownOpen(false)}
                className={navLinkClass(location.pathname === '/novynky')}
              >
                Новинки
              </Link>

              <span
                onMouseEnter={() => !isProductPage && setDropdownOpen(true)}
                className={`cursor-default ${navLinkClass(location.pathname.startsWith('/category/') || dropdownOpen)}`}
              >
                Одяг
              </span>
            </nav>

            {/* Desktop: icon group when top row collapsed */}
            {!logoVisible && (
              <div className="hidden md:flex absolute right-16">
                <DesktopIcons size={22} />
              </div>
            )}
          </div>
        </div>

        {/* ── Account modal — fixed centered overlay (rendered inside header for z-index stacking) ── */}

        {/* ── Category dropdown (desktop only, not on product pages) ── */}
        {dropdownOpen && !isProductPage && (
          <div
            className="hidden md:block bg-white border-t border-nude-100"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div className="max-w-5xl mx-auto px-16 pt-6 pb-8">
              {/* Collections row */}
              <div className="flex gap-10 pb-5 mb-6 border-b border-nude-100">
                <Link
                  to="/novynky"
                  className="font-sans text-[13px] uppercase tracking-[0.22em] text-brand-black hover:text-brand-black/50 transition-colors"
                >
                  Новинки
                </Link>
                <Link
                  to="/bestsellery"
                  className="font-sans text-[13px] uppercase tracking-[0.22em] text-brand-black hover:text-brand-black/50 transition-colors"
                >
                  Бестселери
                </Link>
              </div>
              {/* Clothing categories */}
              <div className="grid grid-cols-3 gap-x-16">
                <div className="flex flex-col gap-4">
                  {col1.map(cat => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`}
                      className="font-sans text-[13px] uppercase tracking-[0.22em] text-brand-black/60 hover:text-brand-black transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {col2.map(cat => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`}
                      className="font-sans text-[13px] uppercase tracking-[0.22em] text-brand-black/60 hover:text-brand-black transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {col3.map(cat => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`}
                      className="font-sans text-[13px] uppercase tracking-[0.22em] text-brand-black/60 hover:text-brand-black transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t border-nude-200 px-5 py-2 flex flex-col gap-0 max-h-[70vh] overflow-y-auto">
            <Link to="/novynky" className="py-3.5 font-sans text-xs uppercase tracking-widest text-brand-black border-b border-nude-100">
              Новинки
            </Link>
            <Link to="/bestsellery" className="py-3.5 font-sans text-xs uppercase tracking-widest text-brand-black border-b border-nude-100">
              Бестселери
            </Link>
            <p className="pt-4 pb-1.5 font-sans text-[11px] uppercase tracking-[0.3em] text-brand-black opacity-40">Одяг</p>
            {VISIBLE_CATS.map(cat => (
              <NavLink
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={({ isActive }) =>
                  `py-3.5 font-sans text-xs uppercase tracking-widest transition-colors border-b border-nude-50 ${
                    isActive ? 'text-brand-black' : 'text-brand-black/50'
                  }`
                }
              >
                {cat.label}
              </NavLink>
            ))}
            <div className="border-t border-nude-100 mt-1 pt-1 pb-2">
              <Link
                to="/favorites"
                className="flex items-center gap-2.5 py-3.5 font-sans text-xs uppercase tracking-widest text-brand-black/50"
              >
                <Heart size={14} />
                Обрані{favCount > 0 ? ` (${favCount})` : ''}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); setAccountOpen(true) }}
                className="flex items-center gap-2.5 py-3.5 font-sans text-xs uppercase tracking-widest text-brand-black/50 w-full text-left"
              >
                <User size={14} />
                Акаунт
              </button>
            </div>
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── Account modal — fixed centered overlay ── */}
      {accountOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[3px] z-40"
            onClick={() => setAccountOpen(false)}
          />
          {/* Modal panel */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <AccountModal onClose={() => setAccountOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
