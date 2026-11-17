import { useCallback, useEffect, useRef, useState } from 'react'
import apiClient from '@/utils/axiosConfig'

export const REVIEW_PAGE_SIZE = 20

export function useProjectReviews(projectId) {
  const [reviews, setReviews] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const pending = useRef(false)
  const controller = useRef(null)

  const loadPage = useCallback(async nextPage => {
    if (!projectId || pending.current) return
    const version = generation.current
    pending.current = true
    controller.current = new AbortController()
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/api/projects/${projectId}/reviews`, {
        params: { page: nextPage, limit: REVIEW_PAGE_SIZE }, signal: controller.current.signal,
      })
      if (version !== generation.current) return
      const incoming = Array.isArray(data) ? data : data?.reviews || []
      const count = Number.isFinite(data?.total) ? data.total : incoming.length
      setReviews(current => {
        const combined = nextPage === 1 ? incoming : [...current, ...incoming]
        const seen = new Set()
        return combined.filter(review => {
          if (!review._id) return true
          if (seen.has(review._id)) return false
          seen.add(review._id)
          return true
        })
      })
      setPage(nextPage)
      setTotal(count)
      setHasMore(incoming.length > 0 && nextPage * REVIEW_PAGE_SIZE < count)
    } catch {
      if (version === generation.current) setError('Reviews could not be loaded. Please try again.')
    } finally {
      if (version === generation.current) {
        pending.current = false
        setLoading(false)
      }
    }
  }, [projectId])

  useEffect(() => {
    generation.current += 1
    pending.current = false
    setReviews([])
    setPage(0)
    setTotal(0)
    setHasMore(false)
    setError('')
    loadPage(1)
    return () => { generation.current += 1; controller.current?.abort() }
  }, [loadPage])

  const addReview = (review, count) => {
    if (!review) return
    setReviews(current => [review, ...current.filter(item => !review._id || item._id !== review._id)])
    setTotal(current => Number.isFinite(count) ? count : current + 1)
    if (Number.isFinite(count)) setHasMore(count > reviews.length + (reviews.some(item => review._id && item._id === review._id) ? 0 : 1))
  }

  return { reviews, total, loading, error, hasMore, addReview, loadMore: () => loadPage(page + 1) }
}
