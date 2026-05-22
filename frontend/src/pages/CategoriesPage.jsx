import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import Reveal from '../components/ui/Reveal'

export default function CategoriesPage() {
  return (
    <div>
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-16">
        <Reveal>
          <div className="mb-14">
            <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black mb-3">Joli Tone</p>
            <h1 className="font-sans text-6xl md:text-7xl font-light tracking-[0.04em]">Всі категорії</h1>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {CATEGORIES.filter(c => !c.hidden).map((cat, i) => (
            <Reveal key={cat.slug} delay={(i % 4) + 1}>
              <Link
                to={`/category/${cat.slug}`}
                className="group relative aspect-square bg-nude-100 flex items-end p-6 overflow-hidden"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-nude-100 group-hover:bg-nude-200 transition-colors duration-300" />
                )}
                <div className="absolute inset-0 bg-[#3D1A08]/30 group-hover:bg-[#3D1A08]/42 transition-colors duration-300" />
                <span className="absolute top-6 left-6 w-4 h-px bg-white/60 group-hover:w-10 transition-all duration-300" />
                <span className="relative font-sans text-2xl text-white group-hover:translate-x-1 transition-transform duration-300">
                  {cat.label}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
