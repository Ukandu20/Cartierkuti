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
      invalidateResumeCache()
      toaster.create({ title: 'Resume updated', type: 'success', closable: true })
      return true
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error saving resume', type: 'error', closable: true })
      return false
    }
  }, [resumeForm])

  const uploadResumeFile = useCallback(async (file) => {
    try {
      const body = new FormData()
      body.append('resume', file)
      const { data } = await apiClient.post('/api/resume/file', body)
      invalidateResumeCache()
      setResumeForm((current) => ({
        ...current,
        resumeFileUrl: data.resumeFileUrl || '',
        resumeFileName: data.resumeFileName || '',
        resumeFileUpdatedAt: data.resumeFileUpdatedAt || '',
      }))
      toaster.create({ title: 'Resume PDF uploaded', type: 'success', closable: true })
      return true
    } catch (error) {
      reportAdminError(error)
      toaster.create({
        title: 'Resume PDF upload failed',
        description: error?.response?.data?.message || 'Please choose a PDF and try again.',
        type: 'error',
        closable: true,
      })
      return false
    }
  }, [])

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
    uploadResumeFile,
  }
}
