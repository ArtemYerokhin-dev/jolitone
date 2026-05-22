import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../context/FavoritesContext'

export default function ProductCard({ product }) {
  const { id, name, price, images, colors } = product
  const { toggle, has } = useFavorites()
  const isFav = has(id)
  const [imgIndex, setImgIndex] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)
  const timersRef = useRef([])

  const selectedColor = colors?.[colorIndex] || null

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }

  const handleMouseEnter = () => {
    clearTimers()
    if (images?.length > 1) {
      timersRef.current.push(setTimeout(() => setImgIndex(1), 850))
    }
    if (images?.length > 2) {
      timersRef.current.push(setTimeout(() => setImgIndex(2), 2000))
    }
  }

  const handleMouseLeave = () => {
    clearTimers()
    setImgIndex(0)
  }

  // Index 0 → show selected colour flatlay; other indices → model photos
  const currentImg =
    imgIndex === 0
      ? (selectedColor?.image || images?.[0])
      : images?.[imgIndex]

  const handleColorClick = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    setColorIndex(i => (i + 1) % colors.length)
    setImgIndex(0)
  }

  return (
    <div className="block">
      <Link
        to={`/product/${id}`}
        className="group block"
      >
        <div
          className="relative overflow-hidden bg-white aspect-[3/4]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {currentImg ? (
            <img
              key={`${imgIndex}-${colorIndex}`}
              src={currentImg}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover product-img-fade"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-nude-300 text-[10px] font-sans tracking-[0.2em] uppercase">фото</span>
            </div>
          )}
          <div className="absolute inset-0 bg-[#6B4226]/[0.10] pointer-events-none" />

          {/* Favorite heart button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id) }}
            className={`absolute top-0 right-0 z-10 p-3 transition-all duration-200 ${
              isFav ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
            aria-label={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
          >
            <Heart
              size={20}
              strokeWidth={1.6}
              className={isFav
                ? 'fill-[#C0392B] text-[#C0392B] drop-shadow-sm'
                : 'text-brand-black fill-white/60 drop-shadow-sm'
              }
            />
          </button>

          {/* Dots indicator */}
          {images?.length > 1 && (
            <div className="absolute bottom-2.5 right-3 flex gap-1.5 pointer-events-none">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`block w-[5px] h-[5px] rounded-full transition-all duration-300 ${
                    i === imgIndex ? 'bg-[#C4A882]' : 'bg-nude-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 px-0.5">
          <p className="font-sans text-[12px] font-normal leading-snug text-brand-black tracking-wide">
            {name}
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="font-sans text-[12px] font-normal text-brand-black tracking-wide">
              {price.toLocaleString('uk-UA')} ₴
            </p>
            {colors && colors.length > 1 && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleColorClick(e) }}
                className="flex items-center gap-1.5 group/color flex-shrink-0"
                title={`${selectedColor?.name} · натисни, щоб змінити колір`}
              >
                <span
                  className="w-[9px] h-[9px] rounded-full flex-shrink-0 transition-transform duration-150 group-hover/color:scale-110"
                  style={{ backgroundColor: selectedColor?.hex }}
                />
                <span className="font-sans text-[11px] text-brand-black/40 tracking-wide">
                  +{colors.length - 1}
                </span>
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
