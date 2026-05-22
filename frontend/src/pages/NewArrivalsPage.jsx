import { PRODUCTS } from '../data/products'
import ProductCard from '../components/ui/ProductCard'
import Reveal from '../components/ui/Reveal'

// Summer edit — light fabrics, open silhouettes, warm palette
const SUMMER_IDS = ['2', '1', '23', '4', '40', '22', '20', '41', '24', '19', '3']
const summerProducts = SUMMER_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean)

export default function NewArrivalsPage() {
  return (
    <div>

      {/* ── Editorial header ── */}
      <Reveal>
        <div className="px-4 md:px-16 pt-10 md:pt-16 pb-8 border-b border-nude-200">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-brand-black/35 mb-2">
            Літо · 2026
          </p>
          <h1 className="font-sans text-3xl md:text-4xl font-light tracking-[0.04em] text-brand-black mb-4">
            Новинки
          </h1>
          <p className="font-sans text-[14px] font-light text-brand-gray max-w-md leading-relaxed">
            Легкі тканини, відкриті силуети, натуральна палітра — добірка для теплих місяців.
          </p>
        </div>
      </Reveal>

      {/* ── Product grid ── */}
      <div className="px-4 md:px-16 pt-10 pb-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {summerProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
