import { useEffect, useState } from 'react'
import apiClient from '@/utils/axiosConfig'

export const FALLBACK_RESUME_URL = '/resume.pdf'

export function getResumeDownloadUrl(resume) {
  return resume?.resumeFileUrl || FALLBACK_RESUME_URL
}

export function useResumeDownload(initialResume) {
  const [resumeUrl, setResumeUrl] = useState(getResumeDownloadUrl(initialResume))

  useEffect(() => {
    let active = true

    if (initialResume?.resumeFileUrl) {
      setResumeUrl(initialResume.resumeFileUrl)
      return () => {
        active = false
      }
    }

    apiClient
      .get('/api/resume')
      .then(({ data }) => {
        if (active) setResumeUrl(getResumeDownloadUrl(data))
      })
      .catch(() => {
        if (active) setResumeUrl(FALLBACK_RESUME_URL)
      })

    return () => {
      active = false
    }
  }, [initialResume?.resumeFileUrl])

  return resumeUrl
}
