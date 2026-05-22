import { PRODUCTS } from '../data/products'
import ProductCard from '../components/ui/ProductCard'
import Reveal from '../components/ui/Reveal'

// Curated bestsellers — varied categories, proven styles
const BEST_IDS = ['1', '2', '8', '6', '5', '7', '24', '27', '12', '38', '17', '22']
const bestProducts = BEST_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean)

export default function BestsellersPage() {
  return (
    <div>
      <Reveal>
        <div className="px-4 md:px-16 pt-10 md:pt-16 pb-8 border-b border-nude-200">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-brand-black/35 mb-2">
            Найчастіше замовляють
          </p>
          <h1 className="font-sans text-3xl md:text-4xl font-light tracking-[0.04em] text-brand-black mb-4">
            Бестселери
          </h1>
          <p className="font-sans text-[14px] font-light text-brand-gray max-w-md leading-relaxed">
            Позиції, до яких повертаються найчастіше — різні категорії, перевірені фасони.
          </p>
        </div>
      </Reveal>

      <div className="px-4 md:px-16 pt-10 pb-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {bestProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
