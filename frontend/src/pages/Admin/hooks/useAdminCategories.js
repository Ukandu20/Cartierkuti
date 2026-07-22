import { useCallback, useState } from 'react'
import apiClient from '@/utils/axiosConfig'
import { toaster } from '@/components/ui/toaster'

const messageFor = (error, fallback) => error?.response?.data?.message || fallback

export function useAdminCategories({ handleUnauthorized } = {}) {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const { data } = await apiClient.get('/api/categories')
      if (!Array.isArray(data)) throw new Error('Invalid category response')
      setCategories(data)
      setCategoriesLoaded(true)
      return data
    } catch (error) {
      handleUnauthorized?.(error)
      toaster.create({ title: 'Could not load categories', type: 'error', closable: true })
      return []
    } finally {
      setCategoriesLoading(false)
    }
  }, [handleUnauthorized])

  const createCategory = useCallback(async (payload) => {
    try {
      await apiClient.post('/api/categories', payload)
      await fetchCategories()
      toaster.create({ title: 'Category added', type: 'success', closable: true })
      return true
    } catch (error) {
      handleUnauthorized?.(error)
      toaster.create({ title: 'Could not add category', description: messageFor(error, 'Try again.'), type: 'error', closable: true })
      return false
    }
  }, [fetchCategories, handleUnauthorized])

  const updateCategory = useCallback(async (id, payload) => {
    try {
      await apiClient.put(`/api/categories/${id}`, payload)
      await fetchCategories()
      toaster.create({ title: 'Category updated', type: 'success', closable: true })
      return true
    } catch (error) {
      handleUnauthorized?.(error)
      toaster.create({ title: 'Could not update category', description: messageFor(error, 'Try again.'), type: 'error', closable: true })
      return false
    }
  }, [fetchCategories, handleUnauthorized])

  const deleteCategory = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/categories/${id}`)
      await fetchCategories()
      toaster.create({ title: 'Category deleted', type: 'success', closable: true })
      return true
    } catch (error) {
      handleUnauthorized?.(error)
      toaster.create({ title: 'Could not delete category', description: messageFor(error, 'Try again.'), type: 'error', closable: true })
      return false
    }
  }, [fetchCategories, handleUnauthorized])

  return { categories, categoriesLoading, categoriesLoaded, fetchCategories, createCategory, updateCategory, deleteCategory }
}
