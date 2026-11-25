import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, CloseButton, Dialog, Field, Flex, Heading, Input, Portal, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import apiClient from '@/utils/axiosConfig'
import { homeTextFields, normalizeHomeContent } from '@/utils/homeContent'
import { HomeContent } from '@/pages/Home/Home'
import AdminLoginPanel from './components/AdminLoginPanel'
import { useAdminAuth } from './hooks/useAdminAuth'

export default function HomeEditor() {
  const navigate = useNavigate()
  const [content, setContent] = useState(() => normalizeHomeContent())
  const [summary, setSummary] = useState('')
  const [baseline, setBaseline] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get('/api/resume/admin')
      const next = normalizeHomeContent(data?.homeContent)
      setContent(next)
      setSummary(data?.summary || '')
      setBaseline(JSON.stringify(next))
    } catch {
      setError('Could not load the Home page. Try again before editing.')
    } finally { setLoading(false) }
  }, [])
  const auth = useAdminAuth({ onAuthenticated: load })
  const dirty = Boolean(baseline) && JSON.stringify(content) !== baseline

  useEffect(() => {
    const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = async event => {
    event.preventDefault()
    if (saving || !baseline) return
    const next = Object.fromEntries(Object.entries(content).map(([key, value]) => [key, value.trim()]))
    if (Object.values(next).some(value => !value)) {
      setError('Complete every field before saving.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await apiClient.put('/api/resume/home-content', next)
      const saved = normalizeHomeContent(data)
      setContent(saved)
      setBaseline(JSON.stringify(saved))
      setMessage('Home page saved.')
    } catch (err) {
      auth.handleUnauthorized(err)
      setError('Could not save the Home page. Your edits are still here; please try again.')
    } finally { setSaving(false) }
  }

  if (!auth.isAuth) return <AdminLoginPanel {...auth} />

  return <Box data-admin-shell maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
    <SurfaceCard p={{ base: 4, md: 6 }} mb={6}>
      <Button variant="ghost" size="sm" mb={3} onClick={() => { if (!dirty || window.confirm('Discard your unsaved Home page changes?')) navigate('/admin') }}>Back to dashboard</Button>
      <Heading as="h1" fontFamily="body" fontSize="3xl">Edit Home page</Heading>
      <Text mt={2} color="fg.muted">Update the introduction, selected work, and capabilities. Projects are managed in Projects; the profile summary and working approaches come from About.</Text>
    </SurfaceCard>
    {error ? <Text role="alert" color="fg.error" mb={4}>{error}</Text> : null}
    {message ? <Text role="status" color="fg.success" mb={4}>{message}</Text> : null}
    {loading ? <Text>Loading Home page…</Text> : !baseline ? <Button onClick={load}>Try again</Button> :
      <SurfaceCard as="form" p={{ base: 4, md: 6 }} onSubmit={save}>
        <Stack gap={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
            {homeTextFields.filter(([key]) => !['ctaEyebrow', 'ctaTitle', 'ctaDescription'].includes(key)).map(([key, label, , max]) => <Field.Root key={key} required>
              <Field.Label htmlFor={`home-${key}`}>{label}</Field.Label>
              {max > 160 ? <Textarea id={`home-${key}`} value={content[key]} maxLength={max} rows={3} required disabled={saving} onChange={event => { setContent(current => ({ ...current, [key]: event.target.value })); setMessage('') }} /> :
                <Input id={`home-${key}`} value={content[key]} maxLength={max} required disabled={saving} onChange={event => { setContent(current => ({ ...current, [key]: event.target.value })); setMessage('') }} />}
            </Field.Root>)}
          </SimpleGrid>
          <Flex justify="flex-end" gap={3} wrap="wrap">
            <Dialog.Root size="cover" scrollBehavior="inside">
              <Dialog.Trigger asChild><Button type="button" variant="outline">Preview Home page</Button></Dialog.Trigger>
              <Portal><Dialog.Backdrop /><Dialog.Positioner p={{ base: 2, md: 6 }}>
                <Dialog.Content maxW="1400px" maxH="calc(100dvh - 1rem)" bg="bg.surface" overflow="hidden">
                  <Dialog.Header borderBottom="1px solid" borderColor="border.subtle"><Box><Dialog.Title>Home page preview</Dialog.Title><Text fontSize="sm" color="fg.muted">Unsaved text with current projects and About summary. Links are disabled in preview.</Text></Box><Dialog.CloseTrigger asChild><CloseButton aria-label="Close preview" position="absolute" top={3} right={3} /></Dialog.CloseTrigger></Dialog.Header>
                  <Dialog.Body bg="bg.subtle" p={{ base: 3, md: 6 }}><Box maxW="1100px" mx="auto" onClickCapture={event => { event.preventDefault(); event.stopPropagation() }}><HomeContent content={content} summary={summary} /></Box></Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner></Portal>
            </Dialog.Root>
            <Button type="submit" colorPalette="brand" loading={saving} disabled={!dirty || saving}>Save Home page</Button>
          </Flex>
        </Stack>
      </SurfaceCard>}
  </Box>
}
