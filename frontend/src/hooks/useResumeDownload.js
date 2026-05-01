import { useEffect, useState } from 'react'
import apiClient from '@/utils/axiosConfig'

export const FALLBACK_RESUME_URL = '/resume.pdf'
export const FALLBACK_RESUME_FILENAME = 'Preston-Ukandu-Resume.pdf'
const API_URL = import.meta.env.VITE_API_URL

export function getResumeDownloadUrl(resume) {
  return resume?.resumeFileUrl
    ? `${API_URL}/api/resume/file/download`
    : FALLBACK_RESUME_URL
}

export function getResumeDownloadFilename(resume) {
  return resume?.resumeFileName?.toLowerCase().endsWith('.pdf')
    ? resume.resumeFileName
    : FALLBACK_RESUME_FILENAME
}

export function useResumeDownload(initialResume) {
  const [resumeDownload, setResumeDownload] = useState({
    url: getResumeDownloadUrl(initialResume),
    filename: getResumeDownloadFilename(initialResume),
  })

  useEffect(() => {
    let active = true

    if (initialResume?.resumeFileUrl) {
      setResumeDownload({
        url: getResumeDownloadUrl(initialResume),
        filename: getResumeDownloadFilename(initialResume),
      })
      return () => {
        active = false
      }
    }

    apiClient
      .get('/api/resume')
      .then(({ data }) => {
        if (active) {
          setResumeDownload({
            url: getResumeDownloadUrl(data),
            filename: getResumeDownloadFilename(data),
          })
        }
      })
      .catch(() => {
        if (active) {
          setResumeDownload({
            url: FALLBACK_RESUME_URL,
            filename: FALLBACK_RESUME_FILENAME,
          })
        }
      })

    return () => {
      active = false
    }
  }, [initialResume?.resumeFileName, initialResume?.resumeFileUrl])

  return resumeDownload
}
