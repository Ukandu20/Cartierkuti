import { useEffect, useState } from 'react'
import { getPublicResume } from '@/services/resumeService'
import { normalizeFooterContent } from '@/utils/footerContent'

export function useFooterContent() {
  const [content, setContent] = useState(() => normalizeFooterContent())
  useEffect(() => {
    let active = true
    const load = () => getPublicResume().then(data => { if (active) setContent(normalizeFooterContent(data?.footerContent, data?.homeContent)) }).catch(() => {})
    load()
    window.addEventListener('footer-content-saved', load)
    return () => { active = false; window.removeEventListener('footer-content-saved', load) }
  }, [])
  return content
}
