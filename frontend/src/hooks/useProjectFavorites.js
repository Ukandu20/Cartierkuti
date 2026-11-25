import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-project-favorites'
const CHANGE_EVENT = 'portfolio-favorites-changed'

function readFavorites() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.filter(id => typeof id === 'string') : []
  } catch {
    return null
  }
}

export function useProjectFavorites() {
  const [favorites, setFavorites] = useState(() => readFavorites() || [])

  useEffect(() => {
    const sync = () => {
      const stored = readFavorites()
      if (stored) setFavorites(stored)
    }
    window.addEventListener('storage', sync)
    window.addEventListener(CHANGE_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(CHANGE_EVENT, sync)
    }
  }, [])

  const toggleFavorite = useCallback((id) => {
    const current = readFavorites() || favorites
    const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch {
      setFavorites(next)
    }
  }, [favorites])

  return { favorites, toggleFavorite }
}
