import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, Field, Flex, Heading, Input, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import apiClient from '@/utils/axiosConfig'
import { homeTextFields, normalizeHomeContent } from '@/utils/homeContent'
import AdminLoginPanel from './components/AdminLoginPanel'
import { useAdminAuth } from './hooks/useAdminAuth'

export default function HomeEditor() {
  const navigate = useNavigate()
  const [content, setContent] = useState(() => normalizeHomeContent())
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
      <Text mt={2} color="fg.muted">Update the introduction, selected work, capabilities, and closing invitation. Projects are managed in Projects; the profile summary and working approaches come from About.</Text>
    </SurfaceCard>
    {error ? <Text role="alert" color="fg.error" mb={4}>{error}</Text> : null}
    {message ? <Text role="status" color="fg.success" mb={4}>{message}</Text> : null}
    {loading ? <Text>Loading Home page…</Text> : !baseline ? <Button onClick={load}>Try again</Button> :
      <SurfaceCard as="form" p={{ base: 4, md: 6 }} onSubmit={save}>
        <Stack gap={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
            {homeTextFields.map(([key, label, , max]) => <Field.Root key={key} required>
              <Field.Label htmlFor={`home-${key}`}>{label}</Field.Label>
              {max > 160 ? <Textarea id={`home-${key}`} value={content[key]} maxLength={max} rows={3} required disabled={saving} onChange={event => { setContent(current => ({ ...current, [key]: event.target.value })); setMessage('') }} /> :
                <Input id={`home-${key}`} value={content[key]} maxLength={max} required disabled={saving} onChange={event => { setContent(current => ({ ...current, [key]: event.target.value })); setMessage('') }} />}
            </Field.Root>)}
          </SimpleGrid>
          <Flex justify="flex-end"><Button type="submit" colorPalette="brand" loading={saving} disabled={!dirty || saving}>Save Home page</Button></Flex>
        </Stack>
      </SurfaceCard>}
  </Box>
}
