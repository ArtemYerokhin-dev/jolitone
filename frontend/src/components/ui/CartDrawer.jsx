import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { imgUrl } from '../../utils/img'

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total, count } = useCart()
  const navigate = useNavigate()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-brand-black/30 z-40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-nude-50 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-nude-200">
          <h2 className="font-sans text-2xl">Кошик ({count})</h2>
          <button onClick={onClose} className="text-brand-black hover:text-brand-black transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <p className="text-brand-black text-sm pt-8 text-center font-sans">
              Кошик порожній
            </p>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4">
                <div className="w-20 h-24 bg-white border border-nude-200 flex-shrink-0 overflow-hidden">
                  {item.images?.[0] ? (
                    <img src={imgUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-nude-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-base leading-tight">{item.name}</p>
                  <p className="text-brand-black text-xs mt-1 font-sans">Розмір: {item.size}</p>
                  <p className="text-brand-black text-xs font-sans">{item.price.toLocaleString('uk-UA')} грн</p>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => item.qty > 1 ? updateQty(item.id, item.size, item.qty - 1) : removeItem(item.id, item.size)}
                      className="w-8 h-8 flex items-center justify-center border border-nude-300 text-brand-black hover:border-brand-black transition-colors flex-shrink-0"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-sans text-sm w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-nude-300 text-brand-black hover:border-brand-black transition-colors flex-shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="ml-auto p-1.5 text-brand-black/40 hover:text-brand-black transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-nude-200 px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm text-brand-black uppercase tracking-widest">Разом</span>
              <span className="font-sans text-xl">{total.toLocaleString('uk-UA')} грн</span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/checkout') }}
              className="w-full bg-brand-black text-nude-50 py-3.5 font-sans text-sm uppercase tracking-widest hover:bg-nude-700 transition-colors"
            >
              Оформити замовлення
            </button>
          </div>
        )}
      </div>
    </>
  )
}
