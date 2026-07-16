import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
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
import { Toaster, toaster } from '@/components/ui/toaster'
import { ErrorState, LoadingState } from '@/components/ui/StateFeedback'
import apiClient from '@/utils/axiosConfig'
import {
  buildProjectPayload,
  emptyProjectErrors,
  emptyProjectForm,
  getAvgStars,
  getFilteredProjects,
  getProjectAnalytics,
  getProjectCounts,
  getProjectFilterLabel,
  isInProgress,
  projectToFormData,
  validateProjectForm,
} from './adminDashboardUtils'
import ActivityAnalyticsDialog from './components/ActivityAnalyticsDialog'
import AdminLoginPanel from './components/AdminLoginPanel'
import AdminOverviewHeader from './components/AdminOverviewHeader'
import DashboardStats from './components/DashboardStats'
import DeleteProjectDialog from './components/DeleteProjectDialog'
import ActivityLogSection from './components/ActivityLogSection'
import ProjectAnalyticsDialog from './components/ProjectAnalyticsDialog'
import ProjectEditorDialog from './components/ProjectEditorDialog'
import ProjectTableSection from './components/ProjectTableSection'
import QuickActionsSection from './components/QuickActionsSection'
import QuickInsightsSection from './components/QuickInsightsSection'
import ResumeEditorDialog from './components/ResumeEditorDialog'
import { useAdminActivities } from './hooks/useAdminActivities'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useAdminProjects } from './hooks/useAdminProjects'

const ACTIVITY_PAGE_SIZE = 5
const PROJECT_PAGE_SIZE = 8

const reportAdminError = (error) => {
  if (import.meta.env.DEV) {
    console.error(error)
  }
}

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data
  const firstError = Array.isArray(data?.errors) ? data.errors[0] : null

  if (typeof firstError === 'string') return firstError
  if (firstError?.path && firstError?.message) return `${firstError.path}: ${firstError.message}`
  if (data?.message) return data.message
  if (data?.error) return data.error

  return fallback
}

const getApiFieldErrors = (error) => {
  const errors = error?.response?.data?.errors
  if (!Array.isArray(errors)) return {}

  return errors.reduce((acc, item) => {
    if (item?.path && item?.message) {
      acc[item.path] = item.message
    }
    return acc
  }, {})
}

export default function AdminDashboard() {
  const accent = 'brand.600'
  const bg = 'bg.subtle'
  const dialogBg = 'bg.surface'
  const dialogBorder = 'border.subtle'
  const closeHoverBg = 'bg.subtle'

  const {
    projects,
    loading,
    error,
    fetchProjects,
    resumeForm,
    setResumeForm,
    resumeLoading,
    fetchResume,
    saveResume: persistResume,
    uploadResumeFile,
  } = useAdminProjects()

  const handleAuthenticated = useCallback(() => {
    fetchProjects()
    fetchResume()
  }, [fetchProjects, fetchResume])

  const {
    isAuth,
    username,
    setUsername,
    password,
    setPassword,
    isLoggingIn,
    handleLogin,
    handleUnauthorized,
    logout,
  } = useAdminAuth({ onAuthenticated: handleAuthenticated })

  const {
    activities,
    totalActivities,
    filterType,
    setFilterType,
    filterStart,
    setFilterStart,
    filterEnd,
    setFilterEnd,
    page,
    setPage,
    fetchActivities,
    clearFilters,
  } = useAdminActivities({ isAuth, pageSize: ACTIVITY_PAGE_SIZE })

  const [projectPage, setProjectPage] = useState(1)
  const [projectFilter, setProjectFilter] = useState('all')
  const [editMode, setEditMode] = useState(false)
  const [current, setCurrent] = useState(null)
  const [formData, setFormData] = useState(emptyProjectForm)
  const [projectErrors, setProjectErrors] = useState(emptyProjectErrors)

  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isQuickEditOpen, setQuickEditOpen] = useState(false)
  const [isQuickDeleteOpen, setQuickDeleteOpen] = useState(false)
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false)
  const [isProjectAnalyticsOpen, setProjectAnalyticsOpen] = useState(false)
  const [isResumeOpen, setResumeOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [isSavingResume, setIsSavingResume] = useState(false)
  const [isUploadingResumeFile, setIsUploadingResumeFile] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [projectAnalyticsTarget, setProjectAnalyticsTarget] = useState(null)
  const [projectAnalyticsActivities, setProjectAnalyticsActivities] = useState([])
  const [projectAnalyticsLoading, setProjectAnalyticsLoading] = useState(false)
  const cancelRef = useRef()
  const listRef = useRef(null)

  const pageCount = Math.ceil(totalActivities / ACTIVITY_PAGE_SIZE)

  const saveResume = async () => {
    if (isSavingResume) return
    setIsSavingResume(true)
    try {
      const saved = await persistResume()
      if (saved) {
        setResumeOpen(false)
      }
    } finally {
      setIsSavingResume(false)
    }
  }

  const onUploadResumeFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || isUploadingResumeFile) return

    setIsUploadingResumeFile(true)
    try {
      await uploadResumeFile(file)
    } finally {
      setIsUploadingResumeFile(false)
    }
  }

  useEffect(() => {
    setProjectPage(1)
  }, [projectFilter])

  useEffect(() => {
    const filteredLength = getFilteredProjects(projects, projectFilter).length
    const maxPage = Math.max(1, Math.ceil(filteredLength / PROJECT_PAGE_SIZE))
    if (projectPage > maxPage) setProjectPage(maxPage)
  }, [projects, projectFilter, projectPage])

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (projectErrors[name]) {
      setProjectErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const onOpenCreate = () => {
    setEditMode(false)
    setCurrent(null)
    setFormData(emptyProjectForm)
    setProjectErrors(emptyProjectErrors)
    setCreateOpen(true)
  }

  const onOpenEdit = (project) => {
    setEditMode(true)
    setCurrent(project)
    setFormData(projectToFormData(project))
    setProjectErrors(emptyProjectErrors)
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
    if (isSavingProject) return
    const validationErrors = validateProjectForm(formData)
    if (Object.keys(validationErrors).length) {
      setProjectErrors(validationErrors)
      toaster.create({
        title: 'Check project fields',
        description: 'Fix the highlighted fields before saving.',
        type: 'error',
        closable: true,
      })
      return
    }

    setIsSavingProject(true)
    try {
      const payload = buildProjectPayload(formData)

      if (editMode) {
        await apiClient.put(`/api/projects/${current.id}`, payload)
        toaster.create({ title: 'Project updated', type: 'success', closable: true })
      } else {
        await apiClient.post('/api/projects', payload)
        toaster.create({ title: 'Project created', type: 'success', closable: true })
      }

      await fetchActivities()
      await fetchProjects()
      setCreateOpen(false)
      setProjectErrors(emptyProjectErrors)
    } catch (error) {
      reportAdminError(error)
      if (handleUnauthorized(error)) return
      const apiFieldErrors = getApiFieldErrors(error)
      if (Object.keys(apiFieldErrors).length) {
        setProjectErrors(apiFieldErrors)
      }
      toaster.create({
        title: 'Error saving project',
        description: getApiErrorMessage(error, 'Please check the project fields and try again.'),
        type: 'error',
        closable: true,
      })
    } finally {
      setIsSavingProject(false)
    }
  }

  const confirmDelete = (project) => {
    setToDelete(project)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (isDeletingProject || !toDelete?.id) return
    setIsDeletingProject(true)
    try {
      await apiClient.delete(`/api/projects/${toDelete.id}`)
      toaster.create({ title: 'Project deleted', type: 'success', closable: true })
      await fetchActivities()
      await fetchProjects()
      setDeleteOpen(false)
    } catch (error) {
      reportAdminError(error)
      if (handleUnauthorized(error)) return
      toaster.create({ title: 'Error deleting', type: 'error', closable: true })
    } finally {
      setIsDeletingProject(false)
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
      if (handleUnauthorized(error)) return
      toaster.create({
        title: 'Image upload failed',
        description: getApiErrorMessage(error, 'Please choose a valid image and try again.'),
        type: 'error',
        closable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const mostViewedProject = useMemo(() => {
    if (!projects.length) return null
    return [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
  }, [projects])

  const mostViewedMeta = mostViewedProject
    ? `${mostViewedProject.title || 'Untitled'}${mostViewedProject.category ? ` - ${mostViewedProject.category}` : ''}`
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
      label: 'Edit About Page',
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
          isLoggingIn={isLoggingIn}
          handleLogin={handleLogin}
        />
      </>
    )
  }

  return (
    <>
      <Toaster />
      <Box p={{ base: 4, md: 8 }}>
        <AdminOverviewHeader
          dialogBg={dialogBg}
          dialogBorder={dialogBorder}
          onOpenCreate={onOpenCreate}
          onOpenAnalytics={() => setAnalyticsOpen(true)}
          onLogout={logout}
        />

        <Box mb={8}>
          <DashboardStats statCards={kpis.map((kpi) => ({ ...kpi, disabled: !kpi.onClick }))} />
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="stretch" mb={8}>
          <ActivityLogSection
            activities={activities}
            totalActivities={totalActivities}
            page={page}
            pageCount={pageCount}
            pageSize={ACTIVITY_PAGE_SIZE}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStart={filterStart}
            setFilterStart={setFilterStart}
            filterEnd={filterEnd}
            setFilterEnd={setFilterEnd}
            setPage={setPage}
            fetchActivities={fetchActivities}
            clearFilters={clearFilters}
            bg={bg}
            dialogBg={dialogBg}
            dialogBorder={dialogBorder}
          />

          <Stack gap={6} h="full">
            <QuickInsightsSection counts={counts} dialogBg={dialogBg} dialogBorder={dialogBorder} />
            <QuickActionsSection
              quickActions={quickActions}
              projectsCount={projects.length}
              dialogBg={dialogBg}
              dialogBorder={dialogBorder}
            />
          </Stack>
        </SimpleGrid>

        {loading && <LoadingState label="Loading projects..." />}
        {error && (
          <ErrorState
            title={error}
            description="Project data could not be refreshed."
            onRetry={fetchProjects}
          />
        )}
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
          isSavingResume={isSavingResume}
          onUploadResumeFile={onUploadResumeFile}
          isUploadingResumeFile={isUploadingResumeFile}
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
          isSaving={isSavingProject}
          errors={projectErrors}
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
          isDeleting={isDeletingProject}
        />
      </Box>
    </>
  )
}
