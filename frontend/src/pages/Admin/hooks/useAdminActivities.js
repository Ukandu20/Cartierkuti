import { useCallback, useEffect, useRef, useState } from 'react'
import apiClient from '@/utils/axiosConfig'

const emptyQuery = { page: 1, type: '', startDate: '', endDate: '' }

export function useAdminActivities({ isAuth, pageSize }) {
  const [activities, setActivities] = useState([])
  const [totalActivities, setTotalActivities] = useState(0)
  const [query, setQuery] = useState(emptyQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const latestQuery = useRef(query)
  const enabled = useRef(isAuth)
  const requestId = useRef(0)
  const controller = useRef(null)

  // A stable refresh callback also uses the latest filters after an awaited save.
  const fetchActivities = useCallback(async () => {
    if (!enabled.current) return false
    controller.current?.abort()
    controller.current = new AbortController()
    const version = ++requestId.current
    const { page, type, startDate, endDate } = latestQuery.current
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get('/api/activities', {
        params: { page, limit: pageSize, ...(type && { type }), ...(startDate && { startDate }), ...(endDate && { endDate }) },
        signal: controller.current.signal,
      })
      if (version !== requestId.current) return false
      setActivities(Array.isArray(data.activities) ? data.activities : [])
      setTotalActivities(Number(data.total) || 0)
      return true
    } catch {
      if (version === requestId.current) setError('Activity could not be loaded.')
      return false
    } finally {
      if (version === requestId.current) setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    latestQuery.current = query
    enabled.current = isAuth
    if (isAuth) fetchActivities()
    else {
      setActivities([])
      setTotalActivities(0)
      setError('')
      setLoading(false)
    }
    return () => { enabled.current = false; requestId.current += 1; controller.current?.abort() }
  }, [fetchActivities, isAuth, query])

  const applyFilters = useCallback(({ type = '', startDate = '', endDate = '' }) => {
    if (startDate && endDate && startDate > endDate) return false
    setQuery(current => current.page === 1 && current.type === type && current.startDate === startDate && current.endDate === endDate
      ? current : { page: 1, type, startDate, endDate })
    return true
  }, [])

  const setPage = useCallback(page => {
    setQuery(current => current.page === page ? current : { ...current, page })
  }, [])
  const clearFilters = useCallback(() => applyFilters(emptyQuery), [applyFilters])

  return {
    activities, totalActivities, loading, error,
    filterType: query.type, filterStart: query.startDate, filterEnd: query.endDate,
    page: query.page, setPage, applyFilters, fetchActivities, clearFilters,
  }
}
