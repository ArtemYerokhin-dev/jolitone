import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../api/client'

const FavoritesContext = createContext(null)
const LS_KEY = 'jolitone_fav'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveLocal(ids) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids))
}
function getToken() {
  try { return localStorage.getItem('jolitone_token') } catch { return null }
}

export function FavoritesProvider({ children }) {
  const [favs, setFavs] = useState(loadLocal)

  // При логіні/логауті — синхронізувати з бекендом
  useEffect(() => {
    const sync = async () => {
      if (getToken()) {
        try {
          const ids = await api.getFavorites()
          setFavs(ids)
          saveLocal(ids)
        } catch { /* залишаємо локальні */ }
      } else {
        setFavs([])
        saveLocal([])
      }
    }
    window.addEventListener('jolitone:userChanged', sync)
    if (getToken()) sync()
    return () => window.removeEventListener('jolitone:userChanged', sync)
  }, [])

  const toggle = useCallback(async (id) => {
    if (!getToken()) {
      window.dispatchEvent(new CustomEvent('jolitone:requireAuth'))
      return
    }
    const isIn = favs.includes(id)
    const next = isIn ? favs.filter(f => f !== id) : [...favs, id]
    setFavs(next)
    saveLocal(next)
    try {
      if (isIn) await api.removeFavorite(id)
      else      await api.addFavorite(id)
    } catch {
      setFavs(favs)
      saveLocal(favs)
    }
  }, [favs])

  const has = useCallback((id) => favs.includes(id), [favs])

  return (
    <FavoritesContext.Provider value={{ favs, toggle, has, count: favs.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
