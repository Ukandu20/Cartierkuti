import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // Reset scroll so new route content starts at the top.
    window.scrollTo(0, 0)
  }, [pathname, search, hash])

  return null
}
