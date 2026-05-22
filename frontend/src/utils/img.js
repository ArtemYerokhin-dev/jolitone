const base = import.meta.env.BASE_URL.replace(/\/$/, '')
export const imgUrl = (path) => (path ? `${base}${path}` : path)
