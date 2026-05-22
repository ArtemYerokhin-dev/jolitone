const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken() {
  try { return localStorage.getItem('jolitone_token') } catch { return null }
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  if (res.status === 204) return null
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Помилка ${res.status}`)
  return body
}

export const api = {
  // ── Auth ──
  register: (data)  => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login:    (data)  => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
  me:       ()      => request('/auth/me'),
  updateMe: (data)  => request('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
  resendVerification: () => request('/auth/resend-verification', { method: 'POST' }),

  // ── Favorites ──
  getFavorites:   ()          => request('/favorites'),
  addFavorite:    (productId) => request('/favorites', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFavorite: (productId) => request(`/favorites/${productId}`, { method: 'DELETE' }),

  // ── Orders ──
  createOrder: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  getMyOrders: ()      => request('/orders/my'),
  trackOrder:  (id)    => request(`/orders/track/${id}`),

  // ── Promo codes ──
  checkPromo: (code, orderTotal) => request('/promo/check', { method: 'POST', body: JSON.stringify({ code, orderTotal }) }),

  // ── Stock ──
  getProductStock: (productId) => request(`/stock/${productId}`),

  // ── Notify when available ──
  notifyStock: (email, productId) => request('/notify-stock', { method: 'POST', body: JSON.stringify({ email, productId }) }),

  // ── Reviews ──
  getReviews:   ()     => request('/reviews'),
  createReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin ──
  getAdminStats:     ()           => request('/admin/stats'),
  getAdminOrders:    ()           => request('/admin/orders'),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getStock:          ()           => request('/admin/stock'),
  updateStock:       (productId, quantity) => request(`/admin/stock/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  getAdminReviews:   ()           => request('/admin/reviews'),
  approveReview:     (id)         => request(`/admin/reviews/${id}/approve`, { method: 'PATCH' }),
  deleteReview:      (id)         => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
  sendNewsletter:    (data)       => request('/admin/newsletter', { method: 'POST', body: JSON.stringify(data) }),
  getNewsletterLogs: ()           => request('/admin/newsletter/logs'),
  // Promo codes (admin)
  getPromoCodes:  ()           => request('/admin/promo-codes'),
  createPromoCode: (data)      => request('/admin/promo-codes', { method: 'POST', body: JSON.stringify(data) }),
  deletePromoCode: (id)        => request(`/admin/promo-codes/${id}`, { method: 'DELETE' }),
}
