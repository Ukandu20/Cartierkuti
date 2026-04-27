import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  HiDocumentText,
  HiEye,
  HiFolderOpen,
  HiPencil,
  HiPlay,
  HiPlus,
  HiStar,
  HiTrash,
} from 'react-icons/hi'
import PaginationControls from '@/components/pagination/pagination'
import { Toaster, toaster } from '@/components/ui/toaster'
import apiClient from '@/utils/axiosConfig'
import { niceDate } from '@/utils/formatDate'
import { normalizeProject, normalizeProjects } from '@/utils/projectNormalizer'
import ActivityCard from './activity'
import {
  buildProjectPayload,
  buildResumePayload,
  emptyProjectForm,
  emptyResumeForm,
  getAvgStars,
  getFilteredProjects,
  getProjectAnalytics,
  getProjectCounts,
  getProjectFilterLabel,
  isInProgress,
  normalizeResumeForm,
  projectToFormData,
} from './adminDashboardUtils'
import ActivityAnalyticsDialog from './components/ActivityAnalyticsDialog'
import AdminLoginPanel from './components/AdminLoginPanel'
import DashboardStats, { ActionCard } from './components/DashboardStats'
import DeleteProjectDialog from './components/DeleteProjectDialog'
import ProjectAnalyticsDialog from './components/ProjectAnalyticsDialog'
import ProjectEditorDialog from './components/ProjectEditorDialog'
import ProjectTableSection from './components/ProjectTableSection'
import ResumeEditorDialog from './components/ResumeEditorDialog'

const ACTIVITY_PAGE_SIZE = 5
const PROJECT_PAGE_SIZE = 8
const ADMIN_SESSION_MS = 30 * 60_000

const reportAdminError = (error) => {
  if (import.meta.env.DEV) {
    console.error(error)
  }
}

export default function AdminDashboard() {
  const accent = 'brand.600'
  const bg = 'bg.subtle'
  const dialogBg = 'bg.surface'
  const dialogBorder = 'border.subtle'
  const closeHoverBg = 'bg.subtle'

  const [isAuth, setIsAuth] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activities, setActivities] = useState([])
  const [totalActivities, setTotalActivities] = useState(0)
  const [filterType, setFilterType] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [page, setPage] = useState(1)

  const [projectPage, setProjectPage] = useState(1)
  const [projectFilter, setProjectFilter] = useState('all')
  const [editMode, setEditMode] = useState(false)
  const [current, setCurrent] = useState(null)
  const [formData, setFormData] = useState(emptyProjectForm)

  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isQuickEditOpen, setQuickEditOpen] = useState(false)
  const [isQuickDeleteOpen, setQuickDeleteOpen] = useState(false)
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false)
  const [isProjectAnalyticsOpen, setProjectAnalyticsOpen] = useState(false)
  const [isResumeOpen, setResumeOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [projectAnalyticsTarget, setProjectAnalyticsTarget] = useState(null)
  const [projectAnalyticsActivities, setProjectAnalyticsActivities] = useState([])
  const [projectAnalyticsLoading, setProjectAnalyticsLoading] = useState(false)
  const [resumeForm, setResumeForm] = useState(emptyResumeForm)
  const [resumeLoading, setResumeLoading] = useState(false)

  const cancelRef = useRef()
  const listRef = useRef(null)

  const pageCount = Math.ceil(totalActivities / ACTIVITY_PAGE_SIZE)

  const fetchActivities = async () => {
    const params = {
      page,
      limit: ACTIVITY_PAGE_SIZE,
      ...(filterType && { type: filterType }),
      ...(filterStart && { startDate: filterStart }),
      ...(filterEnd && { endDate: filterEnd }),
    }
    const { data } = await apiClient.get('/api/activities', { params })
    setActivities(data.activities)
    setTotalActivities(data.total)
  }

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/projects')
      setProjects(normalizeProjects(data))
      setError('')
    } catch {
      setError('Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

  const fetchResume = async () => {
    setResumeLoading(true)
    try {
      const { data } = await apiClient.get('/api/resume')
      setResumeForm(normalizeResumeForm(data))
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error loading resume', type: 'error', closable: true })
      setResumeForm(emptyResumeForm)
    } finally {
      setResumeLoading(false)
    }
  }

  const saveResume = async () => {
    try {
      await apiClient.put('/api/resume', buildResumePayload(resumeForm))
      toaster.create({ title: 'Resume updated', type: 'success', closable: true })
      setResumeOpen(false)
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error saving resume', type: 'error', closable: true })
    }
  }

  useEffect(() => {
    const auth = sessionStorage.getItem('isAdminAuthenticated')
    const time = sessionStorage.getItem('loginTime')
    const token = sessionStorage.getItem('adminToken')
    const cached = localStorage.getItem('activities')
    if (cached) {
      try {
        setActivities(JSON.parse(cached))
      } catch {
        localStorage.removeItem('activities')
      }
    }

    const restore = async () => {
      if (auth && time && token && Date.now() - Number(time) < ADMIN_SESSION_MS) {
        try {
          await apiClient.get('/api/admin/verify', {
            headers: { Authorization: `Bearer ${token}` },
          })
          setIsAuth(true)
          fetchProjects()
          fetchResume()
        } catch {
          sessionStorage.clear()
        }
      } else {
        sessionStorage.clear()
      }
    }

    restore()
  }, [])

  useEffect(() => {
    if (!isAuth) return
    fetchActivities()
  }, [isAuth, page, filterType, filterStart, filterEnd])

  useEffect(() => {
    setProjectPage(1)
  }, [projectFilter])

  useEffect(() => {
    const filteredLength = getFilteredProjects(projects, projectFilter).length
    const maxPage = Math.max(1, Math.ceil(filteredLength / PROJECT_PAGE_SIZE))
    if (projectPage > maxPage) setProjectPage(maxPage)
  }, [projects, projectFilter, projectPage])

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toaster.create({ title: 'Username and password required', type: 'error', closable: true })
      return
    }

    try {
      const { data } = await apiClient.post('/api/admin/login', {
        username: username.trim(),
        password,
      })
      if (!data?.token) throw new Error('Missing token')
      sessionStorage.setItem('isAdminAuthenticated', 'true')
      sessionStorage.setItem('loginTime', `${Date.now()}`)
      sessionStorage.setItem('adminToken', data.token)
      setIsAuth(true)
      fetchProjects()
      fetchResume()
      setPassword('')
      setUsername('')
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Wrong password', type: 'error', closable: true })
    }
  }

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onOpenCreate = () => {
    setEditMode(false)
    setCurrent(null)
    setFormData(emptyProjectForm)
    setCreateOpen(true)
  }

  const onOpenEdit = (project) => {
    setEditMode(true)
    setCurrent(project)
    setFormData(projectToFormData(project))
    setCreateOpen(true)
  }

  const handleProjectFilter = (filter) => {
    setProjectFilter(filter)
    setProjectPage(1)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openProjectAnalytics = async (project) => {
    if (!project) return
    setProjectAnalyticsTarget(project)
    setProjectAnalyticsOpen(true)
    const projectId = project.id || project._id
    if (!projectId) return
    setProjectAnalyticsLoading(true)
    try {
      const { data } = await apiClient.get('/api/activities', {
        params: { projectId, page: 1, limit: 5 },
      })
      setProjectAnalyticsActivities(Array.isArray(data.activities) ? data.activities : [])
    } catch (error) {
      reportAdminError(error)
      setProjectAnalyticsActivities([])
    } finally {
      setProjectAnalyticsLoading(false)
    }
  }

  const addMetric = () =>
    setResumeForm((current) => ({
      ...current,
      metrics: [...current.metrics, { label: '', value: '', note: '' }],
    }))
  const updateMetric = (index, key, value) =>
    setResumeForm((current) => {
      const next = [...current.metrics]
      next[index] = { ...next[index], [key]: value }
      return { ...current, metrics: next }
    })
  const removeMetric = (index) =>
    setResumeForm((current) => ({
      ...current,
      metrics: current.metrics.filter((_, itemIndex) => itemIndex !== index),
    }))

  const addExperience = () =>
    setResumeForm((current) => ({
      ...current,
      experience: [...current.experience, { role: '', company: '', location: '', period: '', bulletsText: '' }],
    }))
  const updateExperience = (index, key, value) =>
    setResumeForm((current) => {
      const next = [...current.experience]
      next[index] = { ...next[index], [key]: value }
      return { ...current, experience: next }
    })
  const removeExperience = (index) =>
    setResumeForm((current) => ({
      ...current,
      experience: current.experience.filter((_, itemIndex) => itemIndex !== index),
    }))

  const addEducation = () =>
    setResumeForm((current) => ({
      ...current,
      education: [...current.education, { school: '', degree: '', period: '', bulletsText: '' }],
    }))
  const updateEducation = (index, key, value) =>
    setResumeForm((current) => {
      const next = [...current.education]
      next[index] = { ...next[index], [key]: value }
      return { ...current, education: next }
    })
  const removeEducation = (index) =>
    setResumeForm((current) => ({
      ...current,
      education: current.education.filter((_, itemIndex) => itemIndex !== index),
    }))

  const addCertification = () =>
    setResumeForm((current) => ({
      ...current,
      certifications: [...current.certifications, { name: '', issuer: '', year: '' }],
    }))
  const updateCertification = (index, key, value) =>
    setResumeForm((current) => {
      const next = [...current.certifications]
      next[index] = { ...next[index], [key]: value }
      return { ...current, certifications: next }
    })
  const removeCertification = (index) =>
    setResumeForm((current) => ({
      ...current,
      certifications: current.certifications.filter((_, itemIndex) => itemIndex !== index),
    }))

  const onSubmit = async () => {
    try {
      const payload = buildProjectPayload(formData)

      if (editMode) {
        const { data: updated } = await apiClient.put(`/api/projects/${current.id}`, payload)
        const normalizedUpdated = normalizeProject(updated)
        toaster.create({ title: 'Project updated', type: 'success', closable: true })

        const changed = Object.keys(payload).filter((key) =>
          JSON.stringify(payload[key]) !== JSON.stringify(current[key])
        )
        await apiClient.post('/api/activities', {
          projectId: normalizedUpdated.id,
          type: 'Updated',
          title: normalizedUpdated.title,
          detail: changed.length ? `Changed: ${changed.join(', ')}` : '',
        })
      } else {
        const { data: created } = await apiClient.post('/api/projects', payload)
        const normalizedCreated = normalizeProject(created)
        toaster.create({ title: 'Project created', type: 'success', closable: true })
        await apiClient.post('/api/activities', {
          projectId: normalizedCreated.id,
          type: 'Created',
          title: normalizedCreated.title,
          detail: `Added a new project ${normalizedCreated.title}, Category: ${normalizedCreated.category}; Languages: ${normalizedCreated.languages.join(', ')}; Status: ${normalizedCreated.status}`,
        })
      }

      await fetchActivities()
      await fetchProjects()
      setCreateOpen(false)
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error saving project', type: 'error', closable: true })
    }
  }

  const confirmDelete = (project) => {
    setToDelete(project)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    try {
      await apiClient.delete(`/api/projects/${toDelete.id}`)
      toaster.create({ title: 'Project deleted', type: 'success', closable: true })
      await apiClient.post('/api/activities', {
        projectId: toDelete.id,
        type: 'Deleted',
        title: toDelete.title,
      })
      fetchActivities()
      fetchProjects()
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Error deleting', type: 'error', closable: true })
    } finally {
      setDeleteOpen(false)
    }
  }

  const onUploadImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const body = new FormData()
      body.append('image', file)
      const { data } = await apiClient.post('/api/projects/upload', body)
      if (!data?.imageUrl) throw new Error('Missing imageUrl from upload')
      setFormData((current) => ({ ...current, imageUrl: data.imageUrl }))
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Image upload failed', type: 'error', closable: true })
    } finally {
      setIsUploading(false)
    }
  }

  const mostViewedProject = useMemo(() => {
    if (!projects.length) return null
    return [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
  }, [projects])

  const mostViewedMeta = mostViewedProject
    ? `${mostViewedProject.title || 'Untitled'}${mostViewedProject.category ? ` · ${mostViewedProject.category}` : ''}`
    : 'No views yet'

  const kpis = useMemo(() => [
    { label: 'Total Projects', value: projects.length, desc: 'all projects', icon: HiFolderOpen, onClick: () => handleProjectFilter('all') },
    { label: 'Active Projects', value: projects.filter((project) => isInProgress(project.status)).length, desc: 'in progress', icon: HiPlay, onClick: () => handleProjectFilter('active') },
    { label: 'Most Viewed', value: mostViewedProject?.views || 0, desc: 'peak views', icon: HiEye, onClick: () => openProjectAnalytics(mostViewedProject), extra: mostViewedMeta },
    { label: 'Featured Projects', value: projects.filter((project) => project.featured).length, desc: 'your best', icon: HiStar, onClick: () => handleProjectFilter('featured') },
  ], [projects, mostViewedProject, mostViewedMeta])

  const quickActions = [
    { label: 'Add Project', value: '', desc: 'create new', icon: HiPlus, onClick: onOpenCreate },
    { label: 'Edit Project', value: projects.length, desc: 'modify', icon: HiPencil, onClick: () => setQuickEditOpen(true) },
    { label: 'Delete Project', value: projects.length, desc: 'remove', icon: HiTrash, onClick: () => setQuickDeleteOpen(true) },
    { label: 'View Analytics', value: '', desc: 'charts', icon: HiEye, onClick: () => setAnalyticsOpen(true) },
    {
      label: 'Edit Resume',
      value: '',
      desc: 'about page',
      icon: HiDocumentText,
      onClick: () => {
        fetchResume()
        setResumeOpen(true)
      },
    },
  ]

  const counts = useMemo(() => getProjectCounts(projects), [projects])
  const analytics = useMemo(() => getProjectAnalytics(projects), [projects])
  const filteredProjects = useMemo(
    () => getFilteredProjects(projects, projectFilter),
    [projects, projectFilter],
  )
  const projectFilterLabel = getProjectFilterLabel(projectFilter)
  const projectPageCount = Math.max(1, Math.ceil(filteredProjects.length / PROJECT_PAGE_SIZE))
  const paginatedProjects = filteredProjects.slice(
    (projectPage - 1) * PROJECT_PAGE_SIZE,
    projectPage * PROJECT_PAGE_SIZE,
  )

  if (!isAuth) {
    return (
      <>
        <Toaster />
        <AdminLoginPanel
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
        />
      </>
    )
  }

  return (
    <>
      <Toaster />
      <Box p={{ base: 4, md: 8 }}>
        <Box mb={6} p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="fg.muted">Admin Overview</Text>
              <Heading size="lg">Welcome Back!</Heading>
              <Text mt={1} color="fg.muted">Here's what's happening with your projects</Text>
            </Box>
            <Stack direction="row" spaceX={3}>
              <Button colorPalette="teal" onClick={onOpenCreate}>
                <HiPlus />
                New Project
              </Button>
              <Button variant="outline" colorPalette="teal" onClick={() => setAnalyticsOpen(true)}>View Analytics</Button>
            </Stack>
          </Flex>
        </Box>

        <Box mb={8}>
          <DashboardStats statCards={kpis.map((kpi) => ({ ...kpi, disabled: !kpi.onClick }))} />
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spaceX={6} spaceY={6} mb={8}>
          <Box p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Activity Log</Heading>
              <Text fontSize="xs" color="fg.muted">{totalActivities} events</Text>
            </Flex>
            <Flex mb={4} py={2} gap={3} align="center" wrap="wrap">
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder="All"
                  value={filterType}
                  onChange={(event) => setFilterType(event.target.value)}
                  bg={bg}
                  px={2}
                  borderRadius={4}
                  height={10}
                  minW={{ base: '100%', md: '160px' }}
                >
                  {['Created', 'Updated', 'Deleted'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Input type="date" value={filterStart} onChange={(event) => setFilterStart(event.target.value)} bg={bg} px={3} borderRadius={4} height={10} minW={{ base: '100%', md: '170px' }} />
              <Input type="date" value={filterEnd} onChange={(event) => setFilterEnd(event.target.value)} bg={bg} px={3} borderRadius={4} height={10} minW={{ base: '100%', md: '170px' }} />
              <Stack direction="row" spaceX={3} w={{ base: '100%', md: 'auto' }}>
                <Button size="sm" colorPalette="teal" onClick={() => { setPage(1); fetchActivities() }}>Apply</Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  onClick={() => {
                    setFilterType('')
                    setFilterStart('')
                    setFilterEnd('')
                    setPage(1)
                    fetchActivities()
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Flex>
            <SimpleGrid columns={1} spaceY={2}>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityCard
                    key={activity._id || activity.id}
                    type={activity.type}
                    title={activity.title}
                    timestamp={niceDate(activity.timestamp || activity.createdAt)}
                    detail={activity.detail}
                  />
                ))
              ) : (
                <Text color="fg.muted">No activity yet.</Text>
              )}
            </SimpleGrid>

            {pageCount > 1 && (
              <Flex justify="center" mt={4}>
                <PaginationControls
                  count={totalActivities}
                  pageSize={ACTIVITY_PAGE_SIZE}
                  page={page}
                  onPageChange={setPage}
                />
              </Flex>
            )}
          </Box>

          <Stack spaceY={6}>
            <Box p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4}>Quick Insights</Heading>
              <Stack spaceY={3}>
                <Flex justify="space-between"><Text>Started</Text><Text fontWeight="bold">{counts.started}</Text></Flex>
                <Flex justify="space-between"><Text>Finished</Text><Text fontWeight="bold">{counts.finished}</Text></Flex>
                <Flex justify="space-between"><Text>Total</Text><Text fontWeight="bold">{counts.total}</Text></Flex>
              </Stack>
            </Box>

            <Box p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4}>Quick Actions</Heading>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spaceX={4} spaceY={4}>
                {quickActions.map((action) => (
                  <ActionCard
                    key={action.label}
                    {...action}
                    disabled={!projects.length && !['Add Project', 'Edit Resume'].includes(action.label)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </Stack>
        </SimpleGrid>

        {loading && <Text color="fg.muted" mb={3}>Loading projects...</Text>}
        {error && <Text color="status.error" mb={3}>{error}</Text>}
        <Box ref={listRef}>
          <Text fontSize="sm" color="fg.muted" mb={2}>{projectFilterLabel} projects</Text>
          <ProjectTableSection
            projects={projects}
            paginatedProjects={paginatedProjects}
            projectPage={projectPage}
            projectPageCount={projectPageCount}
            projectPageSize={PROJECT_PAGE_SIZE}
            onProjectPageChange={setProjectPage}
            onOpenCreate={onOpenCreate}
            onOpenEdit={onOpenEdit}
            onConfirmDelete={confirmDelete}
            isQuickEditOpen={isQuickEditOpen}
            setQuickEditOpen={setQuickEditOpen}
            isQuickDeleteOpen={isQuickDeleteOpen}
            setQuickDeleteOpen={setQuickDeleteOpen}
            bg={bg}
            dialogBg={dialogBg}
            dialogBorder={dialogBorder}
            closeHoverBg={closeHoverBg}
          />
        </Box>

        <ResumeEditorDialog
          open={isResumeOpen}
          onOpenChange={(details) => setResumeOpen(details.open)}
          resumeForm={resumeForm}
          setResumeForm={setResumeForm}
          resumeLoading={resumeLoading}
          saveResume={saveResume}
          onCancel={() => setResumeOpen(false)}
          addMetric={addMetric}
          updateMetric={updateMetric}
          removeMetric={removeMetric}
          addExperience={addExperience}
          updateExperience={updateExperience}
          removeExperience={removeExperience}
          addEducation={addEducation}
          updateEducation={updateEducation}
          removeEducation={removeEducation}
          addCertification={addCertification}
          updateCertification={updateCertification}
          removeCertification={removeCertification}
          bg={bg}
          dialogBg={dialogBg}
          dialogBorder={dialogBorder}
          closeHoverBg={closeHoverBg}
        />

        <ActivityAnalyticsDialog
          open={isAnalyticsOpen}
          onOpenChange={(details) => setAnalyticsOpen(details.open)}
          projects={projects}
          analytics={analytics}
          onClose={() => setAnalyticsOpen(false)}
          bg={bg}
          accent={accent}
          dialogBg={dialogBg}
          dialogBorder={dialogBorder}
          closeHoverBg={closeHoverBg}
        />

        <ProjectAnalyticsDialog
          open={isProjectAnalyticsOpen}
          onOpenChange={(details) => setProjectAnalyticsOpen(details.open)}
          project={projectAnalyticsTarget}
          activities={projectAnalyticsActivities}
          loading={projectAnalyticsLoading}
          getAvgStars={getAvgStars}
          onClose={() => setProjectAnalyticsOpen(false)}
          bg={bg}
          accent={accent}
          dialogBg={dialogBg}
          dialogBorder={dialogBorder}
          closeHoverBg={closeHoverBg}
        />

        <ProjectEditorDialog
          open={isCreateOpen}
          onOpenChange={(details) => setCreateOpen(details.open)}
          editMode={editMode}
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={() => setCreateOpen(false)}
          onUploadImage={onUploadImage}
          isUploading={isUploading}
          setFormData={setFormData}
          dialogBg={dialogBg}
          dialogBorder={dialogBorder}
          closeHoverBg={closeHoverBg}
        />

        <DeleteProjectDialog
          open={isDeleteOpen}
          onOpenChange={(details) => setDeleteOpen(details.open)}
          project={toDelete}
          cancelRef={cancelRef}
          onDelete={doDelete}
        />
      </Box>
    </>
  )
}
