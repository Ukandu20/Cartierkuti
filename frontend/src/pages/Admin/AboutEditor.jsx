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

const DRAFT_KEY = 'adminAboutDraft'

const sections = [
  { id: 'introduction', label: 'Introduction', description: 'Headline, summary and highlights' },
  { id: 'metrics', label: 'Metrics', description: 'Profile proof points' },
  { id: 'experience', label: 'Experience', description: 'Roles and outcomes' },
  { id: 'education', label: 'Education', description: 'Schools and qualifications' },
  { id: 'certifications', label: 'Certifications', description: 'Professional credentials' },
  { id: 'skills', label: 'Skills', description: 'Capabilities and tools' },
  { id: 'resume', label: 'Résumé PDF', description: 'Downloadable document' },
]

const collectionDefaults = {
  metrics: { label: '', value: '', note: '' },
  experience: { role: '', company: '', location: '', period: '', bulletsText: '' },
  education: { school: '', degree: '', period: '', bulletsText: '' },
  certifications: { name: '', issuer: '', year: '' },
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

function ReorderableCard({ title, subtitle, index, count, onMove, onRemove, onDragStart, onDrop, children }) {
  return (
    <SurfaceCard
      as="details"
      open={index === 0}
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
    uploadResumeFile,
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
  const isDirty = Boolean(baseline) && (serializedForm !== baseline || Boolean(pendingFile))

  useEffect(() => {
    if (baseline && serializedForm !== baseline) sessionStorage.setItem(DRAFT_KEY, serializedForm)
  }, [baseline, serializedForm])

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
      [section]: [...current[section], { ...collectionDefaults[section], _editorId: `${section}-${Date.now()}` }],
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

  const persist = async () => {
    const validationErrors = validateResumeForm(resumeForm)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) {
      setActiveSection(sectionForError(Object.keys(validationErrors)[0]))
      setSaveState('error')
      return
    }

    setSaveState('saving')
    const contentSaved = await saveResume()
    if (!contentSaved) {
      setSaveState('error')
      return
    }

    let savedForm = resumeForm
    if (pendingFile) {
      const uploaded = await uploadResumeFile(pendingFile)
      if (!uploaded) {
        setSaveState('error')
        return
      }
      savedForm = { ...resumeForm, ...uploaded }
      setPendingFile(null)
    }

    setBaseline(JSON.stringify(savedForm))
    sessionStorage.removeItem(DRAFT_KEY)
    setAvailableDraft(null)
    setSavedAt(new Date())
    setSaveState('saved')
  }

  const requestExit = (action) => {
    if (!isDirty) {
      action()
      return
    }
    setPendingExit(() => action)
    setDiscardOpen(true)
  }

  const discardAndExit = () => {
    sessionStorage.removeItem(DRAFT_KEY)
    setDiscardOpen(false)
    pendingExit?.()
    setPendingExit(null)
  }

  if (!isAuth) {
    return <AdminLoginPanel username={username} setUsername={setUsername} password={password} setPassword={setPassword} isLoggingIn={isLoggingIn} handleLogin={handleLogin} mfaRequired={mfaRequired} mfaCode={mfaCode} setMfaCode={setMfaCode} handleMfaLogin={handleMfaLogin} cancelMfaLogin={cancelMfaLogin} />
  }

  const errorCountFor = (section) => Object.keys(errors).filter((key) => sectionForError(key) === section).length
  const summaryOverLimit = resumeForm.summary.length > 800

  const renderCollection = (section, titleFor, subtitleFor, fields) => (
    <Stack gap={4}>
      {resumeForm[section].map((item, index) => (
        <ReorderableCard
          key={item._editorId || `${section}-${index}`}
          title={titleFor(item, index)}
          subtitle={subtitleFor(item)}
          index={index}
          count={resumeForm[section].length}
          onMove={(offset) => moveEntry(section, index, offset)}
          onRemove={() => removeEntry(section, index)}
          onDragStart={() => setDraggedEntry({ section, index })}
          onDrop={() => dropEntry(section, index)}
        >
          {fields(item, index)}
        </ReorderableCard>
      ))}
      <Button alignSelf="flex-start" variant="outline" colorPalette="brand" onClick={() => addEntry(section)}><HiPlus /> Add {section === 'certifications' ? 'certification' : section.replace(/s$/, '')}</Button>
    </Stack>
  )

  return (
    <Box data-admin-shell maxW="1440px" mx="auto" p={{ base: 4, md: 8 }}>
      <SurfaceCard p={{ base: 4, md: 6 }} mb={6}>
        <Flex justify="space-between" align={{ base: 'flex-start', lg: 'center' }} gap={5} direction={{ base: 'column', lg: 'row' }}>
          <Box>
            <Button variant="ghost" size="sm" mb={2} onClick={() => requestExit(() => navigate('/admin'))}><HiArrowLeft /> Back to dashboard</Button>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">Content workspace</Text>
            <Heading fontFamily="body" fontSize={{ base: '2xl', md: '3xl' }}>Edit About page</Heading>
            <Text color="fg.muted" mt={1}>Manage the public narrative, experience, credentials, skills, and résumé download.</Text>
          </Box>
          <Flex gap={3} wrap="wrap" w={{ base: 'full', lg: 'auto' }}>
            <Button variant="outline" colorPalette="brand" onClick={() => setPreviewOpen(true)} flex={{ base: 1, sm: 'initial' }}><HiEye /> Preview public page</Button>
            <Button colorPalette="brand" onClick={persist} loading={saveState === 'saving'} disabled={resumeLoading} flex={{ base: 1, sm: 'initial' }}><HiCheck /> Save About page</Button>
          </Flex>
        </Flex>
      </SurfaceCard>

      {availableDraft ? (
        <SurfaceCard mb={5} p={4} bg="bg.warning" borderColor="border.warning" boxShadow="none">
          <Flex justify="space-between" align="center" gap={4} wrap="wrap">
            <Box><Text fontWeight="700">An unsaved About draft was found.</Text><Text color="fg.muted" fontSize="sm">Restore it or continue with the last saved version.</Text></Box>
            <Flex gap={2}><Button size="sm" variant="ghost" onClick={() => { sessionStorage.removeItem(DRAFT_KEY); setAvailableDraft(null) }}>Discard draft</Button><Button size="sm" colorPalette="brand" onClick={() => { setResumeForm(availableDraft); setAvailableDraft(null) }}>Restore draft</Button></Flex>
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
                <Button key={section.id} variant={activeSection === section.id ? 'subtle' : 'ghost'} colorPalette={activeSection === section.id ? 'brand' : 'gray'} justifyContent="space-between" h="auto" py={3} px={3} onClick={() => setActiveSection(section.id)}>
                  <Box textAlign="left"><Text fontWeight="700">{section.label}</Text><Text fontSize="xs" color="fg.muted">{section.description}</Text></Box>
                  {count ? <Badge colorPalette="red">{count}</Badge> : null}
                </Button>
              )
            })}
          </Stack>
        </SurfaceCard>

        <SurfaceCard data-about-editor-content p={0} minH="620px" minW={0}>
          <Box ref={editorContentRef} p={{ base: 4, md: 7 }}>
          {resumeLoading ? <Text color="fg.muted">Loading About content…</Text> : null}

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
              <Field.Root><Field.Label>Highlights</Field.Label><TagInput value={resumeForm.highlightsText} delimiter="\n" commitOnComma={false} onChange={(value) => updateField('highlightsText', value)} placeholder="Add a capability or outcome…" /><Field.HelperText>Press Enter to add each highlight.</Field.HelperText></Field.Root>
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
                  <Field.Root><Field.Label>Highlights</Field.Label><TagInput value={item.bulletsText} delimiter="\n" commitOnComma={false} onChange={(value) => updateCollection('experience', index, 'bulletsText', value)} placeholder="Add an outcome or responsibility…" /></Field.Root>
                </Stack>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'education' ? (
            <EditorSection eyebrow="04" title="Education" description="Keep qualifications concise and add only highlights that strengthen the portfolio narrative.">
              {renderCollection('education', (item, index) => item.degree || `Education ${index + 1}`, (item) => item.school || 'Add a school', (item, index) => (
                <Stack gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root invalid={Boolean(errors[`education.${index}.school`])}><Field.Label>School</Field.Label><Input value={item.school} onChange={(event) => updateCollection('education', index, 'school', event.target.value)} /><Field.ErrorText>{errors[`education.${index}.school`]}</Field.ErrorText></Field.Root>
                    <Field.Root invalid={Boolean(errors[`education.${index}.degree`])}><Field.Label>Degree or qualification</Field.Label><Input value={item.degree} onChange={(event) => updateCollection('education', index, 'degree', event.target.value)} /><Field.ErrorText>{errors[`education.${index}.degree`]}</Field.ErrorText></Field.Root>
                    <Field.Root><Field.Label>Period</Field.Label><Input value={item.period} onChange={(event) => updateCollection('education', index, 'period', event.target.value)} /></Field.Root>
                  </SimpleGrid>
                  <Field.Root><Field.Label>Highlights</Field.Label><TagInput value={item.bulletsText} delimiter="\n" commitOnComma={false} onChange={(value) => updateCollection('education', index, 'bulletsText', value)} placeholder="Add a relevant course or achievement…" /></Field.Root>
                </Stack>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'certifications' ? (
            <EditorSection eyebrow="05" title="Certifications" description="Add credentials that provide useful evidence of current expertise.">
              {renderCollection('certifications', (item, index) => item.name || `Certification ${index + 1}`, (item) => item.issuer || 'Add an issuer', (item, index) => (
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <Field.Root invalid={Boolean(errors[`certifications.${index}.name`])}><Field.Label>Certification name</Field.Label><Input value={item.name} onChange={(event) => updateCollection('certifications', index, 'name', event.target.value)} /><Field.ErrorText>{errors[`certifications.${index}.name`]}</Field.ErrorText></Field.Root>
                  <Field.Root invalid={Boolean(errors[`certifications.${index}.issuer`])}><Field.Label>Issuer</Field.Label><Input value={item.issuer} onChange={(event) => updateCollection('certifications', index, 'issuer', event.target.value)} /><Field.ErrorText>{errors[`certifications.${index}.issuer`]}</Field.ErrorText></Field.Root>
                  <Field.Root><Field.Label>Year</Field.Label><Input value={item.year} inputMode="numeric" onChange={(event) => updateCollection('certifications', index, 'year', event.target.value)} /></Field.Root>
                </SimpleGrid>
              ))}
            </EditorSection>
          ) : null}

          {!resumeLoading && activeSection === 'skills' ? (
            <EditorSection eyebrow="06" title="Skills and tools" description="Group capabilities in the same categories visitors see on the public About page.">
              <Field.Root><Field.Label>Analysis and modelling</Field.Label><TagInput value={resumeForm.skillsPrimaryText} delimiter="\n" commitOnComma={false} onChange={(value) => updateField('skillsPrimaryText', value)} placeholder="Add Python, SQL, Pandas…" /></Field.Root>
              <Field.Root><Field.Label>Visualisation and delivery</Field.Label><TagInput value={resumeForm.skillsSecondaryText} delimiter="\n" commitOnComma={false} onChange={(value) => updateField('skillsSecondaryText', value)} placeholder="Add Power BI, Tableau, React…" /></Field.Root>
              <Field.Root><Field.Label>Engineering and tools</Field.Label><TagInput value={resumeForm.skillsToolsText} delimiter="\n" commitOnComma={false} onChange={(value) => updateField('skillsToolsText', value)} placeholder="Add Git, Docker, Linux…" /></Field.Root>
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
                        if (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) {
                          setPdfError('Choose a PDF no larger than 10 MB.')
                          return
                        }
                        setPdfError('')
                        setPendingFile(file)
                      }}
                    />
                    <FileUpload.Trigger asChild><Button variant="outline" colorPalette="brand"><HiOutlineDocumentArrowUp /> {resumeForm.resumeFileName ? 'Replace PDF' : 'Choose PDF'}</Button></FileUpload.Trigger>
                  </FileUpload.Root>
                </Flex>
                <Text color={pdfError ? 'fg.error' : 'fg.muted'} fontSize="sm" mt={3}>{pdfError || 'PDF only · maximum file size 10 MB.'}</Text>
                {pendingFile ? <Button mt={4} size="sm" variant="ghost" colorPalette="red" onClick={() => setPendingFile(null)}>Remove staged file</Button> : null}
              </SurfaceCard>
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
            <Text color="fg.muted" fontSize="sm">A local draft is kept in this browser until the page is saved.</Text>
          </Box>
          <Flex gap={3} direction={{ base: 'column-reverse', sm: 'row' }}>
            <Button variant="ghost" onClick={() => requestExit(() => navigate('/admin'))}>Cancel</Button>
            <Button colorPalette="brand" onClick={persist} loading={saveState === 'saving'} disabled={!isDirty || resumeLoading}>Save About page</Button>
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
