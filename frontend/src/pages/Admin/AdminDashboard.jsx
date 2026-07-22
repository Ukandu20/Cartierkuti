import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Text,
} from '@chakra-ui/react'
import {
  HiEye,
  HiFolderOpen,
  HiPlay,
  HiStar,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { toaster } from '@/components/ui/toaster'
import { ErrorState, LoadingState } from '@/components/ui/StateFeedback'
import apiClient from '@/utils/axiosConfig'
import {
  buildProjectPayload,
  emptyProjectErrors,
  emptyProjectForm,
  getAvgStars,
  getFilteredProjects,
  getProjectAnalytics,
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
import DiscardChangesDialog from './components/DiscardChangesDialog'
import CategoryManagerDialog from './components/CategoryManagerDialog'
import { useAdminActivities } from './hooks/useAdminActivities'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useAdminProjects } from './hooks/useAdminProjects'
import { useAdminCategories } from './hooks/useAdminCategories'
import { categoryOptions } from '@/utils/projectCategories'

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
  const navigate = useNavigate()
  const accent = 'accent.default'
  const bg = 'bg.subtle'
  const dialogBg = 'bg.surface'
  const dialogBorder = 'border.subtle'
  const closeHoverBg = 'bg.subtle'

  const {
    projects,
    loading,
    error,
    fetchProjects,
  } = useAdminProjects()

  const handleAuthenticated = useCallback(() => {
    fetchProjects()
  }, [fetchProjects])

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
    handleUnauthorized,
    logout,
  } = useAdminAuth({ onAuthenticated: handleAuthenticated })

  const {
    categories,
    categoriesLoading,
    categoriesLoaded,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategories({ handleUnauthorized })

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
  const [projectSearch, setProjectSearch] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState('all')
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all')
  const [editMode, setEditMode] = useState(false)
  const [current, setCurrent] = useState(null)
  const [formData, setFormData] = useState(emptyProjectForm)
  const [projectErrors, setProjectErrors] = useState(emptyProjectErrors)

  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false)
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [isProjectAnalyticsOpen, setProjectAnalyticsOpen] = useState(false)
  const [isProjectDiscardOpen, setProjectDiscardOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [projectAnalyticsTarget, setProjectAnalyticsTarget] = useState(null)
  const [projectAnalyticsActivities, setProjectAnalyticsActivities] = useState([])
  const [projectAnalyticsLoading, setProjectAnalyticsLoading] = useState(false)
  const cancelRef = useRef()
  const listRef = useRef(null)
  const imageUploadInFlightRef = useRef(false)
  const lastUploadedImageKeyRef = useRef(null)

  const pageCount = Math.ceil(totalActivities / ACTIVITY_PAGE_SIZE)
  const availableCategories = categoriesLoaded
    ? categories
    : categoryOptions.map((item) => ({ name: item.label, slug: item.value }))

  useEffect(() => {
    if (isAuth) fetchCategories()
  }, [isAuth, fetchCategories])

  useEffect(() => {
    setProjectPage(1)
  }, [projectFilter, projectSearch, projectStatusFilter, projectCategoryFilter])

  useEffect(() => {
    const filteredLength = getFilteredProjects(projects, projectFilter)
      .filter((project) => projectStatusFilter === 'all' || project.status === projectStatusFilter)
      .filter((project) => projectCategoryFilter === 'all' || project.category === projectCategoryFilter)
      .filter((project) => {
        const query = projectSearch.trim().toLowerCase()
        if (!query) return true
        return [project.title, project.category, project.status, ...(project.tags || []), ...(project.methods || []), ...(project.tools || [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      })
      .length
    const maxPage = Math.max(1, Math.ceil(filteredLength / PROJECT_PAGE_SIZE))
    if (projectPage > maxPage) setProjectPage(maxPage)
  }, [projects, projectFilter, projectSearch, projectStatusFilter, projectCategoryFilter, projectPage])

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
    lastUploadedImageKeyRef.current = null
    setEditMode(false)
    setCurrent(null)
    setFormData(emptyProjectForm)
    setProjectErrors(emptyProjectErrors)
    setCreateOpen(true)
  }

  const onOpenEdit = (project) => {
    lastUploadedImageKeyRef.current = null
    setEditMode(true)
    setCurrent(project)
    setFormData(projectToFormData(project))
    setProjectErrors(emptyProjectErrors)
    setCreateOpen(true)
  }

  const onCategoryChange = (event) => {
    const category = availableCategories.find((item) => item.slug === event.target.value)
    setFormData((current) => ({
      ...current,
      categorySlug: category?.slug || '',
      category: category?.name || '',
    }))
    setProjectErrors((current) => {
      const next = { ...current }
      delete next.category
      delete next.categorySlug
      return next
    })
  }

  const cleanupStagedImage = useCallback(async (imageAssetId) => {
    if (!imageAssetId) return
    try {
      await apiClient.delete('/api/projects/upload', { data: { imageAssetId } })
    } catch (error) {
      reportAdminError(error)
    }
  }, [])

  const requestCloseProjectEditor = () => {
    const initialForm = editMode ? projectToFormData(current) : emptyProjectForm
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialForm)
    if (hasChanges) {
      setCreateOpen(false)
      setProjectDiscardOpen(true)
      return
    }
    setCreateOpen(false)
  }

  const discardProjectChanges = () => {
    if (formData.imageAssetId && formData.imageAssetId !== current?.imageAssetId) {
      cleanupStagedImage(formData.imageAssetId)
    }
    lastUploadedImageKeyRef.current = null
    setProjectDiscardOpen(false)
    setCreateOpen(false)
    setProjectErrors(emptyProjectErrors)
  }

  const keepEditingProject = () => {
    setProjectDiscardOpen(false)
    setCreateOpen(true)
  }

  const handleProjectFilter = (filter) => {
    setProjectFilter(filter)
    setProjectSearch('')
    setProjectStatusFilter('all')
    setProjectCategoryFilter('all')
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
    event.target.value = ''
    if (!file) return
    const fileKey = `${file.name}:${file.size}:${file.lastModified}`
    if (imageUploadInFlightRef.current || lastUploadedImageKeyRef.current === fileKey) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      toaster.create({
        title: 'Choose a valid preview image',
        description: 'Use a PNG, JPG, or WebP image no larger than 2 MB.',
        type: 'error',
        closable: true,
      })
      return
    }
    imageUploadInFlightRef.current = true
    lastUploadedImageKeyRef.current = fileKey
    setIsUploading(true)
    try {
      const previousStagedAssetId = formData.imageAssetId
      const body = new FormData()
      body.append('image', file)
      const { data } = await apiClient.post('/api/projects/upload', body)
      if (!data?.imageUrl) throw new Error('Missing imageUrl from upload')
      if (previousStagedAssetId && previousStagedAssetId !== current?.imageAssetId && previousStagedAssetId !== data.imageAssetId) {
        cleanupStagedImage(previousStagedAssetId)
      }
      setFormData((currentForm) => ({ ...currentForm, imageUrl: data.imageUrl, imageAssetId: data.imageAssetId || '' }))
    } catch (error) {
      lastUploadedImageKeyRef.current = null
      reportAdminError(error)
      if (handleUnauthorized(error)) return
      toaster.create({
        title: 'Image upload failed',
        description: getApiErrorMessage(error, 'Please choose a valid image and try again.'),
        type: 'error',
        closable: true,
      })
    } finally {
      imageUploadInFlightRef.current = false
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

  const analytics = useMemo(() => getProjectAnalytics(projects), [projects])
  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase()
    return getFilteredProjects(projects, projectFilter)
      .filter((project) => projectStatusFilter === 'all' || project.status === projectStatusFilter)
      .filter((project) => projectCategoryFilter === 'all' || project.category === projectCategoryFilter)
      .filter((project) => !query || [project.title, project.category, project.status, ...(project.tags || []), ...(project.methods || []), ...(project.tools || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)))
  }, [projects, projectFilter, projectSearch, projectStatusFilter, projectCategoryFilter])
  const projectFilterLabel = getProjectFilterLabel(projectFilter)
  const projectPageCount = Math.max(1, Math.ceil(filteredProjects.length / PROJECT_PAGE_SIZE))
  const paginatedProjects = filteredProjects.slice(
    (projectPage - 1) * PROJECT_PAGE_SIZE,
    projectPage * PROJECT_PAGE_SIZE,
  )

  if (!isAuth) {
    return (
        <AdminLoginPanel
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          isLoggingIn={isLoggingIn}
          handleLogin={handleLogin}
          mfaRequired={mfaRequired}
          mfaCode={mfaCode}
          setMfaCode={setMfaCode}
          handleMfaLogin={handleMfaLogin}
          cancelMfaLogin={cancelMfaLogin}
        />
    )
  }

  return (
    <Box data-admin-shell w="full" maxW="1440px" mx="auto" p={{ base: 4, md: 8 }} fontFamily="body">
        <AdminOverviewHeader
          dialogBg={dialogBg}
          dialogBorder={dialogBorder}
          onOpenCreate={onOpenCreate}
          onOpenAnalytics={() => setAnalyticsOpen(true)}
          onOpenCategories={() => setCategoryManagerOpen(true)}
          onOpenAbout={() => navigate('/admin/about')}
          onOpenSecurity={() => navigate('/admin/security')}
          onLogout={logout}
        />

        <Box mb={8}>
          <DashboardStats statCards={kpis.map((kpi) => ({ ...kpi, disabled: !kpi.onClick }))} />
        </Box>

        {loading && <LoadingState label="Loading projects..." />}
        {error && (
          <ErrorState
            title={error}
            description="Project data could not be refreshed."
            onRetry={fetchProjects}
          />
        )}
        <Box ref={listRef}>
          {projectFilter !== 'all' && <Text fontSize="sm" color="fg.muted" mb={2}>Showing {projectFilterLabel.toLowerCase()} projects</Text>}
          <ProjectTableSection
            projects={projects}
            paginatedProjects={paginatedProjects}
            filteredProjectCount={filteredProjects.length}
            projectPage={projectPage}
            projectPageCount={projectPageCount}
            projectPageSize={PROJECT_PAGE_SIZE}
            onProjectPageChange={setProjectPage}
            onOpenEdit={onOpenEdit}
            onConfirmDelete={confirmDelete}
            onOpenAnalytics={openProjectAnalytics}
            search={projectSearch}
            onSearchChange={setProjectSearch}
            statusFilter={projectStatusFilter}
            onStatusFilterChange={setProjectStatusFilter}
            categoryFilter={projectCategoryFilter}
            onCategoryFilterChange={setProjectCategoryFilter}
            onClearFilters={() => {
              setProjectFilter('all')
              setProjectSearch('')
              setProjectStatusFilter('all')
              setProjectCategoryFilter('all')
            }}
            dialogBg={dialogBg}
            dialogBorder={dialogBorder}
          />
        </Box>

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
          onOpenChange={(details) => {
            if (details.open) setCreateOpen(true)
            else if (!isProjectDiscardOpen) requestCloseProjectEditor()
          }}
          editMode={editMode}
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={requestCloseProjectEditor}
          onUploadImage={onUploadImage}
          isUploading={isUploading}
          isSaving={isSavingProject}
          errors={projectErrors}
          setFormData={setFormData}
          onRemoveImage={() => {
            lastUploadedImageKeyRef.current = null
            if (formData.imageAssetId && formData.imageAssetId !== current?.imageAssetId) cleanupStagedImage(formData.imageAssetId)
            setFormData((currentForm) => ({ ...currentForm, imageUrl: '', imageAssetId: '' }))
          }}
          categories={availableCategories}
          onCategoryChange={onCategoryChange}
        />

        <CategoryManagerDialog
          open={isCategoryManagerOpen}
          onOpenChange={(details) => setCategoryManagerOpen(details.open)}
          categories={categories}
          loading={categoriesLoading}
          onCreate={createCategory}
          onUpdate={async (...args) => {
            const saved = await updateCategory(...args)
            if (saved) await fetchProjects()
            return saved
          }}
          onDelete={deleteCategory}
        />

        <DiscardChangesDialog
          open={isProjectDiscardOpen}
          onOpenChange={(details) => setProjectDiscardOpen(details.open)}
          onKeepEditing={keepEditingProject}
          title="Discard project changes?"
          description="Your unsaved project fields and image selection will be lost."
          onDiscard={discardProjectChanges}
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
  )
}
