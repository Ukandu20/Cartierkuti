import AboutPageTextFields from './components/AboutPageTextFields'
import { educationDateFields } from '@/utils/educationDates'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  FileUpload,
  Flex,
  Grid,
  Heading,
  IconButton,
  Input,
  Portal,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'
import {
  HiArrowDown,
  HiArrowLeft,
  HiArrowUp,
  HiBars3,
  HiCheck,
  HiEye,
  HiOutlineDocumentArrowUp,
  HiPlus,
  HiTrash,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import AdminLoginPanel from './components/AdminLoginPanel'
import AboutPreview from './components/AboutPreview'
import DiscardChangesDialog from './components/DiscardChangesDialog'
import TagInput from './components/TagInput'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useAdminProjects } from './hooks/useAdminProjects'
import { validateResumeForm } from './adminDashboardUtils'
import { EducationFields, PersonalFields, GalleryFields } from './components/AboutExtraFields'
import apiClient from '@/utils/axiosConfig'

const DRAFT_KEY = 'adminAboutDraft'

const sections = [
  { id: 'pageContent', label: 'Page text', description: 'Headings, approach, labels and search details' },
  { id: 'introduction', label: 'Introduction', description: 'Headline, summary and highlights' },
  { id: 'metrics', label: 'Metrics', description: 'Profile proof points' },
  { id: 'experience', label: 'Experience', description: 'Roles and outcomes' },
  { id: 'education', label: 'Education', description: 'Schools and qualifications' },
  { id: 'certifications', label: 'Certifications', description: 'Professional credentials' },
  { id: 'skills', label: 'Skills', description: 'Capabilities and tools' },
  { id: 'personalItems', label: 'Outside my work', description: 'Languages, interests and learning' },
  { id: 'gallery', label: 'Experience gallery', description: 'Photos and personal stories' },
  { id: 'resume', label: 'Résumé PDF', description: 'Downloadable document' },
]

const collectionDefaults = {
  metrics: { label: '', value: '', note: '' },
  experience: { role: '', company: '', location: '', period: '', bulletsText: '' },
  education: { school: '', degree: '', program: '', level: '', status: '', period: '', startDate: '', finishDate: '', expectedFinishDate: '', bulletsText: '', visible: true },
  certifications: { name: '', issuer: '', year: '', credentialId: '', credentialUrl: '', showCredentialLink: true },
  personalItems: { title: '', category: 'Interest', status: '', level: '', notes: '', visible: true },
  gallery: { title: '', caption: '', date: '', location: '', imageUrl: '', imageAssetId: '', altText: '', visible: true, featured: false },
}

const sectionForError = (key) => {
  if (key === 'headline' || key === 'summary') return 'introduction'
  return key.split('.')[0]
}

function EditorSection({ eyebrow, title, description, children }) {
  return (
    <Stack gap={6}>
      <Box>
        <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">{eyebrow}</Text>
        <Heading as="h2" fontFamily="body" fontSize={{ base: '2xl', md: '3xl' }} mt={1}>{title}</Heading>
        <Text color="fg.muted" mt={2} maxW="720px">{description}</Text>
      </Box>
      {children}
    </Stack>
  )
}

function ReorderableCard({ title, subtitle, index, count, initiallyOpen, onMove, onRemove, onDragStart, onDrop, children }) {
  const [expanded, setExpanded] = useState(index === 0 || initiallyOpen)
  return (
    <SurfaceCard
      as="details"
      open={expanded}
      onToggle={event => setExpanded(event.currentTarget.open)}
      boxShadow="none"
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <Box as="summary" cursor="pointer" listStyle="none" p={4} _hover={{ bg: 'bg.subtle' }}>
        <Flex align="center" justify="space-between" gap={3}>
          <Flex align="center" gap={3} minW={0}>
            <HiBars3 aria-hidden="true" />
            <Box minW={0}>
              <Text fontWeight="700" truncate>{title}</Text>
              {subtitle ? <Text color="fg.muted" fontSize="sm" truncate>{subtitle}</Text> : null}
            </Box>
          </Flex>
          <Badge variant="subtle">{index + 1}</Badge>
        </Flex>
      </Box>
      <Stack gap={4} p={4} pt={1} borderTop="1px solid" borderColor="border.subtle">
        {children}
        <Flex justify="space-between" align="center" gap={3} wrap="wrap" pt={2}>
          <Flex gap={1}>
            <IconButton size="sm" variant="ghost" aria-label={`Move ${title} up`} disabled={index === 0} onClick={() => onMove(-1)}><HiArrowUp /></IconButton>
            <IconButton size="sm" variant="ghost" aria-label={`Move ${title} down`} disabled={index === count - 1} onClick={() => onMove(1)}><HiArrowDown /></IconButton>
          </Flex>
          <Button size="sm" variant="ghost" colorPalette="red" onClick={onRemove}><HiTrash /> Remove</Button>
        </Flex>
      </Stack>
    </SurfaceCard>
  )
}

export default function AboutEditor() {
  const navigate = useNavigate()
  const editorContentRef = useRef(null)
  const draftImages = useRef(new Set())
  const [imageUploads, setImageUploads] = useState(0)
  const [activeSection, setActiveSection] = useState('introduction')
  const [baseline, setBaseline] = useState('')
  const [availableDraft, setAvailableDraft] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [pdfError, setPdfError] = useState('')
  const [saveState, setSaveState] = useState('idle')
  const [savedAt, setSavedAt] = useState(null)
  const [errors, setErrors] = useState({})
  const [undoEntry, setUndoEntry] = useState(null)
  const [draggedEntry, setDraggedEntry] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [discardOpen, setDiscardOpen] = useState(false)
  const [pendingExit, setPendingExit] = useState(null)

  const {
    resumeForm,
    setResumeForm,
    resumeLoading,
    fetchResume,
    saveResume,
  } = useAdminProjects()

  const loadAbout = useCallback(async () => {
    const loaded = await fetchResume()
    const serialized = JSON.stringify(loaded)
    setBaseline(serialized)
    const storedDraft = sessionStorage.getItem(DRAFT_KEY)
    if (storedDraft && storedDraft !== serialized) {
      try { setAvailableDraft(JSON.parse(storedDraft)) } catch { sessionStorage.removeItem(DRAFT_KEY) }
    }
  }, [fetchResume])

  const {
    isAuth,
    username,
    setUsername,
    password,
    setPassword,
    isLoggingIn,
    mfaRequired,
    mfaCode,
    setMfaCode,
    handleLogin,
    handleMfaLogin,
    cancelMfaLogin,
  } = useAdminAuth({ onAuthenticated: loadAbout })

  const serializedForm = useMemo(() => JSON.stringify(resumeForm), [resumeForm])
  const isDirty = Boolean(baseline) && (serializedForm !== baseline || Boolean(pendingFile) || imageUploads > 0 || draftImages.current.size > 0)

  useEffect(() => {
    if (!baseline) return
    if (serializedForm !== baseline || draftImages.current.size > 0) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...resumeForm, _draftImageAssets: [...draftImages.current] }))
    } else {
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }, [baseline, serializedForm, imageUploads])

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!Object.keys(errors).length) return undefined
    const timeout = window.setTimeout(() => {
      editorContentRef.current?.querySelector('[data-invalid] input, [data-invalid] textarea')?.focus?.()
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [activeSection, errors])

  const updateField = (key, value) => {
    setResumeForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
    setSaveState('idle')
  }

  const updateCollection = (section, index, key, value) => {
    setResumeForm((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next[`${section}.${index}.${key}`]
      return next
    })
    setSaveState('idle')
  }

  const addEntry = (section) => {
    setResumeForm((current) => ({
      ...current,
      [section]: [...(current[section] || []), { ...collectionDefaults[section], _editorId: crypto.randomUUID(), _newEntry: true }],
    }))
    setUndoEntry(null)
  }

  const removeEntry = (section, index) => {
    const item = resumeForm[section][index]
    setResumeForm((current) => ({ ...current, [section]: current[section].filter((_, itemIndex) => itemIndex !== index) }))
    setUndoEntry({ section, index, item })
  }

  const undoRemove = () => {
    if (!undoEntry) return
    setResumeForm((current) => {
      const next = [...current[undoEntry.section]]
      next.splice(undoEntry.index, 0, undoEntry.item)
      return { ...current, [undoEntry.section]: next }
    })
    setUndoEntry(null)
  }

  const moveEntry = (section, index, offset) => {
    const destination = index + offset
    if (destination < 0 || destination >= resumeForm[section].length) return
    setResumeForm((current) => {
      const next = [...current[section]]
      const [item] = next.splice(index, 1)
      next.splice(destination, 0, item)
      return { ...current, [section]: next }
    })
  }

  const dropEntry = (section, destination) => {
    if (!draggedEntry || draggedEntry.section !== section || draggedEntry.index === destination) return
    setResumeForm((current) => {
      const next = [...current[section]]
      const [item] = next.splice(draggedEntry.index, 1)
      next.splice(destination, 0, item)
      return { ...current, [section]: next }
    })
    setDraggedEntry(null)
  }

  const cleanupImages = async (ids) => {
    await Promise.all([...new Set(ids)].filter(id => id?.startsWith('cartierkuti/about-gallery/')).map(imageAssetId =>
      apiClient.delete('/api/resume/gallery-image', { data: { imageAssetId } }).catch(() => {}),
    ))
  }

  const uploadedImage = (editorId, data) => {
    draftImages.current.add(data.imageAssetId)
    setResumeForm(current => ({ ...current, gallery: current.gallery.map(item => item._editorId === editorId
      ? { ...item, ...data, _newUpload: true } : item) }))
    setErrors(current => {
      const next = { ...current }
      Object.keys(next).filter(key => key.startsWith('gallery.') && key.endsWith('.imageUrl')).forEach(key => delete next[key])
      return next
    })
  }

  const persist = async () => {
    if (imageUploads > 0) return
    const validationErrors = validateResumeForm(resumeForm)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) {
      setActiveSection(sectionForError(Object.keys(validationErrors)[0]))
      setSaveState('error')
      return
    }

    setSaveState('saving')
    const savedForm = await saveResume(pendingFile)
    if (!savedForm) {
      setSaveState('error')
      return
    }

    setPendingFile(null)
    const usedImages = new Set(savedForm.gallery.map(item => item.imageAssetId))
    const previousImages = JSON.parse(baseline || '{}').gallery || []
    void cleanupImages([...draftImages.current, ...previousImages.map(item => item.imageAssetId)].filter(id => !usedImages.has(id)))
    draftImages.current.clear()

    setBaseline(JSON.stringify(savedForm))
    sessionStorage.removeItem(DRAFT_KEY)
    setAvailableDraft(null)
    setSavedAt(new Date())
    setSaveState('saved')
  }

  const requestExit = (action) => {
    if (imageUploads > 0) return
    if (!isDirty) {
      action()
      return
    }
    setPendingExit(() => action)
    setDiscardOpen(true)
  }

  const discardAndExit = () => {
    void cleanupImages([...draftImages.current, ...(resumeForm.gallery || []).filter(item => item._newUpload).map(item => item.imageAssetId)])
    sessionStorage.removeItem(DRAFT_KEY)
    setDiscardOpen(false)
    pendingExit?.()
    setPendingExit(null)
  }

  const discardDraft = () => {
    void cleanupImages([...(availableDraft._draftImageAssets || []), ...(availableDraft.gallery || []).filter(item => item._newUpload).map(item => item.imageAssetId)])
    sessionStorage.removeItem(DRAFT_KEY)
    setAvailableDraft(null)
  }

  const restoreDraft = () => {
    const restored = { ...resumeForm, ...availableDraft,
      personalItems: availableDraft.personalItems || [], gallery: availableDraft.gallery || [],
      education: (availableDraft.education || []).map(item => ({ ...item, ...educationDateFields(item), program: item.program || item.degree || '' })),
    }
    restored.gallery.filter(item => item._newUpload).forEach(item => draftImages.current.add(item.imageAssetId))
    ;(availableDraft._draftImageAssets || []).forEach(id => draftImages.current.add(id))
    setResumeForm(restored)
    setAvailableDraft(null)
  }

  const collectionErrors = (section, index) => Object.fromEntries(
    Object.entries(errors).filter(([key]) => key.startsWith(`${section}.${index}.`))
      .map(([key, value]) => [key.split('.').at(-1), value]),
  )

  if (!isAuth) {
    return <AdminLoginPanel username={username} setUsername={setUsername} password={password} setPassword={setPassword} isLoggingIn={isLoggingIn} handleLogin={handleLogin} mfaRequired={mfaRequired} mfaCode={mfaCode} setMfaCode={setMfaCode} handleMfaLogin={handleMfaLogin} cancelMfaLogin={cancelMfaLogin} />
  }

  const errorCountFor = (section) => Object.keys(errors).filter((key) => sectionForError(key) === section).length
  const summaryOverLimit = resumeForm.summary.length > 800

  const renderCollection = (section, titleFor, subtitleFor, fields) => (
    <Stack gap={4}>
      {(resumeForm[section] || []).map((item, index) => (
        <ReorderableCard
          key={item._editorId || `${section}-${index}`}
          title={titleFor(item, index)}
          subtitle={subtitleFor(item)}
          index={index}
          initiallyOpen={item._newEntry}
          count={resumeForm[section].length}
          onMove={(offset) => moveEntry(section, index, offset)}
          onRemove={() => removeEntry(section, index)}
          onDragStart={() => setDraggedEntry({ section, index })}
          onDrop={() => dropEntry(section, index)}
        >
          {fields(item, index)}
        </ReorderableCard>
      ))}
      <Button alignSelf="flex-start" variant="outline" colorPalette="brand" disabled={(section === 'personalItems' && resumeForm.personalItems?.length >= 20) || (section === 'gallery' && resumeForm.gallery?.length >= 30)} onClick={() => addEntry(section)}><HiPlus /> Add {section === 'personalItems' ? 'personal card' : section === 'gallery' ? 'gallery entry' : section === 'certifications' ? 'certification' : section.replace(/s$/, '')}</Button>
    </Stack>
  )

  return (
    <Box data-admin-shell maxW="1440px" mx="auto" p={{ base: 4, md: 8 }}>
      <SurfaceCard p={{ base: 4, md: 6 }} mb={6}>
        <Flex justify="space-between" align={{ base: 'flex-start', lg: 'center' }} gap={5} direction={{ base: 'column', lg: 'row' }}>
          <Box>
            <Button variant="ghost" size="sm" mb={2} disabled={imageUploads > 0} onClick={() => requestExit(() => navigate('/admin'))}><HiArrowLeft /> Back to dashboard</Button>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">Content workspace</Text>
            <Heading fontFamily="body" fontSize={{ base: '2xl', md: '3xl' }}>Edit About page</Heading>
            <Text color="fg.muted" mt={1}>Manage the public narrative, experience, credentials, skills, and résumé download.</Text>
          </Box>
          <Flex gap={3} wrap="wrap" w={{ base: 'full', lg: 'auto' }}>
            <Button variant="outline" colorPalette="brand" onClick={() => setPreviewOpen(true)} flex={{ base: 1, sm: 'initial' }}><HiEye /> Preview public page</Button>
            <Button colorPalette="brand" onClick={persist} loading={saveState === 'saving'} disabled={resumeLoading || imageUploads > 0} flex={{ base: 1, sm: 'initial' }}><HiCheck /> Save About page</Button>
          </Flex>
        </Flex>
      </SurfaceCard>

      {availableDraft ? (
        <SurfaceCard mb={5} p={4} bg="bg.warning" borderColor="border.warning" boxShadow="none">
          <Flex justify="space-between" align="center" gap={4} wrap="wrap">
            <Box><Text fontWeight="700">An unsaved About draft was found.</Text><Text color="fg.muted" fontSize="sm">Restore it or continue with the last saved version.</Text></Box>
            <Flex gap={2}><Button size="sm" variant="ghost" onClick={discardDraft}>Discard draft</Button><Button size="sm" colorPalette="brand" onClick={restoreDraft}>Restore draft</Button></Flex>
          </Flex>
        </SurfaceCard>
      ) : null}

      {Object.keys(errors).length ? (
        <SurfaceCard role="alert" mb={5} p={4} bg="bg.error" borderColor="border.error" boxShadow="none">
          <Text fontWeight="700" color="fg.error">Review {Object.keys(errors).length} issue{Object.keys(errors).length === 1 ? '' : 's'} before saving.</Text>
          <Text color="fg.muted" fontSize="sm" mt={1}>{Object.values(errors).join(' ')}</Text>
        </SurfaceCard>
      ) : null}

      {undoEntry ? (
        <SurfaceCard mb={5} p={4} boxShadow="none"><Flex justify="space-between" align="center" gap={4}><Text>{undoEntry.section.replace(/^./, (letter) => letter.toUpperCase())} entry removed.</Text><Button size="sm" variant="outline" onClick={undoRemove}>Undo</Button></Flex></SurfaceCard>
      ) : null}

      <Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: '260px minmax(0, 1fr)' }} gap={6} alignItems="start">
        <SurfaceCard as="nav" aria-label="About editor sections" p={3} position={{ lg: 'sticky' }} top={{ lg: 4 }} boxShadow="none">
          <Stack gap={1}>
            {sections.map((section) => {
              const count = errorCountFor(section.id)
              return (
                <Button key={section.id} variant={activeSection === section.id ? 'subtle' : 'ghost'} colorPalette={activeSection === section.id ? 'brand' : 'gray'} justifyContent="space-between" h="auto" minW={0} whiteSpace="normal" gap={3} py={3} px={3} onClick={() => setActiveSection(section.id)}>
                  <Box textAlign="left" minW={0} flex={1} overflowWrap="anywhere"><Text fontWeight="700">{section.label}</Text><Text fontSize="xs" color="fg.muted">{section.description}</Text></Box>
                  {count ? <Badge colorPalette="red" flexShrink={0}>{count}</Badge> : null}
                </Button>
              )
            })}
          </Stack>
        </SurfaceCard>

        <SurfaceCard data-about-editor-content p={0} minH="620px" minW={0}>
          <Box ref={editorContentRef} p={{ base: 4, md: 7 }}>
          {resumeLoading ? <Text color="fg.muted">Loading About content…</Text> : null}

          {!resumeLoading && activeSection === 'pageContent' ? (
            <EditorSection title="Page text" description="Edit the headings, section introductions, working approach, button labels, and search details. Clear optional text to remove it from the public page.">
              <AboutPageTextFields value={resumeForm.pageContent} onChange={value => updateField('pageContent', value)} errors={errors} />
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'introduction' ? (
            <EditorSection eyebrow="01" title="Introduction" description="Set the first message visitors see and the analytical strengths you want to reinforce.">
              <Field.Root required invalid={Boolean(errors.headline)}>
                <Flex w="full" align="baseline" gap={4}>
                  <Field.Label>Headline</Field.Label>
                  <Text ml="auto" flexShrink={0} fontSize="xs" color="fg.muted">{resumeForm.headline.length}/120</Text>
                </Flex>
                <Input value={resumeForm.headline} maxLength={120} onChange={(event) => updateField('headline', event.target.value)} placeholder="Data science and analytics practitioner" />
                <Field.ErrorText>{errors.headline}</Field.ErrorText>
              </Field.Root>
              <Field.Root required invalid={Boolean(errors.summary) || summaryOverLimit}>
                <Flex w="full" align="baseline" gap={4}>
                  <Field.Label>Summary</Field.Label>
                  <Text ml="auto" flexShrink={0} fontSize="xs" fontWeight={summaryOverLimit ? '700' : 'normal'} color={summaryOverLimit ? 'fg.error' : 'fg.muted'}>{resumeForm.summary.length}/800</Text>
                </Flex>
                <Textarea value={resumeForm.summary} maxLength={800} minH="180px" onChange={(event) => updateField('summary', event.target.value)} placeholder="Explain what you do, who it helps, and how you approach the work." />
                <Field.HelperText color={summaryOverLimit ? 'fg.error' : undefined}>
                  {summaryOverLimit
                    ? `Shorten the summary by ${resumeForm.summary.length - 800} characters before saving.`
                    : 'Use a blank line between paragraphs. Aim for 2–3 concise paragraphs covering your focus, approach, and impact.'}
                </Field.HelperText>
                <Field.ErrorText>{errors.summary}</Field.ErrorText>
              </Field.Root>
              <Field.Root><Field.Label>Highlights</Field.Label><TagInput value={resumeForm.highlightsText} delimiter={'\n'} commitOnComma={false} onChange={(value) => updateField('highlightsText', value)} placeholder="Add a capability or outcome…" /><Field.HelperText>Press Enter to add each highlight.</Field.HelperText></Field.Root>
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'metrics' ? (
            <EditorSection eyebrow="02" title="Profile metrics" description="Use concise proof points that remain meaningful without additional context.">
              {renderCollection('metrics', (item, index) => item.label || `Metric ${index + 1}`, (item) => item.value || 'Add a value', (item, index) => (
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <Field.Root invalid={Boolean(errors[`metrics.${index}.label`])}><Field.Label>Metric label</Field.Label><Input value={item.label} onChange={(event) => updateCollection('metrics', index, 'label', event.target.value)} /><Field.ErrorText>{errors[`metrics.${index}.label`]}</Field.ErrorText></Field.Root>
                  <Field.Root invalid={Boolean(errors[`metrics.${index}.value`])}><Field.Label>Displayed value</Field.Label><Input value={item.value} onChange={(event) => updateCollection('metrics', index, 'value', event.target.value)} /><Field.ErrorText>{errors[`metrics.${index}.value`]}</Field.ErrorText></Field.Root>
                  <Field.Root><Field.Label>Supporting note</Field.Label><Input value={item.note} onChange={(event) => updateCollection('metrics', index, 'note', event.target.value)} /></Field.Root>
                </SimpleGrid>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'experience' ? (
            <EditorSection eyebrow="03" title="Experience" description="Describe roles through outcomes, decisions, and evidence—not task lists.">
              {renderCollection('experience', (item, index) => item.role || `Experience ${index + 1}`, (item) => item.company || 'Add a company', (item, index) => (
                <Stack gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root invalid={Boolean(errors[`experience.${index}.role`])}><Field.Label>Role</Field.Label><Input value={item.role} onChange={(event) => updateCollection('experience', index, 'role', event.target.value)} /><Field.ErrorText>{errors[`experience.${index}.role`]}</Field.ErrorText></Field.Root>
                    <Field.Root invalid={Boolean(errors[`experience.${index}.company`])}><Field.Label>Company</Field.Label><Input value={item.company} onChange={(event) => updateCollection('experience', index, 'company', event.target.value)} /><Field.ErrorText>{errors[`experience.${index}.company`]}</Field.ErrorText></Field.Root>
                    <Field.Root><Field.Label>Location</Field.Label><Input value={item.location} onChange={(event) => updateCollection('experience', index, 'location', event.target.value)} /></Field.Root>
                    <Field.Root><Field.Label>Period</Field.Label><Input value={item.period} onChange={(event) => updateCollection('experience', index, 'period', event.target.value)} placeholder="2022 – Present" /></Field.Root>
                  </SimpleGrid>
                  <Field.Root><Field.Label>Highlights</Field.Label><TagInput value={item.bulletsText} delimiter={'\n'} commitOnComma={false} onChange={(value) => updateCollection('experience', index, 'bulletsText', value)} placeholder="Add an outcome or responsibility…" /></Field.Root>
                </Stack>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'education' ? (
            <EditorSection eyebrow="04" title="Education" description="Keep qualifications concise and add only highlights that strengthen the portfolio narrative.">
              {renderCollection('education', (item, index) => item.program || item.degree || `Education ${index + 1}`, (item) => [item.level, item.school, item.visible === false ? 'Hidden' : ''].filter(Boolean).join(' · '), (item, index) => (
                <Stack gap={4}>
                  <EducationFields item={item} onChange={(key, value) => updateCollection('education', index, key, value)} errors={collectionErrors('education', index)} />
                  <Field.Root><Field.Label>Highlights</Field.Label><TagInput value={item.bulletsText} delimiter={'\n'} commitOnComma={false} onChange={(value) => updateCollection('education', index, 'bulletsText', value)} placeholder="Add a relevant course or achievement…" /></Field.Root>
                </Stack>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'certifications' ? (
            <EditorSection eyebrow="05" title="Certifications" description="Add credentials that provide useful evidence of current expertise.">
              {renderCollection('certifications', (item, index) => item.name || `Certification ${index + 1}`, (item) => item.issuer || 'Add an issuer', (item, index) => (
                <Stack gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Field.Root invalid={Boolean(errors[`certifications.${index}.name`])}><Field.Label>Certification name</Field.Label><Input value={item.name} onChange={(event) => updateCollection('certifications', index, 'name', event.target.value)} /><Field.ErrorText>{errors[`certifications.${index}.name`]}</Field.ErrorText></Field.Root>
                    <Field.Root invalid={Boolean(errors[`certifications.${index}.issuer`])}><Field.Label>Issuer</Field.Label><Input value={item.issuer} onChange={(event) => updateCollection('certifications', index, 'issuer', event.target.value)} /><Field.ErrorText>{errors[`certifications.${index}.issuer`]}</Field.ErrorText></Field.Root>
                    <Field.Root><Field.Label>Year</Field.Label><Input value={item.year} inputMode="numeric" onChange={(event) => updateCollection('certifications', index, 'year', event.target.value)} /></Field.Root>
                  </SimpleGrid>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root><Field.Label>Credential ID</Field.Label><Input value={item.credentialId || ''} onChange={(event) => updateCollection('certifications', index, 'credentialId', event.target.value)} placeholder="ABC-123-XYZ" /></Field.Root>
                    <Field.Root invalid={Boolean(errors[`certifications.${index}.credentialUrl`])}>
                      <Field.Label>Verification URL</Field.Label>
                      <Input type="url" value={item.credentialUrl || ''} onChange={(event) => updateCollection('certifications', index, 'credentialUrl', event.target.value)} placeholder="https://issuer.example/verify/…" />
                      <Field.ErrorText>{errors[`certifications.${index}.credentialUrl`]}</Field.ErrorText>
                    </Field.Root>
                  </SimpleGrid>
                  <Flex justify="space-between" align="center" gap={4} p={4} bg="bg.subtle" borderRadius="md">
                    <Box>
                      <Text fontWeight="700">Show public credential link</Text>
                      <Text color="fg.muted" fontSize="sm">Display “View credential” on the public About page.</Text>
                    </Box>
                    <Switch.Root checked={Boolean(item.showCredentialLink)} onCheckedChange={(details) => updateCollection('certifications', index, 'showCredentialLink', Boolean(details.checked))}>
                      <Switch.HiddenInput aria-label={`Show public link for ${item.name || `certification ${index + 1}`}`} />
                      <Switch.Control><Switch.Thumb /></Switch.Control>
                    </Switch.Root>
                  </Flex>
                </Stack>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'skills' ? (
            <EditorSection eyebrow="06" title="Skills and tools" description="Group capabilities in the same categories visitors see on the public About page.">
              <Field.Root><Field.Label>Analysis and modelling</Field.Label><TagInput value={resumeForm.skillsPrimaryText} delimiter={'\n'} onChange={(value) => updateField('skillsPrimaryText', value)} placeholder="Add Python, SQL, Pandas…" /></Field.Root>
              <Field.Root><Field.Label>Visualisation and delivery</Field.Label><TagInput value={resumeForm.skillsSecondaryText} delimiter={'\n'} onChange={(value) => updateField('skillsSecondaryText', value)} placeholder="Add Power BI, Tableau, React…" /></Field.Root>
              <Field.Root><Field.Label>Engineering and tools</Field.Label><TagInput value={resumeForm.skillsToolsText} delimiter={'\n'} onChange={(value) => updateField('skillsToolsText', value)} placeholder="Add Git, Docker, Linux…" /></Field.Root>
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'resume' ? (
            <EditorSection eyebrow="07" title="Résumé PDF" description="Manage the downloadable document independently while saving it with the About page as one deliberate action.">
              <SurfaceCard p={5} boxShadow="none" bg="bg.subtle">
                <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={5}>
                  <Box>
                    <Text fontWeight="700">{pendingFile?.name || resumeForm.resumeFileName || 'No uploaded résumé PDF'}</Text>
                    <Text color="fg.muted" fontSize="sm" mt={1}>
                      {pendingFile ? 'Staged locally. It will upload only after Save About page is selected.' : resumeForm.resumeFileUpdatedAt ? `Last replaced ${new Date(resumeForm.resumeFileUpdatedAt).toLocaleDateString()}.` : 'The public site uses /resume.pdf as its fallback.'}
                    </Text>
                  </Box>
                  <FileUpload.Root accept="application/pdf" maxFiles={1}>
                    <FileUpload.HiddenInput
                      aria-label="Choose résumé PDF"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ''
                        if (!file) return
                        if (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024) {
                          setPdfError('Choose a PDF no larger than 5 MB.')
                          return
                        }
                        setPdfError('')
                        setPendingFile(file)
                      }}
                    />
                    <FileUpload.Trigger asChild><Button variant="outline" colorPalette="brand"><HiOutlineDocumentArrowUp /> {resumeForm.resumeFileName ? 'Replace PDF' : 'Choose PDF'}</Button></FileUpload.Trigger>
                  </FileUpload.Root>
                </Flex>
                <Text color={pdfError ? 'fg.error' : 'fg.muted'} fontSize="sm" mt={3}>{pdfError || 'PDF only · maximum file size 5 MB.'}</Text>
                {pendingFile ? <Button mt={4} size="sm" variant="ghost" colorPalette="red" onClick={() => setPendingFile(null)}>Remove staged file</Button> : null}
              </SurfaceCard>
            </EditorSection>
          ) : null}
          {!resumeLoading && activeSection === 'personalItems' ? (
            <EditorSection eyebrow="07" title="Outside my work" description="Share languages, interests, volunteering, or something you are learning. Leave this section empty to keep it off the public page.">
              {renderCollection('personalItems', (item, index) => item.title || `Personal card ${index + 1}`, item => [item.category, item.visible === false ? 'Hidden' : item.status].filter(Boolean).join(' · '), (item, index) => (
                <PersonalFields item={item} onChange={(key, value) => updateCollection('personalItems', index, key, value)} errors={collectionErrors('personalItems', index)} />
              ))}
            </EditorSection>
          ) : null}
          {!resumeLoading && activeSection === 'gallery' ? (
            <EditorSection eyebrow="08" title="Experience gallery" description="Add photos and short stories from your experiences. Featured photos lead the gallery; other photos remain available through View more.">
              {renderCollection('gallery', (item, index) => item.title || `Gallery entry ${index + 1}`, item => [item.location || item.date, item.visible === false ? 'Hidden' : item.featured ? 'Featured' : ''].filter(Boolean).join(' · '), (item, index) => (
                <GalleryFields item={item} onChange={(key, value) => updateCollection('gallery', index, key, value)} onImageUploaded={data => uploadedImage(item._editorId, data)} onUploadingChange={busy => setImageUploads(count => Math.max(0, count + (busy ? 1 : -1)))} errors={collectionErrors('gallery', index)} />
              ))}
            </EditorSection>
          ) : null}
          </Box>
        </SurfaceCard>
      </Grid>

      <SurfaceCard mt={6} p={4} boxShadow="xl">
        <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box>
            <Text fontWeight="700">
              {saveState === 'saving' ? 'Saving changes…' : saveState === 'error' ? 'Changes need attention' : isDirty ? 'Unsaved changes' : savedAt ? `Saved at ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'All changes saved'}
            </Text>
            <Text color="fg.muted" fontSize="sm">{imageUploads > 0 ? 'Wait for photo uploads to finish before saving or leaving.' : 'A local draft is kept in this browser until the page is saved.'}</Text>
          </Box>
          <Flex gap={3} direction={{ base: 'column-reverse', sm: 'row' }}>
            <Button variant="ghost" disabled={imageUploads > 0} onClick={() => requestExit(() => navigate('/admin'))}>Cancel</Button>
            <Button colorPalette="brand" onClick={persist} loading={saveState === 'saving'} disabled={!isDirty || resumeLoading || imageUploads > 0}>Save About page</Button>
          </Flex>
        </Flex>
      </SurfaceCard>

      <Dialog.Root open={previewOpen} onOpenChange={(details) => setPreviewOpen(details.open)} size="cover" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={{ base: 2, md: 6 }}>
            <Dialog.Content maxW="1400px" maxH="calc(100dvh - 1rem)" bg="bg.surface" borderRadius="lg" overflow="hidden">
              <Dialog.Header borderBottom="1px solid" borderColor="border.subtle">
                <Dialog.Title>About page preview</Dialog.Title>
                <Flex ml="auto" mr={12} gap={2}><Button size="sm" variant={previewMode === 'desktop' ? 'solid' : 'outline'} colorPalette="brand" onClick={() => setPreviewMode('desktop')}>Desktop</Button><Button size="sm" variant={previewMode === 'mobile' ? 'solid' : 'outline'} colorPalette="brand" onClick={() => setPreviewMode('mobile')}>Mobile</Button></Flex>
                <Dialog.CloseTrigger asChild><CloseButton position="absolute" top={3} right={3} /></Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body bg="bg.subtle" p={{ base: 3, md: 6 }}>
                <Box maxW={previewMode === 'mobile' ? '390px' : '1100px'} mx="auto" transition="max-width 0.2s ease"><AboutPreview form={resumeForm} /></Box>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <DiscardChangesDialog
        open={discardOpen}
        onOpenChange={(details) => setDiscardOpen(details.open)}
        onKeepEditing={() => setDiscardOpen(false)}
        title="Discard About page changes?"
        description="Your unsaved content and staged PDF will be lost. The last saved public About page will remain unchanged."
        onDiscard={discardAndExit}
      />
    </Box>
  )
}
