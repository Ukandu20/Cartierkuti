import { useEffect, useState } from 'react'
import { getPublicResume } from '@/services/resumeService'
import { normalizeAboutContent } from '@/utils/aboutContent'

export function useWorkingPrinciples() {
  const [principles, setPrinciples] = useState(() => normalizeAboutContent().principles)
  useEffect(() => {
    let active = true
    getPublicResume().then(data => {
      if (active) setPrinciples(normalizeAboutContent(data?.pageContent).principles)
    }).catch(() => {})
    return () => { active = false }
  }, [])
  return Array.isArray(principles) ? principles : []
}
