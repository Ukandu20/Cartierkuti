import { useEffect, useState } from 'react'
import { apiUrl } from '@/utils/apiConfig'
import { getPublicResume } from '@/services/resumeService'

export const FALLBACK_RESUME_URL = '/resume.pdf'
export const FALLBACK_RESUME_FILENAME = 'Preston-Ukandu-Resume.pdf'

export function getResumeDownloadUrl(resume) {
  return resume?.resumeFileUrl
    ? apiUrl('/api/resume/file/download')
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

    getPublicResume()
      .then((data) => {
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
