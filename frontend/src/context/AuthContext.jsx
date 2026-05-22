import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

function loadUser() {
  try { return JSON.parse(localStorage.getItem('jolitone_user') || 'null') } catch { return null }
}

function persist(user, token) {
  if (user && token) {
    localStorage.setItem('jolitone_user', JSON.stringify(user))
    localStorage.setItem('jolitone_token', token)
  } else {
    localStorage.removeItem('jolitone_user')
    localStorage.removeItem('jolitone_token')
  }
  window.dispatchEvent(new CustomEvent('jolitone:userChanged'))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  async function login(email, password) {
    const { token, user: u } = await api.login({ email, password })
    const mapped = { ...u, emailVerified: u.email_verified ?? u.emailVerified ?? false }
    persist(mapped, token)
    setUser(mapped)
    return mapped
  }

  async function register(email, name, password) {
    const { token, user: u } = await api.register({ email, name, password })
    const mapped = { ...u, emailVerified: u.email_verified ?? u.emailVerified ?? false }
    persist(mapped, token)
    setUser(mapped)
    return mapped
  }

  function logout() {
    persist(null, null)
    setUser(null)
  }

  // Перечитати свіжі дані з бекенду (наприклад, після верифікації email)
  async function refreshUser() {
    try {
      const fresh = await api.me()
      const updated = { ...fresh, emailVerified: fresh.email_verified }
      localStorage.setItem('jolitone_user', JSON.stringify(updated))
      setUser(updated)
      window.dispatchEvent(new CustomEvent('jolitone:userChanged'))
    } catch { /* токен прострочений — нічого не робимо */ }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
