import { useEffect, useState } from 'react'

// Reveals children with a fade/slide once they scroll into view.
export function useReveal<T extends Element>() {
  const [ref, setRef] = useState<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  return { setRef, visible }
}
