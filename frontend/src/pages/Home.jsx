import { Link } from 'react-router-dom'
import { PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'
import ProductCard from '../components/ui/ProductCard'
import Reveal from '../components/ui/Reveal'
import { imgUrl } from '../utils/img'

const HERO_VIDEO    = imgUrl('/hero.mp4')
const HERO_POSTER   = ''
const EDITORIAL_IMG = imgUrl('/images/editorial.jpg')

const TOP_CATEGORIES = ['sukni', 'kostiumy', 'sorochky', 'verkhnii-odiah']
const featuredCategories = CATEGORIES.filter(c => TOP_CATEGORIES.includes(c.slug))

const newArrivals = PRODUCTS.slice(0, 4)
const bestsellers = PRODUCTS.slice(4, 8)

function SectionHeader({ label, title, link }) {
  return (
    <div className="flex items-end justify-between px-4 md:px-16 mb-6">
      <div>
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-brand-black/35 mb-1.5">{label}</p>
        <h2 className="font-sans text-2xl md:text-3xl font-normal tracking-[0.04em]">{title}</h2>
      </div>
      {link && (
        <Link to={link}
          className="font-sans text-[13px] md:text-[14px] uppercase tracking-widest text-brand-black hover:text-brand-black transition-colors pb-0.5 border-b border-nude-300 hover:border-brand-black mb-1 flex-shrink-0 ml-4">
          Всі →
        </Link>
      )}
    </div>
  )
}

function ProductGrid({ products }) {
  return (
    <div className="px-4 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

function CategoryGrid({ categories }) {
  return (
    <div className="px-4 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {categories.map(cat => (
        <Link key={cat.slug} to={`/category/${cat.slug}`} className="group block">
          <div className="relative overflow-hidden bg-nude-100 aspect-[3/4]">
            {cat.image ? (
              <img
                src={imgUrl(cat.image)}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-nude-100 hover:bg-nude-200 transition-colors duration-300" />
            )}
            <div className="absolute inset-0 bg-[#6B4226]/[0.10] pointer-events-none" />
          </div>
          <div className="mt-2 px-0.5">
            <p className="font-sans text-[13px] font-normal text-brand-black tracking-wide">{cat.label}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────── */}
      <section className="relative h-screen min-h-[560px] overflow-hidden bg-nude-200 -mt-12">
        {HERO_VIDEO ? (
          <video src={HERO_VIDEO} poster={HERO_POSTER} autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="font-sans text-[14px] uppercase tracking-[0.3em] text-brand-black">HERO_VIDEO</span>
            <span className="font-sans text-[17px] text-nude-300 tracking-widest">mp4 · 15–30 сек · без звуку</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-0 right-0 bottom-[18%] md:bottom-[22%] px-6 md:px-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-nude-300 mb-4">Fashion Room · Київ</p>
          <div className="inline-block">
            <h1 className="font-antiqua text-[clamp(2.4rem,4.5vw,4rem)] font-light leading-[1.1] text-white tracking-[0.02em]">
              Зустрічай літо<br />разом з нами
            </h1>
            <div className="mt-7">
              <Link to="/novynky"
                className="block w-full font-sans text-[14px] uppercase tracking-[0.25em] text-white text-center border border-white/70 hover:border-white hover:bg-white/10 py-3 transition-all duration-200 rounded-[6px]">
                Купити
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 right-7 md:right-12 flex flex-col items-center gap-2 opacity-40">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-white rotate-90 origin-center translate-y-2">scroll</span>
          <div className="w-px h-8 bg-white/60" />
        </div>
      </section>

      {/* ── НОВИНКИ ──────────────────────── */}
      <section className="pt-16 pb-14">
        <Reveal><SectionHeader label="Щойно з'явились" title="Новинки" link="/novynky" /></Reveal>
        <ProductGrid products={newArrivals} />
      </section>

      {/* ── КАТЕГОРІЇ ────────────────────── */}
      <section className="pb-14">
        <Reveal><SectionHeader label="Обирають найчастіше" title="Категорії" /></Reveal>
        <CategoryGrid categories={featuredCategories} />
      </section>

      {/* ── EDITORIAL ────────────────────── */}
      <Reveal>
        <div className="relative w-full h-[70vh] md:h-[80vh] bg-nude-200 overflow-hidden">
          {EDITORIAL_IMG ? (
            <img src={EDITORIAL_IMG} alt="Joli Tone editorial"
              className="w-full h-full object-cover"
              style={{ filter: 'sepia(0.15) contrast(0.91) brightness(0.95) saturate(0.9)' }} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="font-sans text-[14px] uppercase tracking-[0.3em] text-brand-black">EDITORIAL_IMG</span>
              <span className="font-sans text-[17px] text-nude-300 tracking-widest">широкоформатне горизонтальне фото</span>
            </div>
          )}
          {/* vintage warm overlay */}
          <div className="absolute inset-0 bg-[#C8A97E]/20 mix-blend-multiply pointer-events-none" />
          {/* vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />
          <div className="absolute left-5 md:left-14 bottom-6 md:bottom-12">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Joli Tone · 2026</p>
            <p className="font-sans text-lg md:text-3xl font-light text-white leading-snug">
              Авторський відбір.<br />Тільки живі примірки.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── БЕСТСЕЛЕРИ ───────────────────── */}
      <section className="pt-16 pb-14">
        <Reveal><SectionHeader label="Найчастіше замовляють" title="Бестселери" link="/bestsellery" /></Reveal>
        <ProductGrid products={bestsellers} />
      </section>

      {/* ── INSTAGRAM ────────────────────── */}
      <section className="py-16 px-6 text-center">
        <Reveal>
          <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-brand-black/40 mb-3">Слідкуйте за нами</p>
          <a href="https://www.instagram.com/joli_tone_ua" target="_blank" rel="noopener noreferrer"
            className="block font-sans text-2xl md:text-3xl font-light tracking-widest text-brand-black hover:text-brand-black transition-colors mb-5">
            @joli_tone_ua
          </a>
          <a href="https://www.instagram.com/joli_tone_ua" target="_blank" rel="noopener noreferrer"
            className="inline-block font-sans text-[14px] uppercase tracking-[0.25em] border-b border-nude-400 pb-0.5 text-brand-black hover:text-brand-black hover:border-brand-black transition-colors">
            Відкрити Instagram
          </a>
        </Reveal>
      </section>
    </>
  )
}
