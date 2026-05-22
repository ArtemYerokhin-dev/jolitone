import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Minus, X, Heart } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ui/ProductCard'
import SizeGuideModal from '../components/ui/SizeGuideModal'
import { api } from '../api/client'
import { imgUrl } from '../utils/img'

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-nude-200">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 font-sans text-[14px] text-brand-black text-left transition-opacity hover:opacity-60"
      >
        <span className="uppercase tracking-[0.15em] font-medium">{title}</span>
        {open ? <Minus size={15} strokeWidth={1.5} /> : <Plus size={15} strokeWidth={1.5} />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="font-sans text-[14px] font-[450] text-brand-black leading-relaxed whitespace-pre-line">
          {children}
        </p>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const product = PRODUCTS.find((p) => p.id === id)
  const { addItem } = useCart()
  const { toggle, has } = useFavorites()
  const isFav = has(id)
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null)
  const [sizeGuide, setSizeGuide]         = useState(false)
  const [stockQty, setStockQty]           = useState(null)   // null = не завантажено
  const [notifyEmail, setNotifyEmail]     = useState('')
  const [notifySent, setNotifySent]       = useState(false)
  const [notifyLoading, setNotifyLoading] = useState(false)

  // Reset to first image whenever we navigate to a different product
  useEffect(() => {
    setImgIndex(0)
    setZoomed(false)
    setLightbox(false)
    setSelectedSize('')
    setAdded(false)
    setSelectedColor(product?.colors?.[0] || null)
    setStockQty(null)
    setNotifySent(false)
    setNotifyEmail('')
  }, [id])

  // Завантажити залишок
  useEffect(() => {
    if (!id) return
    api.getProductStock(id)
      .then(data => setStockQty(data.quantity))
      .catch(() => setStockQty(null))
  }, [id])

  const isOutOfStock = stockQty === 0

  const handleNotify = async (e) => {
    e.preventDefault()
    if (!notifyEmail) return
    setNotifyLoading(true)
    try {
      await api.notifyStock(notifyEmail, id)
      setNotifySent(true)
    } catch { /* ignore */ }
    finally { setNotifyLoading(false) }
  }

  const related = useMemo(() => {
    return PRODUCTS
      .filter(p => p.id !== id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
  }, [id])

  const carouselRef = useRef(null)
  const carouselRaf = useRef(null)
  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    if (carouselRaf.current) cancelAnimationFrame(carouselRaf.current)
    const from = el.scrollLeft
    const to = from + dir * el.offsetWidth * 0.5
    const duration = 650
    const t0 = performance.now()
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      el.scrollLeft = from + (to - from) * ease(p)
      if (p < 1) carouselRaf.current = requestAnimationFrame(tick)
      else carouselRaf.current = null
    }
    carouselRaf.current = requestAnimationFrame(tick)
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="font-sans text-2xl text-brand-black">Товар не знайдено</p>
        <Link to="/" className="mt-4 inline-block font-sans text-[15px] uppercase tracking-widest underline">
          На головну
        </Link>
      </div>
    )
  }

  const category = CATEGORIES.find((c) => c.slug === product.category)
  const baseImages = product.images || []
  // Replace first image with selected colour's flatlay (no hook — data is static)
  const images = selectedColor && product.colors
    ? [selectedColor.image, ...baseImages.slice(1)]
    : baseImages
  const total = images.length

  const prev = () => { setImgIndex(i => (i - 1 + total) % total); setZoomed(false) }
  const next = () => { setImgIndex(i => (i + 1) % total); setZoomed(false) }

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, total])

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem({ ...product, size: selectedSize })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* ── Main product section ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-16 pt-14 md:pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* ── Image gallery ── */}
          <div className="relative select-none md:-mt-10">
            <div className="flex gap-2.5">

              {/* Main image */}
              <div
                className="relative flex-1 aspect-[3/4] bg-nude-100 overflow-hidden cursor-zoom-in"
                onClick={() => { setLightbox(true); setZoomed(false) }}
              >
                {images[imgIndex] ? (
                  <img
                    key={imgIndex}
                    src={imgUrl(images[imgIndex])}
                    alt={product.name}
                    className="w-full h-full object-cover product-img-fade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-sans text-[14px] text-nude-300 uppercase tracking-widest">фото</span>
                  </div>
                )}

                {/* Mobile: arrows */}
                {total > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prev() }}
                      className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 text-brand-black/60 hover:text-brand-black transition-colors"
                      aria-label="Попереднє">
                      <ChevronLeft size={38} strokeWidth={1.2} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); next() }}
                      className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 text-brand-black/60 hover:text-brand-black transition-colors"
                      aria-label="Наступне">
                      <ChevronRight size={38} strokeWidth={1.2} />
                    </button>
                    {/* Mobile: dots */}
                    <div className="md:hidden absolute bottom-3 right-3 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setImgIndex(i) }}
                          className={`w-[6px] h-[6px] rounded-full transition-all duration-200 ${i === imgIndex ? 'bg-[#C4A882]' : 'bg-nude-300'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Desktop: vertical thumbnails column */}
              {total > 1 && (
                <div className="hidden md:flex flex-col gap-2 w-[78px] flex-shrink-0">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => { setImgIndex(i); setZoomed(false) }}
                      className={`aspect-[3/4] overflow-hidden bg-nude-100 transition-all duration-200 ${
                        i === imgIndex
                          ? 'ring-[1px] ring-brand-black ring-offset-1'
                          : 'hover:opacity-75'
                      }`}
                    >
                      <img src={imgUrl(src)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 font-sans text-[12px] text-brand-black mb-4 self-start">
              <Link to="/" className="hover:opacity-60 transition-opacity">Головна</Link>
              {category && (
                <>
                  <span className="opacity-30">/</span>
                  <Link to={`/category/${category.slug}`} className="hover:opacity-60 transition-opacity">
                    {category.label}
                  </Link>
                </>
              )}
              <span className="opacity-30">/</span>
              <span className="opacity-50 truncate max-w-[160px]">{product.name}</span>
            </nav>

            {/* Name + Price row */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h1 className="font-sans text-[1.5rem] md:text-[1.7rem] font-light leading-tight tracking-[0.03em]">{product.name}</h1>
              <p className="font-sans text-xl whitespace-nowrap">{product.price.toLocaleString('uk-UA')} ₴</p>
            </div>

            {/* Colour selector */}
            {product.colors && product.colors.length > 1 && (
              <div className="mt-7">
                <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black mb-3">
                  Колір —{' '}
                  <span className="normal-case tracking-normal font-light opacity-70">
                    {selectedColor?.name}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => {
                    const active = selectedColor?.name === color.name
                    return (
                      <button
                        key={color.name}
                        title={color.name}
                        onClick={() => {
                          setSelectedColor(color)
                          setImgIndex(0)
                          setZoomed(false)
                        }}
                        className={`w-7 h-7 rounded-full transition-all duration-200 ${
                          active
                            ? 'ring-2 ring-offset-2 ring-brand-black scale-110'
                            : 'ring-1 ring-nude-200 hover:ring-nude-400 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size dropdown */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2.5">
                <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black">Розмір</p>
                <button
                  onClick={() => setSizeGuide(true)}
                  className="font-sans text-[11px] text-brand-black/40 hover:text-brand-black transition-colors underline underline-offset-2"
                >
                  Таблиця розмірів
                </button>
              </div>
              <div className="relative">
                <select
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  disabled={isOutOfStock}
                  className="w-full appearance-none border border-nude-200 rounded-[4px] py-3 px-4 font-sans text-[14px] text-brand-black bg-white cursor-pointer focus:outline-none focus:border-brand-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Оберіть розмір</option>
                  {product.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <ChevronDown size={15} strokeWidth={1.5} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-black" />
              </div>
            </div>

            {/* Add to cart / Out of stock */}
            <div className="mt-6 space-y-3">
              {isOutOfStock ? (
                /* ── Notify me form ── */
                <div className="border border-nude-200 rounded-[4px] px-5 py-5 space-y-3">
                  <p className="font-sans text-[13px] font-semibold text-brand-black/70 uppercase tracking-[0.15em]">
                    Немає в наявності
                  </p>
                  {notifySent ? (
                    <p className="font-sans text-[13px] text-green-600">
                      ✓ Ми повідомимо вас, коли товар з'явиться
                    </p>
                  ) : (
                    <form onSubmit={handleNotify} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={e => setNotifyEmail(e.target.value)}
                        placeholder="Ваш email"
                        className="flex-1 border border-nude-200 px-3 py-2.5 font-sans text-[13px] focus:outline-none focus:border-brand-black transition-colors rounded-[4px]"
                      />
                      <button
                        type="submit"
                        disabled={notifyLoading}
                        className="px-4 py-2.5 bg-brand-black text-white font-sans text-[11px] uppercase tracking-[0.15em] hover:bg-nude-700 transition-colors rounded-[4px] disabled:opacity-50 flex-shrink-0"
                      >
                        {notifyLoading ? '...' : 'Сповістити'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`w-full py-4 font-sans text-[13px] uppercase tracking-widest transition-colors ${
                    !selectedSize
                      ? 'bg-nude-200 text-brand-black cursor-not-allowed'
                      : added
                      ? 'bg-nude-500 text-white'
                      : 'bg-brand-black text-nude-50 hover:bg-nude-700'
                  }`}
                >
                  {added ? 'Додано до кошика ✓' : !selectedSize ? 'Оберіть розмір' : 'Додати до кошика'}
                </button>
              )}

              {/* Favourite toggle */}
              <button
                onClick={() => toggle(id)}
                className={`w-full py-4 border font-sans text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                  isFav
                    ? 'border-brand-black bg-brand-black text-white'
                    : 'border-nude-300 text-brand-black hover:border-brand-black'
                }`}
              >
                <Heart size={15} className={isFav ? 'fill-white text-white' : ''} />
                {isFav ? 'В обраних' : 'Додати до обраних'}
              </button>

              <a
                href="https://www.instagram.com/joli_tone_ua"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 border border-nude-300 font-sans text-[13px] uppercase tracking-widest text-center text-brand-black hover:border-brand-black transition-colors"
              >
                Запитати в Instagram
              </a>
            </div>

            <p className="mt-5 font-sans text-[12px] text-brand-black leading-relaxed opacity-50">
              −5% на наступну покупку за відгук або відмітку в Instagram.
            </p>

            {/* Accordions */}
            <div className="mt-7">
              <Accordion title="Опис" defaultOpen={true}>
                {product.description || ''}
              </Accordion>
              <Accordion title="Обміри">
                {product.measurements || ''}
              </Accordion>
              <Accordion title="Склад та догляд">
                {product.care || ''}
              </Accordion>
              <div className="border-t border-nude-200" />
            </div>

            {/* View all in category */}
            {category && (
              <Link
                to={`/category/${category.slug}`}
                className="mt-6 relative flex items-center justify-center w-full py-3.5 border border-nude-300 font-sans text-[12px] uppercase tracking-widest text-brand-black hover:border-brand-black transition-colors"
              >
                Переглянути всі — {category.label}
                <ChevronRight size={20} strokeWidth={1} className="absolute right-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Related products ── */}
      <div className="mx-4 md:mx-16 border-t border-nude-200 pt-12 pb-16">
        <div className="mb-5">
          <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black mb-2">Для вас</p>
          <h2 className="font-sans text-2xl md:text-3xl font-normal tracking-[0.04em]">Може вам сподобатись</h2>
        </div>

        {/* Carousel with side arrows */}
        <div className="relative">
          <button
            onClick={() => scrollCarousel(-1)}
            className="hidden md:flex absolute -left-10 top-1/2 -translate-y-1/2 z-10 items-center justify-center text-brand-black"
            aria-label="Назад"
          >
            <ChevronLeft size={42} strokeWidth={1.2} />
          </button>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {related.map(p => (
              <div key={p.id} className="flex-none w-[46%] md:w-[23%]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollCarousel(1)}
            className="hidden md:flex absolute -right-10 top-1/2 -translate-y-1/2 z-10 items-center justify-center text-brand-black"
            aria-label="Вперед"
          >
            <ChevronRight size={42} strokeWidth={1.2} />
          </button>
        </div>
      </div>

      {/* ── Size guide modal ── */}
      {sizeGuide && <SizeGuideModal onClose={() => setSizeGuide(false)} />}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-6 z-20 text-brand-black hover:opacity-40 transition-opacity"
            aria-label="Закрити"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          {/* Arrows */}
          {total > 1 && (
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-brand-black hover:opacity-40 transition-opacity" aria-label="Попереднє">
              <ChevronLeft size={36} strokeWidth={1.2} />
            </button>
          )}
          {total > 1 && (
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-brand-black hover:opacity-40 transition-opacity" aria-label="Наступне">
              <ChevronRight size={36} strokeWidth={1.2} />
            </button>
          )}

          {/* Full-screen image */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
            style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
            onMouseDown={e => {
              const r = e.currentTarget.getBoundingClientRect()
              setZoomOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
              setZoomed(true)
            }}
            onMouseMove={e => {
              if (!zoomed) return
              const r = e.currentTarget.getBoundingClientRect()
              setZoomOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
            }}
            onMouseUp={() => setZoomed(false)}
            onMouseLeave={() => setZoomed(false)}
          >
            <img
              key={imgIndex}
              src={imgUrl(images[imgIndex])}
              alt={product.name}
              draggable={false}
              className="w-full h-full object-contain transition-transform duration-150"
              style={zoomed ? { transform: 'scale(2.5)', transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` } : {}}
            />
          </div>

          {/* Thumbnails — float over the image at the bottom */}
          {total > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`flex-shrink-0 w-16 h-20 overflow-hidden transition-opacity ${i === imgIndex ? 'opacity-100' : 'opacity-50'}`}
                >
                  <img src={imgUrl(src)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
