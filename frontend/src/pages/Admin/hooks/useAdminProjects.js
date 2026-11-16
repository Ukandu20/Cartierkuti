import { useCallback, useState } from 'react'
import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'
import { toaster } from '@/components/ui/toaster'
import { invalidateResumeCache } from '@/services/resumeService'
import {
  buildResumePayload,
  emptyResumeForm,
  normalizeResumeForm,
} from '../adminDashboardUtils'

const reportAdminError = (error) => {
  if (import.meta.env.DEV) {
    console.error(error)
  }
}

export function useAdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resumeForm, setResumeForm] = useState(emptyResumeForm)
  const [resumeLoading, setResumeLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/projects')
      setProjects(normalizeProjects(data))
      setError('')
    } catch {
      setError('Could not load projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchResume = useCallback(async () => {
    setResumeLoading(true)
    try {
      const { data } = await apiClient.get('/api/resume/admin')
      const normalized = normalizeResumeForm(data)
      setResumeForm(normalized)
      return normalized
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error loading resume', type: 'error', closable: true })
      setResumeForm(emptyResumeForm)
      return emptyResumeForm
    } finally {
      setResumeLoading(false)
    }
  }, [])

  const saveResume = useCallback(async (file) => {
    try {
      let body = buildResumePayload(resumeForm)
      if (file) {
        const formData = new FormData()
        formData.append('content', JSON.stringify(body))
        formData.append('resume', file)
        body = formData
      }
      const { data } = await apiClient.put('/api/resume', body)
      const savedForm = normalizeResumeForm(data)
      setResumeForm(savedForm)
      invalidateResumeCache()
      toaster.create({ title: 'About page updated', type: 'success', closable: true })
      return savedForm
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'About page could not be saved', description: error?.response?.data?.message || 'Your changes are still available. Please try again.', type: 'error', closable: true })
      return false
    }
  }, [resumeForm])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    resumeForm,
    setResumeForm,
    resumeLoading,
    fetchResume,
    saveResume,
  }
}
