import { useCallback, useState } from 'react'
import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'
import { toaster } from '@/components/ui/toaster'
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
      const { data } = await apiClient.get('/api/resume')
      setResumeForm(normalizeResumeForm(data))
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error loading resume', type: 'error', closable: true })
      setResumeForm(emptyResumeForm)
    } finally {
      setResumeLoading(false)
    }
  }, [])

  const saveResume = useCallback(async () => {
    try {
      await apiClient.put('/api/resume', buildResumePayload(resumeForm))
      toaster.create({ title: 'Resume updated', type: 'success', closable: true })
      return true
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error saving resume', type: 'error', closable: true })
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
