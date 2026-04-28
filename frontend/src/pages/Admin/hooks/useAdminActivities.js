import { useCallback, useEffect, useState } from 'react'
import apiClient from '@/utils/axiosConfig'

export function useAdminActivities({ isAuth, pageSize }) {
  const [activities, setActivities] = useState([])
  const [totalActivities, setTotalActivities] = useState(0)
  const [filterType, setFilterType] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const cached = localStorage.getItem('activities')
    if (!cached) return
    try {
      setActivities(JSON.parse(cached))
    } catch {
      localStorage.removeItem('activities')
    }
  }, [])

  const fetchActivities = useCallback(async () => {
    const params = {
      page,
      limit: pageSize,
      ...(filterType && { type: filterType }),
      ...(filterStart && { startDate: filterStart }),
      ...(filterEnd && { endDate: filterEnd }),
    }
    const { data } = await apiClient.get('/api/activities', { params })
    setActivities(data.activities)
    setTotalActivities(data.total)
  }, [filterEnd, filterStart, filterType, page, pageSize])

  useEffect(() => {
    if (!isAuth) return
    fetchActivities()
  }, [fetchActivities, isAuth])

  const clearFilters = useCallback(() => {
    setFilterType('')
    setFilterStart('')
    setFilterEnd('')
    setPage(1)
  }, [])

  return {
    activities,
    totalActivities,
    filterType,
    setFilterType,
    filterStart,
    setFilterStart,
    filterEnd,
    setFilterEnd,
    page,
    setPage,
    fetchActivities,
    clearFilters,
  }
}
