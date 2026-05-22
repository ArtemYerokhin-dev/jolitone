import { useParams } from 'react-router-dom'
import { PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'
import ProductCard from '../components/ui/ProductCard'
import FabricsPage from './FabricsPage'

export default function CategoryPage() {
  const { slug } = useParams()

  if (slug === 'tkanyny') return <FabricsPage />

  const category = CATEGORIES.find((c) => c.slug === slug)
  const products = PRODUCTS.filter((p) => p.category === slug)

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="font-sans text-2xl text-brand-black">Категорію не знайдено</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-16 pt-14 md:pt-16 pb-10">
      {/* Heading */}
      <div className="mb-6 pb-5 border-b border-nude-200">
        <h1 className="font-sans text-2xl md:text-4xl font-light tracking-[0.04em]">{category.label}</h1>
        <p className="mt-2 font-sans text-[13px] text-brand-gray">{products.length} позицій</p>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-sans text-2xl text-brand-black">Товари незабаром з'являться</p>
          <p className="mt-3 font-sans text-[17px] text-brand-black">
            Слідкуйте за оновленнями в{' '}
            <a
              href="https://www.instagram.com/joli_tone_ua"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand-black"
            >
              Instagram
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
