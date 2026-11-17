import { useCallback, useEffect, useRef, useState } from 'react'
import { getPublicProjectPage } from '@/services/projectService'

export function useProjectBrowser() {
  const [query, setQuery] = useState({ page: 1, limit: 9, category: 'all', search: '', sort: 'date' })
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const version = useRef(0)

  useEffect(() => {
    if (search.trim() === query.search) return
    const timer = setTimeout(() => setQuery(current => ({ ...current, search: search.trim(), page: 1 })), 250)
    return () => clearTimeout(timer)
  }, [query.search, search])

  const load = useCallback(async (fresh = false) => {
    const request = ++version.current
    setLoading(true)
    setError('')
    try {
      const result = await getPublicProjectPage(query, { fresh })
      if (request !== version.current) return
      const maxPage = Math.max(1, Math.ceil(result.total / query.limit))
      if (query.page > maxPage) {
        setQuery(current => ({ ...current, page: maxPage }))
        return
      }
      setData(result)
    } catch {
      if (request === version.current) setError('Projects could not be loaded.')
    } finally {
      if (request === version.current) setLoading(false)
    }
  }, [query])

  useEffect(() => {
    load()
    return () => { version.current += 1 }
  }, [load])

  const changeFilter = (key, value) => setQuery(current => ({ ...current, [key]: value, search: search.trim(), page: 1 }))
  const onReviewSaved = (id, summary) => setData(current => current && ({
    ...current,
    projects: current.projects.map(project => project.id === id ? { ...project, ...summary } : project),
    featuredProject: current.featuredProject?.id === id ? { ...current.featuredProject, ...summary } : current.featuredProject,
  }))

  return {
    data, query, search, setSearch, loading, error, retry: () => load(true), onReviewSaved,
    setCategory: value => changeFilter('category', value), setSort: value => changeFilter('sort', value),
    setPage: page => setQuery(current => current.page === page ? current : { ...current, page }),
  }
}
