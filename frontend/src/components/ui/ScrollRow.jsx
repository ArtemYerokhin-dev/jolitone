import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ScrollRow({ children, gap = 'gap-3', px = 'px-6 md:px-10' }) {
  const ref = useRef(null)
  const raf = useRef(null)
  const [canLeft, setCanLeft]   = useState(false)
  const [canRight, setCanRight] = useState(false)

  const STEP = 320
  const DURATION = 480

  const check = () => {
    const el = ref.current
    if (!el) return
    const overflows = el.scrollWidth > el.clientWidth + 1
    setCanLeft(overflows && el.scrollLeft > 4)
    setCanRight(overflows && el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [])

  const scroll = (dir) => {
    const el = ref.current
    if (!el) return

    if (raf.current) cancelAnimationFrame(raf.current)

    const from = el.scrollLeft
    const to = from + dir * STEP
    const start = performance.now()

    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

    const tick = (now) => {
      const p = Math.min((now - start) / DURATION, 1)
      el.scrollLeft = from + (to - from) * easeOutExpo(p)
      if (p < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        raf.current = null
      }
    }

    raf.current = requestAnimationFrame(tick)
  }

  return (
    <div className="relative group/row">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        aria-label="Прокрутити ліворуч"
        className={`absolute left-2 top-[45%] -translate-y-1/2 z-10 text-brand-black transition-opacity duration-200
          ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>

      {/* Scrollable content */}
      <div
        ref={ref}
        className={`flex ${gap} overflow-x-auto scrollbar-hide ${px} pb-1`}
      >
        {children}
        <div className="flex-shrink-0 w-4 md:w-8" />
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        aria-label="Прокрутити праворуч"
        className={`absolute right-2 top-[45%] -translate-y-1/2 z-10 text-brand-black transition-opacity duration-200
          ${canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={28} strokeWidth={1.5} />
      </button>
    </div>
  )
}
