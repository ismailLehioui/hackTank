import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollProgress } from './ScrollProgress'
import { BackToTop } from './BackToTop'
import { useScrollToTop } from '../hooks/useScrollToTop'

export function Layout() {
  useScrollToTop()
  return (
    <div className="app-shell">
      <ScrollProgress />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
