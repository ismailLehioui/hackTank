import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scroll back to the top whenever the route changes.
export function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
}
