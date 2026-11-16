import React from 'react'
import { Box } from '@chakra-ui/react'
import { AboutContent, normalizeResume } from '@/pages/About/About'
import { buildResumePayload } from '../adminDashboardUtils'

export default function AboutPreview({ form }) {
  const resume = normalizeResume({ ...buildResumePayload(form), resumeFileUrl: form.resumeFileUrl, resumeFileName: form.resumeFileName })
  return <Box border="1px solid" borderColor="border.subtle" borderRadius="lg" overflow="hidden">
    <AboutContent resume={resume} preview />
  </Box>
}
