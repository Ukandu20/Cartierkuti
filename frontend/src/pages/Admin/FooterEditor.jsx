import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, CloseButton, Dialog, Field, Flex, Heading, Input, Portal, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FooterView } from '@/components/Footer/Footer'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import { normalizeFooterContent, suggestedSocialPlatforms } from '@/utils/footerContent'
import { invalidateResumeCache } from '@/services/resumeService'
import apiClient from '@/utils/axiosConfig'
import AdminLoginPanel from './components/AdminLoginPanel'
import { useAdminAuth } from './hooks/useAdminAuth'

const DRAFT_KEY = 'adminFooterDraft'
const fields = [
  ['eyebrow', 'Invitation label', 120, 'text', true],
  ['title', 'Invitation heading', 160, 'text', true],
  ['description', 'Invitation description', 400, 'text', true],
  ['email', 'Contact email', 254, 'email', true],
]

export default function FooterEditor() {
  const navigate = useNavigate()
  const [content, setContent] = useState(() => normalizeFooterContent())
  const [baseline, setBaseline] = useState('')
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await apiClient.get('/api/resume/admin')
      const next = normalizeFooterContent(data?.footerContent, data?.homeContent)
      setContent(next); setBaseline(JSON.stringify(next))
      try {
        const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null')
        if (saved && typeof saved === 'object' && JSON.stringify(normalizeFooterContent(saved)) !== JSON.stringify(next)) setDraft(normalizeFooterContent(saved))
      } catch { /* Ignore an unreadable draft. */ }
    } catch { setError('Could not load the footer. Try again before editing.') }
    finally { setLoading(false) }
  }, [])
  const auth = useAdminAuth({ onAuthenticated: load })
  const dirty = Boolean(baseline) && JSON.stringify(content) !== baseline
  useEffect(() => {
    if (!baseline || draft) return
    try { if (dirty) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(content)); else sessionStorage.removeItem(DRAFT_KEY) } catch { /* The form remains editable without storage. */ }
  }, [baseline, content, dirty, draft])
  useEffect(() => {
    const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = async event => {
    event.preventDefault()
    if (saving || !baseline) return
    const next = {
      ...Object.fromEntries(['eyebrow', 'title', 'description', 'email'].map(key => [key, content[key].trim()])),
      socialLinks: content.socialLinks.map(link => ({ label: link.label.trim(), url: link.url.trim() })),
    }
    if (!next.eyebrow || !next.title || !next.description || !next.email) { setError('Complete the invitation and contact email.'); return }
    for (const link of next.socialLinks) {
      if (!link.label) { setError('Add a name for every social link.'); return }
      try { if (!['https:', 'http:'].includes(new URL(link.url).protocol)) throw new Error('Invalid URL') }
      catch { setError('Social links must use a valid http or https URL.'); return }
    }
    setSaving(true); setError(''); setMessage('')
    try {
      const { data } = await apiClient.put('/api/resume/footer-content', next)
      const saved = normalizeFooterContent(data)
      setContent(saved); setBaseline(JSON.stringify(saved)); setDraft(null)
      invalidateResumeCache()
      window.dispatchEvent(new Event('footer-content-saved'))
      try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* Saving already succeeded. */ }
      setMessage('Footer saved.')
    } catch (err) {
      auth.handleUnauthorized(err)
      setError('Could not save the footer. Your edits are still here; please try again.')
    } finally { setSaving(false) }
  }

  if (!auth.isAuth) return <AdminLoginPanel {...auth} />
  return <Box data-admin-shell maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
    <SurfaceCard p={{ base: 4, md: 6 }} mb={6}>
      <Button variant="ghost" size="sm" mb={3} onClick={() => { if (!dirty || window.confirm('Leave with unsaved footer changes? A draft will be kept in this browser session.')) navigate('/admin') }}>Back to dashboard</Button>
      <Heading as="h1" fontFamily="body" fontSize="3xl">Edit footer</Heading>
      <Text mt={2} color="fg.muted">Update the site-wide invitation and contact details. The email also appears on the Contact page; changing it does not change where the contact form sends messages. Add or remove social links below.</Text>
    </SurfaceCard>
    {draft ? <SurfaceCard p={4} mb={4}><Text>An unsaved footer draft was found.</Text><Flex gap={3} mt={3}><Button onClick={() => { setContent(draft); setDraft(null) }}>Restore draft</Button><Button variant="outline" onClick={() => { setDraft(null); try { sessionStorage.removeItem(DRAFT_KEY) } catch {} }}>Discard draft</Button></Flex></SurfaceCard> : null}
    {error ? <Text role="alert" color="fg.error" mb={4}>{error}</Text> : null}
    {message ? <Text role="status" color="fg.success" mb={4}>{message}</Text> : null}
    {loading ? <Text>Loading footer…</Text> : !baseline ? <Button onClick={load}>Try again</Button> :
      <SurfaceCard as="form" p={{ base: 4, md: 6 }} onSubmit={save}>
        <Stack gap={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
            {fields.map(([key, label, max, type, required]) => <Field.Root key={key} required={required}>
              <Field.Label htmlFor={`footer-${key}`}>{label}</Field.Label>
              {key === 'description' ? <Textarea id={`footer-${key}`} value={content[key]} maxLength={max} rows={3} required disabled={saving} onChange={event => { setContent(current => ({ ...current, [key]: event.target.value })); setMessage('') }} /> :
                <Input id={`footer-${key}`} type={type} value={content[key]} maxLength={max} required={required} disabled={saving} onChange={event => { setContent(current => ({ ...current, [key]: event.target.value })); setMessage('') }} />}
              {!required ? <Field.HelperText>Leave empty to hide this link.</Field.HelperText> : null}
            </Field.Root>)}
          </SimpleGrid>
          <Box>
            <Heading as="h2" fontFamily="body" size="md" mb={2}>Social links</Heading>
            <Text color="fg.muted" mb={4}>Add up to 20 links. Choose a suggested platform for its logo, or type a custom name.</Text>
            <datalist id="suggested-social-platforms">{suggestedSocialPlatforms.map(platform => <option key={platform} value={platform} />)}</datalist>
            <Stack gap={4}>
              {content.socialLinks.map((link, index) => <SurfaceCard key={index} p={4} boxShadow="none">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Field.Root required><Field.Label htmlFor={`social-label-${index}`}>Social name {index + 1}</Field.Label><Input id={`social-label-${index}`} list="suggested-social-platforms" value={link.label} maxLength={60} required disabled={saving} onChange={event => { const value = event.target.value; setContent(current => ({ ...current, socialLinks: current.socialLinks.map((item, i) => i === index ? { ...item, label: value } : item) })); setMessage('') }} /><Field.HelperText>Choose a suggestion or enter another platform.</Field.HelperText></Field.Root>
                  <Field.Root required><Field.Label htmlFor={`social-url-${index}`}>Social URL {index + 1}</Field.Label><Input id={`social-url-${index}`} type="url" value={link.url} maxLength={2048} required disabled={saving} onChange={event => { const value = event.target.value; setContent(current => ({ ...current, socialLinks: current.socialLinks.map((item, i) => i === index ? { ...item, url: value } : item) })); setMessage('') }} /></Field.Root>
                </SimpleGrid>
                <Button type="button" size="sm" variant="outline" mt={4} disabled={saving} onClick={() => { setContent(current => ({ ...current, socialLinks: current.socialLinks.filter((_, i) => i !== index) })); setMessage('') }}>Remove {link.label.trim() || `social link ${index + 1}`}</Button>
              </SurfaceCard>)}
              <Button type="button" variant="outline" alignSelf="flex-start" disabled={saving || content.socialLinks.length >= 20} onClick={() => { setContent(current => ({ ...current, socialLinks: [...current.socialLinks, { label: '', url: '' }] })); setMessage('') }}>Add social link</Button>
            </Stack>
          </Box>
          <Flex justify="flex-end" gap={3} wrap="wrap">
            <Dialog.Root size="full"><Dialog.Trigger asChild><Button variant="outline">Preview footer</Button></Dialog.Trigger><Portal><Dialog.Backdrop /><Dialog.Positioner><Dialog.Content><Dialog.Header><Dialog.Title>Footer preview</Dialog.Title><Dialog.CloseTrigger asChild><CloseButton aria-label="Close preview" /></Dialog.CloseTrigger></Dialog.Header><Dialog.Body onClickCapture={event => { if (event.target.closest('a')) event.preventDefault() }}><FooterView content={content} resumeDownload={{ url: '/resume.pdf', filename: 'Preston-Ukandu-Resume.pdf' }} /></Dialog.Body></Dialog.Content></Dialog.Positioner></Portal></Dialog.Root>
            <Button type="submit" colorPalette="brand" loading={saving} disabled={!dirty || saving}>Save footer</Button>
          </Flex>
        </Stack>
      </SurfaceCard>}
  </Box>
}
