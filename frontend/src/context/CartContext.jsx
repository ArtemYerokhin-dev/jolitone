import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(
        (i) => i.id === action.item.id && i.size === action.item.size
      )
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id && i.size === action.item.size
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      }
      return [...state, { ...action.item, qty: 1 }]
    }
    case 'REMOVE':
      return state.filter(
        (i) => !(i.id === action.id && i.size === action.size)
      )
    case 'UPDATE_QTY':
      return state.map((i) =>
        i.id === action.id && i.size === action.size
          ? { ...i, qty: action.qty }
          : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const addItem = (item) => dispatch({ type: 'ADD', item })
  const removeItem = (id, size) => dispatch({ type: 'REMOVE', id, size })
  const updateQty = (id, size, qty) => dispatch({ type: 'UPDATE_QTY', id, size, qty })
  const clearCart = () => dispatch({ type: 'CLEAR' })

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
