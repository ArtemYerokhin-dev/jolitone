import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { PRODUCTS } from '../data/products'
import ProductCard from '../components/ui/ProductCard'
import Reveal from '../components/ui/Reveal'

export default function FavoritesPage() {
  const { favs } = useFavorites()
  const { user } = useAuth()
  const products = PRODUCTS.filter(p => favs.includes(p.id))

  return (
    <div className="min-h-[60vh]">
      <div className="pt-12 pb-6 px-4 md:px-16">
        <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black/40 mb-1.5">
          Мій список
        </p>
        <h1 className="font-sans text-3xl font-normal tracking-[0.04em] text-brand-black">
          Обрані
        </h1>
      </div>

      {!user ? (
        <Reveal>
          <div className="px-4 md:px-16 py-20 flex flex-col items-center gap-5 text-center">
            <div className="w-12 h-12 rounded-full bg-nude-100 flex items-center justify-center mb-1">
              <User size={20} className="text-brand-black/40" />
            </div>
            <p className="font-sans text-[15px] text-brand-black/50 tracking-wide">
              Увійдіть, щоб побачити ваші обрані
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('jolitone:requireAuth'))}
              className="font-sans text-[13px] uppercase tracking-[0.25em] border-b border-nude-400 pb-0.5 text-brand-black hover:border-brand-black transition-colors"
            >
              Увійти / Зареєструватись
            </button>
          </div>
        </Reveal>
      ) : products.length === 0 ? (
        <Reveal>
          <div className="px-4 md:px-16 py-20 flex flex-col items-center gap-5 text-center">
            <p className="font-sans text-[15px] text-brand-black/40 tracking-wide">
              Ви ще не додали жодного товару до обраних
            </p>
            <Link
              to="/"
              className="font-sans text-[13px] uppercase tracking-[0.25em] border-b border-nude-400 pb-0.5 text-brand-black hover:border-brand-black transition-colors"
            >
              Перейти до каталогу
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="pb-14 px-4 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
