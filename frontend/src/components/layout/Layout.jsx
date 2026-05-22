import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Без padding-top — кожна сторінка сама вирішує відступ */}
      <main className="flex-1 pt-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}
