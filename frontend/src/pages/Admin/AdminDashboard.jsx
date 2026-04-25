import React, { useState, useEffect, useMemo, useRef } from 'react'
import apiClient from '@/utils/axiosConfig'
import { niceDate } from '@/utils/formatDate'
import { normalizeProject, normalizeProjects } from '@/utils/projectNormalizer'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  VStack,
  Stack,
  Input,
  Textarea,
  Button,
  Portal,
  CloseButton,
  Dialog,
  Fieldset,
  Field,
  For,
  NativeSelect,
  FileUpload,
  Float,
  useFileUploadContext,
  Checkbox,
  Select,
} from '@chakra-ui/react'

import PaginationControls from '@/components/pagination/pagination'
import { Toaster, toaster } from '@/components/ui/toaster'
import {
  HiFolderOpen,
  HiPlay,
  HiEye,
  HiStar,
  HiPlus,
  HiPencil,
  HiTrash,
  HiDocumentText,
} from 'react-icons/hi'
import { RiImageAddLine } from 'react-icons/ri'
import ActivityCard from './activity'

const AdminLoginPanel = ({ username, setUsername, password, setPassword, handleLogin }) => (
  <Box
    minH="100vh"
    display="flex"
    alignItems="center"
    justifyContent="center"
    bg="bg.canvas"
    px={4}
  >
    <Box
      w="full"
      maxW="sm"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="lg"
      p={6}
      boxShadow="md"
    >
      <Heading size="md" mb={2}>Admin Login</Heading>
      <Text color="fg.muted" mb={4}>Sign in with your admin credentials.</Text>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        px={3}
        mb={3}
      />
      <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        px={3}
        mb={4}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleLogin()
        }}
      />
      <Button w="full" onClick={handleLogin}>Sign In</Button>
    </Box>
  </Box>
)

const DashboardStats = ({ statCards }) => (
  <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spaceX={4} spaceY={4}>
    {statCards.map((card) => (
      <StatCard key={card.label} {...card} />
    ))}
  </SimpleGrid>
)


// ────────────────────────────────────────────────────────────────────────────────
// StatCard uses semantic tokens for theming
// ────────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, desc, icon: IconComp, onClick, disabled, extra }) => {
  const accent  = 'brand.600'
  const bg      = 'bg.surface'
  const border  = 'border.subtle'
  const idleTxt = 'fg.muted'

  return (
    <Box
      p={5}
      bg={bg}
      boxShadow="sm"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={border}
      _hover={{
        boxShadow: !disabled ? 'md' : undefined,
        cursor:    !disabled ? 'pointer' : undefined,
      }}
      onClick={!disabled ? onClick : undefined}
      opacity={disabled ? 0.6 : 1}
    >
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={1}>{label}</Text>
          <Text fontSize="xs" color={idleTxt} opacity={0.7}>{desc}</Text>
        </Box>
        <Box
          display="grid"
          placeItems="center"
          boxSize="40px"
          borderRadius="md"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor={border}
        >
          <IconComp size="1.2rem" color={accent} />
        </Box>
      </Flex>
      <Text fontSize="3xl" fontWeight="bold" color={accent}>{value}</Text>
      {extra && (
        <Text mt={1} fontSize="xs" color={idleTxt} opacity={0.75}>
          {extra}
        </Text>
      )}
    </Box>
  )
}

const ActionCard = ({ label, value, desc, icon: IconComp, onClick, disabled }) => {
  const accent  = 'brand.600'
  const bg      = 'bg.surface'
  const border  = 'border.subtle'
  const idleTxt = 'fg.muted'

  return (
    <Box
      p={5}
      bg={bg}
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      boxShadow="sm"
      role="button"
      _hover={{
        borderColor: accent,
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.15s ease"
      onClick={!disabled ? onClick : undefined}
      opacity={disabled ? 0.6 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
    >
      <Flex align="center" justify="space-between">
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={1}>{label}</Text>
          <Text fontSize="sm" color={idleTxt}>{desc}</Text>
        </Box>
        <Box
          display="grid"
          placeItems="center"
          boxSize="40px"
          borderRadius="md"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor={border}
        >
          <IconComp size="1.25rem" color={accent} />
        </Box>
      </Flex>
      {value !== '' && value != null && (
        <Text mt={3} fontSize="xs" color={idleTxt} letterSpacing="0.08em" textTransform="uppercase">
          {value} total
        </Text>
      )}
    </Box>
  )
}

const emptyResumeForm = {
  headline: '',
  summary: '',
  highlightsText: '',
  metrics: [],
  experience: [],
  education: [],
  certifications: [],
  skillsPrimaryText: '',
  skillsSecondaryText: '',
  skillsToolsText: '',
}

const splitLines = (value) =>
  (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const normalizeResumeForm = (data = {}) => {
  const safeArray = (value) => (Array.isArray(value) ? value : [])
  return {
    headline: data.headline || '',
    summary: data.summary || '',
    highlightsText: safeArray(data.highlights).join('\n'),
    metrics: safeArray(data.metrics).map((metric) => ({
      label: metric?.label || '',
      value: metric?.value || '',
      note: metric?.note || '',
    })),
    experience: safeArray(data.experience).map((item) => ({
      role: item?.role || '',
      company: item?.company || '',
      location: item?.location || '',
      period: item?.period || '',
      bulletsText: safeArray(item?.bullets).join('\n'),
    })),
    education: safeArray(data.education).map((item) => ({
      school: item?.school || '',
      degree: item?.degree || '',
      period: item?.period || '',
      bulletsText: safeArray(item?.bullets).join('\n'),
    })),
    certifications: safeArray(data.certifications).map((item) => ({
      name: item?.name || '',
      issuer: item?.issuer || '',
      year: item?.year || '',
    })),
    skillsPrimaryText: safeArray(data?.skills?.primary).join('\n'),
    skillsSecondaryText: safeArray(data?.skills?.secondary).join('\n'),
    skillsToolsText: safeArray(data?.skills?.tools).join('\n'),
  }
}

const buildResumePayload = (form) => ({
  headline: form.headline?.trim() || '',
  summary: form.summary?.trim() || '',
  highlights: splitLines(form.highlightsText),
  metrics: (form.metrics || [])
    .filter((item) => item.label || item.value || item.note)
    .map((item) => ({
      label: item.label?.trim() || '',
      value: item.value?.trim() || '',
      note: item.note?.trim() || '',
    })),
  experience: (form.experience || [])
    .filter((item) => item.role || item.company || item.period || item.bulletsText)
    .map((item) => ({
      role: item.role?.trim() || '',
      company: item.company?.trim() || '',
      location: item.location?.trim() || '',
      period: item.period?.trim() || '',
      bullets: splitLines(item.bulletsText),
    })),
  education: (form.education || [])
    .filter((item) => item.school || item.degree || item.period || item.bulletsText)
    .map((item) => ({
      school: item.school?.trim() || '',
      degree: item.degree?.trim() || '',
      period: item.period?.trim() || '',
      bullets: splitLines(item.bulletsText),
    })),
  certifications: (form.certifications || [])
    .filter((item) => item.name || item.issuer || item.year)
    .map((item) => ({
      name: item.name?.trim() || '',
      issuer: item.issuer?.trim() || '',
      year: item.year?.trim() || '',
    })),
  skills: {
    primary: splitLines(form.skillsPrimaryText),
    secondary: splitLines(form.skillsSecondaryText),
    tools: splitLines(form.skillsToolsText),
  },
})

// ────────────────────────────────────────────────────────────────────────────────
// Main AdminDashboard
// ────────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const accent  = 'brand.600'
  const bg      = 'bg.subtle'
  const idleTxt = 'fg.muted'
  const dialogBg = 'bg.surface'
  const dialogBorder = 'border.subtle'
  const closeHoverBg = 'bg.subtle'

  const [isAuth, setIsAuth] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

   // Activity log state
  const [activities, setActivities]       = useState([])
  const [totalActivities, setTotalActivities] = useState(0)

  const [filterType, setFilterType]       = useState('')
  const [filterStart, setFilterStart]     = useState('') // YYYY-MM-DD
  const [filterEnd, setFilterEnd]         = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  const pageCount = Math.ceil(totalActivities / PAGE_SIZE)
  const [projectPage, setProjectPage] = useState(1)
  const PROJECT_PAGE_SIZE = 8
  const [projectFilter, setProjectFilter] = useState('all')

  const [editMode, setEditMode] = useState(false)
  const [current, setCurrent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    externalLink: '',
    githubLink: '',
    liveDemoLink: '',
    imageUrl: '',
    category: '',
    languages: '',
    status: '',
    tags: '',
    date: '',
    featured: false,
  })

  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isQuickEditOpen, setQuickEditOpen] = useState(false)
  const [isQuickDeleteOpen, setQuickDeleteOpen] = useState(false)
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false)
  const [isProjectAnalyticsOpen, setProjectAnalyticsOpen] = useState(false)
  const [isResumeOpen, setResumeOpen] = useState(false)
  const cancelRef = useRef()
  const [toDelete, setToDelete] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [projectAnalyticsTarget, setProjectAnalyticsTarget] = useState(null)
  const [projectAnalyticsActivities, setProjectAnalyticsActivities] = useState([])
  const [projectAnalyticsLoading, setProjectAnalyticsLoading] = useState(false)
  const listRef = useRef(null)
  const [resumeForm, setResumeForm] = useState(emptyResumeForm)
  const [resumeLoading, setResumeLoading] = useState(false)

  const normalizeStatus = value => (value || '').toString().trim().toLowerCase()
  const isInProgress = value => {
    const normalized = normalizeStatus(value)
    return normalized === 'in progress' || normalized === 'in-progress' || normalized === 'active'
  }
  const isCompleted = value => normalizeStatus(value) === 'completed'

  // ---- Fetch Activities ----
  const fetchActivities = async () => {
    const params = {
      page,
      limit: PAGE_SIZE,
      ...(filterType  && { type: filterType }),
      ...(filterStart && { startDate: filterStart }),
      ...(filterEnd   && { endDate: filterEnd }),
    }
    const { data } = await apiClient.get('/api/activities', { params })
    setActivities(data.activities)
    setTotalActivities(data.total)
  }
  
  
  // fetch projects
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/projects')
      setProjects(normalizeProjects(data))
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
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'Error loading resume', type: 'error', closable: true })
      setResumeForm(emptyResumeForm)
    } finally {
      setResumeLoading(false)
    }
  }

  const saveResume = async () => {
    try {
      const payload = buildResumePayload(resumeForm)
      await apiClient.put('/api/resume', payload)
      toaster.create({ title: 'Resume updated', type: 'success', closable: true })
      setResumeOpen(false)
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'Error saving resume', type: 'error', closable: true })
    }
  }

// ---- initial load & auth check (run once) ----
   useEffect(() => {
     const auth = sessionStorage.getItem('isAdminAuthenticated')
     const time = sessionStorage.getItem('loginTime')
     const token = sessionStorage.getItem('adminToken')
     const cached = localStorage.getItem('activities')
     if (cached) {
       try { setActivities(JSON.parse(cached)) } catch {}
     }

     const restore = async () => {
       if (auth && time && token && Date.now() - +time < 30 * 60_000) {
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
 
   // ---- whenever we’re authenticated, or page/filters change, re-fetch activities ----
   useEffect(() => {
     if (!isAuth) return
     // whenever isAuth first becomes true, or page/type/date range change:
     fetchActivities()
   }, [isAuth, page, filterType, filterStart, filterEnd])

   useEffect(() => {
     setProjectPage(1)
   }, [projectFilter])

   useEffect(() => {
     const filteredLength = projectFilter === 'active'
       ? projects.filter(p => isInProgress(p.status)).length
       : projectFilter === 'featured'
         ? projects.filter(p => p.featured).length
         : projects.length

     const maxPage = Math.max(1, Math.ceil(filteredLength / PROJECT_PAGE_SIZE))
     if (projectPage > maxPage) {
       setProjectPage(maxPage)
     }
   }, [projects, projectFilter, projectPage, PROJECT_PAGE_SIZE])

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
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'Wrong password', type: 'error', closable: true })
    }
  }

  const onChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onOpenCreate = () => {
    setEditMode(false)
    setCurrent(null)
    setFormData({
      title: '',
      description: '',
      externalLink: '',
      githubLink: '',
      liveDemoLink: '',
      imageUrl: '',
      category: '',
      languages: '',
      status: '',
      tags: '',
      date: '',
      featured: false,
    })
    setCreateOpen(true)
  }

  const onOpenEdit = proj => {
    setEditMode(true)
    setCurrent(proj)
    setFormData({
      title: proj.title || '',
      description: proj.description || '',
      externalLink: proj.externalLink || '',
      githubLink: proj.githubLink || '',
      liveDemoLink: proj.liveDemoLink || '',
      imageUrl: proj.imageUrl || '',
      category: proj.category || '',
      languages: (proj.languages || []).join(', '),
      status: proj.status || '',
      tags: (proj.tags || []).join(', '),
      date: proj.createdDate ? new Date(proj.createdDate).toISOString().slice(0,10) : '',
      featured: proj.featured || false,
    })
    setCreateOpen(true)
  }

  const handleProjectFilter = filter => {
    setProjectFilter(filter)
    setProjectPage(1)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openProjectAnalytics = async proj => {
    if (!proj) return
    setProjectAnalyticsTarget(proj)
    setProjectAnalyticsOpen(true)
    const projectId = proj.id || proj._id
    if (!projectId) return
    setProjectAnalyticsLoading(true)
    try {
      const { data } = await apiClient.get('/api/activities', {
        params: { projectId, page: 1, limit: 5 },
      })
      setProjectAnalyticsActivities(Array.isArray(data.activities) ? data.activities : [])
    } catch (err) {
      console.error(err)
      setProjectAnalyticsActivities([])
    } finally {
      setProjectAnalyticsLoading(false)
    }
  }

  const addMetric = () =>
    setResumeForm(prev => ({
      ...prev,
      metrics: [...prev.metrics, { label: '', value: '', note: '' }],
    }))

  const updateMetric = (index, key, value) =>
    setResumeForm(prev => {
      const next = [...prev.metrics]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, metrics: next }
    })

  const removeMetric = index =>
    setResumeForm(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, idx) => idx !== index),
    }))

  const addExperience = () =>
    setResumeForm(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { role: '', company: '', location: '', period: '', bulletsText: '' },
      ],
    }))

  const updateExperience = (index, key, value) =>
    setResumeForm(prev => {
      const next = [...prev.experience]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, experience: next }
    })

  const removeExperience = index =>
    setResumeForm(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }))

  const addEducation = () =>
    setResumeForm(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', period: '', bulletsText: '' },
      ],
    }))

  const updateEducation = (index, key, value) =>
    setResumeForm(prev => {
      const next = [...prev.education]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, education: next }
    })

  const removeEducation = index =>
    setResumeForm(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }))

  const addCertification = () =>
    setResumeForm(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '' }],
    }))

  const updateCertification = (index, key, value) =>
    setResumeForm(prev => {
      const next = [...prev.certifications]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, certifications: next }
    })

  const removeCertification = index =>
    setResumeForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index),
    }))

  // ---- CRUD handlers with Activity POST ----
  const onSubmit = async () => {
    // required checks omitted
    try {
        const payload = {
          ...formData,
          languages: formData.languages.split(',').map(s => s.trim()),
          tags:      formData.tags.split(',').map(s => s.trim()),
        };

        if (editMode) {
        // 1) Update project
        const { data: updated } = await apiClient.put(
          `/api/projects/${current.id}`,
          payload
        );
        const normalizedUpdated = normalizeProject(updated);
        toaster.create({ title: 'Project updated', type: 'success', closable: true });

        // 2) Compute a simple list of changed fields
        const changed = Object.keys(payload).filter(key => {
          // JSON.stringify for arrays/objects
          return JSON.stringify(payload[key]) !== JSON.stringify(current[key]);
        });

        // 3) Post an “Updated” activity
        await apiClient.post('/api/activities', {
          projectId: normalizedUpdated.id,
          type:      'Updated',
          title:     normalizedUpdated.title,
          detail:    changed.length
            ? `Changed: ${changed.join(', ')}`
            : '',
        });

      } else {
        // 1) Create project
        const { data: created } = await apiClient.post('/api/projects', payload);
        const normalizedCreated = normalizeProject(created);
        toaster.create({ title: 'Project created', type: 'success', closable: true });

        // 2) Log the creation
        await apiClient.post('/api/activities', {
          projectId: normalizedCreated.id,
          type:      'Created',
          title:     normalizedCreated.title,
          detail:    `Added a new project ${normalizedCreated.title}, Category: ${normalizedCreated.category}; Languages: ${normalizedCreated.languages.join(', ')}; Status: ${normalizedCreated.status}`,
        });
      }

      // Finally, refresh everything
      await fetchActivities();
      await fetchProjects();
      setCreateOpen(false);

    } catch (err) {
      console.error(err);
      toaster.create({ title: 'Error saving project', type: 'error', closable: true });
    }
  };

  const confirmDelete = proj => {
    setToDelete(proj)
    setDeleteOpen(true)
  }
  
  const doDelete = async () => {
    try {
      await apiClient.delete(`/api/projects/${toDelete.id}`)
      toaster.create({ title: 'Project deleted', type: 'success', closable: true })

      // record deletion
      await apiClient.post('/api/activities', {
        projectId: toDelete.id,
        type: 'Deleted',
        title: toDelete.title,
      })

      fetchActivities()
      fetchProjects()
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'Error deleting', type: 'error', closable: true })
    } finally {
      setDeleteOpen(false)
    }
  }


  // FileUploadList remains same
  const FileUploadList = () => {
    const fileUpload = useFileUploadContext()
    const files = fileUpload.acceptedFiles
    if (!files.length) return null
    return (
      <FileUpload.ItemGroup>
        {files.map(file => (
          <FileUpload.Item key={file.name} file={file} boxSize="20" p="2">
            <FileUpload.ItemPreviewImage />
            <Float placement="top-end">
              <FileUpload.ItemDeleteTrigger boxSize="4" layerStyle="fill.solid">
                <RiImageAddLine />
              </FileUpload.ItemDeleteTrigger>
            </Float>
          </FileUpload.Item>
        ))}
      </FileUpload.ItemGroup>
    )
  }

// ── KPIs & lists ─────────────────────────────────────────────────────────────
  const mostViewedProject = useMemo(() => {
    if (!projects.length) return null
    return [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
  }, [projects])

  const mostViewedMeta = mostViewedProject
    ? `${mostViewedProject.title || 'Untitled'}${mostViewedProject.category ? ` · ${mostViewedProject.category}` : ''}`
    : 'No views yet'

  const kpis = useMemo(() => [
    { label:'Total Projects',    value:projects.length,                                   desc:'all projects', icon:HiFolderOpen, onClick:() => handleProjectFilter('all') },
    { label:'Active Projects',   value:projects.filter(p=>isInProgress(p.status)).length, desc:'in progress', icon:HiPlay,       onClick:() => handleProjectFilter('active') },
    { label:'Most Viewed',       value:mostViewedProject?.views || 0,                     desc:'peak views',   icon:HiEye,       onClick:() => openProjectAnalytics(mostViewedProject), extra: mostViewedMeta },
    { label:'Featured Projects', value:projects.filter(p=>p.featured).length,             desc:'your best',    icon:HiStar,      onClick:() => handleProjectFilter('featured') },
  ], [projects, mostViewedProject, mostViewedMeta, handleProjectFilter, openProjectAnalytics])

  const quickActions = [
    { label:'Add Project',    value:'',              desc:'create new', icon:HiPlus,   onClick:onOpenCreate },
    { label:'Edit Project',   value:projects.length, desc:'modify',     icon:HiPencil, onClick:() => setQuickEditOpen(true) },
    { label:'Delete Project', value:projects.length, desc:'remove',     icon:HiTrash,  onClick:() => setQuickDeleteOpen(true) },
    { label:'View Analytics', value:'',              desc:'charts',     icon:HiEye,    onClick:() => setAnalyticsOpen(true) },
    {
      label:'Edit Resume',
      value:'',
      desc:'about page',
      icon:HiDocumentText,
      onClick:() => {
        fetchResume()
        setResumeOpen(true)
      },
    },
  ]

  const recent = useMemo(
    () => [...projects].sort((a,b)=>new Date(b.createdDate || 0)-new Date(a.createdDate || 0)).slice(0,5),
    [projects],
  )

  const counts = {
    started:  projects.filter(p=>isInProgress(p.status)).length,
    finished: projects.filter(p=>isCompleted(p.status)).length,
    total:    projects.length,
  }

  const getAvgStars = proj => {
    if (!proj) return 0
    if (typeof proj.avgStars === 'number') return proj.avgStars
    const reviews = Array.isArray(proj.reviews) ? proj.reviews : []
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, r) => acc + (r.stars || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  const formatDate = value => (value ? new Date(value).toLocaleDateString() : '—')

  const analytics = useMemo(() => {
    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0)
    const avgViews = projects.length ? Math.round(totalViews / projects.length) : 0
    const featured = projects.filter(p => p.featured).length
    const topViewed = [...projects]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
    return { totalViews, avgViews, featured, topViewed }
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'active') {
      return projects.filter(p => isInProgress(p.status))
    }
    if (projectFilter === 'featured') {
      return projects.filter(p => p.featured)
    }
    return projects
  }, [projects, projectFilter])

  const projectFilterLabel =
    projectFilter === 'active' ? 'Active' :
    projectFilter === 'featured' ? 'Featured' :
    'All'

  const projectPageCount = Math.max(1, Math.ceil(filteredProjects.length / PROJECT_PAGE_SIZE))
  const paginatedProjects = filteredProjects.slice(
    (projectPage - 1) * PROJECT_PAGE_SIZE,
    projectPage * PROJECT_PAGE_SIZE
  )


  // ──────────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN with Fieldset
  // ──────────────────────────────────────────────────────────────────────────────

  // Auth screen
  if (!isAuth) {
    return (
      <>
        <Toaster />
        <Flex height="100vh" align="center" justify="center">
          <Box p={6} bg={bg} borderRadius="md">
            <Fieldset.Root size="md" maxW="sm">
              <Stack mb={4} spaceY={2}>
                <Fieldset.Legend>Admin Login</Fieldset.Legend>
                <Fieldset.HelperText>Enter your admin username and password</Fieldset.HelperText>
              </Stack>
              <Fieldset.Content>
                <Field.Root required>
                  <Field.Label>Username</Field.Label>
                  <Input
                    name="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    px={2}
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Password</Field.Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </Field.Root>
              </Fieldset.Content>
              <Button mt={4} w="full" colorScheme="teal" onClick={handleLogin}>
                Login
              </Button>
            </Fieldset.Root>
          </Box>
        </Flex>
      </>
    )
  }

  // Main UI
  return (
    <>
      <Toaster />
      <Box p={{ base: 4, md: 8 }}>
        <Box
          mb={6}
          p={{ base: 4, md: 5 }}
          bg={dialogBg}
          borderWidth="1px"
          borderColor={dialogBorder}
          borderRadius="lg"
          shadow="sm"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="fg.muted">
                Admin Overview
              </Text>
              <Heading size="lg">Welcome Back!</Heading>
              <Text mt={1} color="fg.muted">Here’s what’s happening with your projects</Text>
            </Box>
            <Stack direction="row" spaceX={3}>
              <Button leftIcon={<HiPlus />} colorScheme="teal" onClick={onOpenCreate}>
                New Project
              </Button>
              <Button variant="outline" borderColor={accent} color={accent} onClick={() => setAnalyticsOpen(true)}>
                View Analytics
              </Button>
            </Stack>
          </Flex>
        </Box>

        {/* KPI Row */}
        <Box mb={8}>
          <DashboardStats statCards={kpis.map(k => ({ ...k, disabled: !k.onClick }))} />
        </Box>

        {/* Activity, Insights, Actions */}
        <SimpleGrid columns={{ base:1, lg:2 }} spaceX={6} spaceY={6} mb={8}>
          {/* Activity Log */}
          <Box
            p={{ base: 4, md: 5 }}
            bg={dialogBg}
            borderWidth="1px"
            borderColor={dialogBorder}
            borderRadius="lg"
            shadow="sm"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Activity Log</Heading>
              <Text fontSize="xs" color="fg.muted">{totalActivities} events</Text>
            </Flex>
            <Flex mb={4} py={2} gap={3} align="center" wrap="wrap">
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder="All"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  bg={bg}
                  px={2}
                  borderRadius={4}
                  height={10}
                  minW={{ base: '100%', md: '160px' }}
                >
                  {[
                    'Created',
                    'Updated',
                    'Deleted',
                  ].map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator/>
              </NativeSelect.Root>
              <Input
                type="date"
                value={filterStart}
                onChange={e => setFilterStart(e.target.value)}
                bg={bg}
                px={3}
                borderRadius={4}
                height={10}
                minW={{ base: '100%', md: '170px' }}
              />
              <Input
                type="date"
                value={filterEnd}
                onChange={e => setFilterEnd(e.target.value)}
                bg={bg}
                px={3}
                borderRadius={4}
                height={10}
                minW={{ base: '100%', md: '170px' }}
              />
              <Stack direction="row" spaceX={3} w={{ base: '100%', md: 'auto' }}>
                <Button
                  size="sm"
                  onClick={() => { setPage(1); fetchActivities() }}
                  bg={accent}
                  borderRadius={4}
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor={accent}
                  color={accent}
                  borderRadius={4}
                  onClick={() => {
                    setFilterType(''); setFilterStart(''); setFilterEnd('');
                    setPage(1); fetchActivities();
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Flex>
            <SimpleGrid columns={1} spaceY={2}>
              {activities.length > 0 ? (
                activities.map(act => (
                  <ActivityCard
                    key={act._id || act.id}
                    type={act.type}
                    title={act.title}
                    timestamp={niceDate(act.timestamp || act.createdAt)}
                    detail={act.detail}
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
                  pageSize={PAGE_SIZE}
                  page={page}
                  onPageChange={setPage}
                />
              </Flex>
            )}
          </Box>

          {/* Insights + Actions */}
          <Stack spaceY={6}>
            <Box
              p={{ base: 4, md: 5 }}
              bg={dialogBg}
              borderWidth="1px"
              borderColor={dialogBorder}
              borderRadius="lg"
              shadow="sm"
            >
              <Heading size="md" mb={4}>Quick Insights</Heading>
              <Stack spaceY={3}>
                <Flex justify="space-between"><Text>Started</Text><Text fontWeight="bold">{counts.started}</Text></Flex>
                <Flex justify="space-between"><Text>Finished</Text><Text fontWeight="bold">{counts.finished}</Text></Flex>
                <Flex justify="space-between"><Text>Total</Text><Text fontWeight="bold">{counts.total}</Text></Flex>
              </Stack>
            </Box>

            <Box
              p={{ base: 4, md: 5 }}
              bg={dialogBg}
              borderWidth="1px"
              borderColor={dialogBorder}
              borderRadius="lg"
              shadow="sm"
            >
              <Heading size="md" mb={4}>Quick Actions</Heading>
              <SimpleGrid columns={{ base:1, sm:2 }} spaceX={4} spaceY={4}>
                {quickActions.map(a => (
                  <ActionCard
                    key={a.label}
                    {...a}
                    disabled={!projects.length && !['Add Project', 'Edit Resume'].includes(a.label)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </Stack>
        </SimpleGrid>

        {/* Project Listing */}
        <Box
          mb={6}
          p={{ base: 4, md: 5 }}
          bg={dialogBg}
          borderWidth="1px"
          borderColor={dialogBorder}
          borderRadius="lg"
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
            <Box>
              <Heading size="lg">Existing Projects</Heading>
              <Text fontSize="sm" color="fg.muted">
                {projects.length} total · Page {projectPage} of {projectPageCount}
              </Text>
            </Box>
            <Button leftIcon={<HiPlus />} colorScheme="teal" onClick={onOpenCreate}>New Project</Button>
          </Flex>
          <Stack spaceY={3}>
            {paginatedProjects.length ? (
              paginatedProjects.map(p=>(
                <Flex
                  key={p._id}
                  p={4}
                  bg={bg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={dialogBorder}
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <Box>
                    <Text fontWeight="bold">{p.title}</Text>
                    <Text fontSize="sm" color="fg.muted">{p.category}</Text>
                  </Box>
                  <Stack direction="row" spaceX={2} spaceY={2}>
                    <Button size="sm" leftIcon={<HiPencil />} onClick={()=>onOpenEdit(p)}>Edit</Button>
                    <Button
                      size="sm"
                      leftIcon={<HiTrash />}
                      bg="status.error"
                      color="white"
                      _hover={{ bg: 'fg.error', color: 'bg.canvas' }}
                      onClick={()=>confirmDelete(p)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Flex>
              ))
            ) : (
              <Text color="fg.muted">No projects yet.</Text>
            )}
          </Stack>
          {projectPageCount > 1 && (
            <Flex justify="center" mt={5}>
              <PaginationControls
                count={projects.length}
                pageSize={PROJECT_PAGE_SIZE}
                page={projectPage}
                onPageChange={setProjectPage}
              />
            </Flex>
          )}
        </Box>        

        {/* Quick Edit Dialog */}
        <Dialog.Root
          placement="center"
          open={isQuickEditOpen}
          onOpenChange={details => setQuickEditOpen(details.open)}
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: '90vw', md: '600px' }}
                maxH="80vh"
                overflowY="auto"
                bg={dialogBg}
                color="fg.default"
                p={{ base: 4, md: 6 }}
                rounded="lg"
                shadow="xl"
                borderWidth="1px"
                borderColor={dialogBorder}
              >
                <Dialog.Header
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                  pb={3}
                  borderBottomWidth="1px"
                  borderColor={dialogBorder}
                >
                  <Dialog.Title fontSize="xl" fontWeight="bold">
                    Choose a Project to Edit
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      borderWidth="1px"
                      borderColor={dialogBorder}
                      _hover={{ bg: closeHoverBg }}
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body px={0}>
                  <Stack spaceY={3}>
                    {projects.length ? (
                      projects.map(p => (
                        <Flex key={p._id} p={3} bg={bg} borderRadius="md" justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="bold">{p.title}</Text>
                            <Text fontSize="sm" color="fg.muted">{p.category}</Text>
                          </Box>
                          <Button size="sm" leftIcon={<HiPencil />} onClick={() => {
                            onOpenEdit(p)
                            setQuickEditOpen(false)
                          }}>
                            Edit
                          </Button>
                        </Flex>
                      ))
                    ) : (
                      <Text color="fg.muted">No projects available.</Text>
                    )}
                  </Stack>
                </Dialog.Body>

                <Dialog.Footer display="flex" justifyContent="flex-end" mt={4}>
                  <Button variant="ghost" onClick={() => setQuickEditOpen(false)}>Close</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Quick Delete Dialog */}
        <Dialog.Root
          placement="center"
          open={isQuickDeleteOpen}
          onOpenChange={details => setQuickDeleteOpen(details.open)}
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: '90vw', md: '600px' }}
                maxH="80vh"
                overflowY="auto"
                bg={dialogBg}
                color="fg.default"
                p={{ base: 4, md: 6 }}
                rounded="lg"
                shadow="xl"
                borderWidth="1px"
                borderColor={dialogBorder}
              >
                <Dialog.Header
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                  pb={3}
                  borderBottomWidth="1px"
                  borderColor={dialogBorder}
                >
                  <Dialog.Title fontSize="xl" fontWeight="bold">
                    Choose a Project to Delete
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      borderWidth="1px"
                      borderColor={dialogBorder}
                      _hover={{ bg: closeHoverBg }}
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body px={0}>
                  <Stack spaceY={3}>
                    {projects.length ? (
                      projects.map(p => (
                        <Flex key={p._id} p={3} bg={bg} borderRadius="md" justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="bold">{p.title}</Text>
                            <Text fontSize="sm" color="fg.muted">{p.category}</Text>
                          </Box>
                          <Button
                            size="sm"
                            leftIcon={<HiTrash />}
                            bg="status.error"
                            color="white"
                            _hover={{ bg: 'fg.error', color: 'bg.canvas' }}
                            onClick={() => {
                              confirmDelete(p)
                              setQuickDeleteOpen(false)
                            }}
                          >
                            Delete
                          </Button>
                        </Flex>
                      ))
                    ) : (
                      <Text color="fg.muted">No projects available.</Text>
                    )}
                  </Stack>
                </Dialog.Body>

                <Dialog.Footer display="flex" justifyContent="flex-end" mt={4}>
                  <Button variant="ghost" onClick={() => setQuickDeleteOpen(false)}>Close</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Resume Dialog */}
        <Dialog.Root
          placement="center"
          open={isResumeOpen}
          onOpenChange={details => setResumeOpen(details.open)}
          scrollBehavior="inside"
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: '98vw', md: '1100px', lg: '1200px' }}
                maxW="none"
                minW={{ md: '900px' }}
                maxH="88vh"
                overflowY="auto"
                bg={dialogBg}
                color="fg.default"
                p={{ base: 5, md: 8 }}
                rounded="lg"
                shadow="xl"
                borderWidth="1px"
                borderColor={dialogBorder}
              >
                <Dialog.Header
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                  pb={3}
                  borderBottomWidth="1px"
                  borderColor={dialogBorder}
                >
                  <Dialog.Title fontSize="2xl" fontWeight="bold">
                    Resume Editor
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      borderWidth="1px"
                      borderColor={dialogBorder}
                      _hover={{ bg: closeHoverBg }}
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body px={0}>
                  {resumeLoading ? (
                    <Text color="fg.muted">Loading resume...</Text>
                  ) : (
                    <Fieldset.Root size="lg">
                      <Fieldset.Content gap={4}>
                        <Field.Root>
                          <Field.Label>Headline</Field.Label>
                          <Input
                            value={resumeForm.headline}
                            onChange={(e) =>
                              setResumeForm(prev => ({ ...prev, headline: e.target.value }))
                            }
                            px={3}
                            py={2}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>Summary</Field.Label>
                          <Textarea
                            value={resumeForm.summary}
                            onChange={(e) =>
                              setResumeForm(prev => ({ ...prev, summary: e.target.value }))
                            }
                            px={3}
                            py={2}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>Highlights (one per line)</Field.Label>
                          <Textarea
                            value={resumeForm.highlightsText}
                            onChange={(e) =>
                              setResumeForm(prev => ({ ...prev, highlightsText: e.target.value }))
                            }
                            px={3}
                            py={2}
                          />
                        </Field.Root>

                        <Box>
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text fontWeight="bold">Metrics</Text>
                            <Button size="xs" onClick={addMetric}>Add</Button>
                          </Flex>
                          <Stack spaceY={4}>
                            {resumeForm.metrics.map((metric, idx) => (
                              <Box key={`metric-${idx}`} p={4} bg={bg} borderRadius="md">
                                <SimpleGrid columns={{ base: 1, md: 4 }} gap={5} alignItems="center">
                                  <Input
                                    placeholder="Label"
                                    value={metric.label}
                                    onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                                    px={3}
                                    py={2}
                                  />
                                  <Input
                                    placeholder="Value"
                                    value={metric.value}
                                    onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                                    px={3}
                                    py={2}
                                  />
                                  <Input
                                    placeholder="Note"
                                    value={metric.note}
                                    onChange={(e) => updateMetric(idx, 'note', e.target.value)}
                                    px={3}
                                    py={2}
                                  />
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => removeMetric(idx)}
                                  >
                                    Remove
                                  </Button>
                                </SimpleGrid>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text fontWeight="bold">Experience</Text>
                            <Button size="xs" onClick={addExperience}>Add</Button>
                          </Flex>
                          <Stack spaceY={5}>
                            {resumeForm.experience.map((item, idx) => (
                              <Box key={`exp-${idx}`} p={5} bg={bg} borderRadius="md">
                                <Flex justify="space-between" align="center" mb={3}>
                                  <Text fontWeight="bold">Entry {idx + 1}</Text>
                                  <Button size="xs" variant="ghost" onClick={() => removeExperience(idx)}>
                                    Remove
                                  </Button>
                                </Flex>
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                  <Field.Root>
                                    <Field.Label>Role</Field.Label>
                                    <Input
                                      value={item.role}
                                      onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                  <Field.Root>
                                    <Field.Label>Company</Field.Label>
                                    <Input
                                      value={item.company}
                                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                  <Field.Root>
                                    <Field.Label>Location</Field.Label>
                                    <Input
                                      value={item.location}
                                      onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                  <Field.Root>
                                    <Field.Label>Period</Field.Label>
                                    <Input
                                      value={item.period}
                                      onChange={(e) => updateExperience(idx, 'period', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                </SimpleGrid>
                                <Field.Root mt={3}>
                                  <Field.Label>Highlights (one per line)</Field.Label>
                                  <Textarea
                                    value={item.bulletsText}
                                    onChange={(e) =>
                                      updateExperience(idx, 'bulletsText', e.target.value)
                                    }
                                    px={3}
                                    py={2}
                                  />
                                </Field.Root>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text fontWeight="bold">Education</Text>
                            <Button size="xs" onClick={addEducation}>Add</Button>
                          </Flex>
                          <Stack spaceY={5}>
                            {resumeForm.education.map((item, idx) => (
                              <Box key={`edu-${idx}`} p={5} bg={bg} borderRadius="md">
                                <Flex justify="space-between" align="center" mb={3}>
                                  <Text fontWeight="bold">Entry {idx + 1}</Text>
                                  <Button size="xs" variant="ghost" onClick={() => removeEducation(idx)}>
                                    Remove
                                  </Button>
                                </Flex>
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                  <Field.Root>
                                    <Field.Label>School</Field.Label>
                                    <Input
                                      value={item.school}
                                      onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                  <Field.Root>
                                    <Field.Label>Degree</Field.Label>
                                    <Input
                                      value={item.degree}
                                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                  <Field.Root>
                                    <Field.Label>Period</Field.Label>
                                    <Input
                                      value={item.period}
                                      onChange={(e) => updateEducation(idx, 'period', e.target.value)}
                                      px={3}
                                      py={2}
                                    />
                                  </Field.Root>
                                </SimpleGrid>
                                <Field.Root mt={3}>
                                  <Field.Label>Highlights (one per line)</Field.Label>
                                  <Textarea
                                    value={item.bulletsText}
                                    onChange={(e) =>
                                      updateEducation(idx, 'bulletsText', e.target.value)
                                    }
                                    px={3}
                                    py={2}
                                  />
                                </Field.Root>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text fontWeight="bold">Certifications</Text>
                            <Button size="xs" onClick={addCertification}>Add</Button>
                          </Flex>
                          <Stack spaceY={4}>
                            {resumeForm.certifications.map((item, idx) => (
                              <Box key={`cert-${idx}`} p={4} bg={bg} borderRadius="md">
                                <SimpleGrid columns={{ base: 1, md: 4 }} gap={5} alignItems="center">
                                  <Input
                                    placeholder="Name"
                                    value={item.name}
                                    onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                                    px={3}
                                    py={2}
                                  />
                                  <Input
                                    placeholder="Issuer"
                                    value={item.issuer}
                                    onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                                    px={3}
                                    py={2}
                                  />
                                  <Input
                                    placeholder="Year"
                                    value={item.year}
                                    onChange={(e) => updateCertification(idx, 'year', e.target.value)}
                                    px={3}
                                    py={2}
                                  />
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => removeCertification(idx)}
                                  >
                                    Remove
                                  </Button>
                                </SimpleGrid>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Field.Root>
                          <Field.Label>Primary Skills (one per line)</Field.Label>
                          <Textarea
                            value={resumeForm.skillsPrimaryText}
                            onChange={(e) =>
                              setResumeForm(prev => ({ ...prev, skillsPrimaryText: e.target.value }))
                            }
                            px={3}
                            py={2}
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Secondary Skills (one per line)</Field.Label>
                          <Textarea
                            value={resumeForm.skillsSecondaryText}
                            onChange={(e) =>
                              setResumeForm(prev => ({ ...prev, skillsSecondaryText: e.target.value }))
                            }
                            px={3}
                            py={2}
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Tools (one per line)</Field.Label>
                          <Textarea
                            value={resumeForm.skillsToolsText}
                            onChange={(e) =>
                              setResumeForm(prev => ({ ...prev, skillsToolsText: e.target.value }))
                            }
                            px={3}
                            py={2}
                          />
                        </Field.Root>
                      </Fieldset.Content>
                    </Fieldset.Root>
                  )}
                </Dialog.Body>

                <Dialog.Footer display="flex" justifyContent="flex-end" mt={4} gap={3}>
                  <Button variant="solid" onClick={saveResume}>
                    Save Resume
                  </Button>
                  <Button variant="ghost" onClick={() => setResumeOpen(false)}>Cancel</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Analytics Dialog */}
        <Dialog.Root
          placement="center"
          open={isAnalyticsOpen}
          onOpenChange={details => setAnalyticsOpen(details.open)}
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: '90vw', md: '700px' }}
                maxH="80vh"
                overflowY="auto"
                bg={dialogBg}
                color="fg.default"
                p={{ base: 4, md: 6 }}
                rounded="lg"
                shadow="xl"
                borderWidth="1px"
                borderColor={dialogBorder}
              >
                <Dialog.Header
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                  pb={3}
                  borderBottomWidth="1px"
                  borderColor={dialogBorder}
                >
                  <Dialog.Title fontSize="xl" fontWeight="bold">
                    Project Analytics
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      borderWidth="1px"
                      borderColor={dialogBorder}
                      _hover={{ bg: closeHoverBg }}
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body px={0}>
                  {projects.length ? (
                    <>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spaceX={4} spaceY={4} mb={6}>
                        <Box p={4} bg={bg} borderRadius="md">
                          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">
                            Total Views
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold">{analytics.totalViews}</Text>
                        </Box>
                        <Box p={4} bg={bg} borderRadius="md">
                          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">
                            Average Views
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold">{analytics.avgViews}</Text>
                        </Box>
                        <Box p={4} bg={bg} borderRadius="md">
                          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">
                            Featured Projects
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold">{analytics.featured}</Text>
                        </Box>
                        <Box p={4} bg={bg} borderRadius="md">
                          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">
                            Total Projects
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold">{projects.length}</Text>
                        </Box>
                      </SimpleGrid>

                      <Heading size="sm" mb={3}>Top Viewed Projects</Heading>
                      <Stack spaceY={2}>
                        {analytics.topViewed.map(p => (
                          <Flex key={p._id} p={3} bg={bg} borderRadius="md" justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="bold">{p.title}</Text>
                              <Text fontSize="sm" color="fg.muted">{p.category}</Text>
                            </Box>
                            <Text fontWeight="bold" color={accent}>{p.views || 0}</Text>
                          </Flex>
                        ))}
                      </Stack>
                    </>
                  ) : (
                    <Text color="fg.muted">No projects available.</Text>
                  )}
                </Dialog.Body>

                <Dialog.Footer display="flex" justifyContent="flex-end" mt={4}>
                  <Button variant="ghost" onClick={() => setAnalyticsOpen(false)}>Close</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        <Dialog.Root
          placement="center"
          open={isCreateOpen}
          onOpenChange={details => setCreateOpen(details.open)}
          scrollBehavior="inside"
          px={2}
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: '90vw', md: '600px' }}
                maxH="85vh"
                overflowY="auto"
                bg={dialogBg}
                color="fg.default"
                p={{ base: 4, md: 6 }}
                rounded="lg"
                shadow="xl"
                borderWidth="1px"
                borderColor={dialogBorder}
              >
                <Dialog.Header
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                  pb={3}
                  borderBottomWidth="1px"
                  borderColor={dialogBorder}
                >
                  <Dialog.Title fontSize="2xl" fontWeight="bold">
                    {editMode ? 'Edit Project' : 'New Project'}
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      borderWidth="1px"
                      borderColor={dialogBorder}
                      _hover={{ bg: closeHoverBg }}
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body px={0}>
                  <Fieldset.Root size="lg" maxW="2xl">
                    <Fieldset.Content>
                      {/* Title & Description */}
                      <Field.Root required>
                        <Field.Label>Project Title</Field.Label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={onChange}
                          px={2}
                        />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Project Description</Field.Label>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={onChange}
                          px={2}
                          aria-label="Project Description"
                        />
                      </Field.Root>

                      {/* Links Row */}
                      <Flex wrap="wrap" gap={2} mb={4}>
                        <Field.Root flex="1">
                          <Field.Label>External Link</Field.Label>
                          <Input
                            name="externalLink"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.externalLink}
                            onChange={onChange}
                            px={2}
                          />
                        </Field.Root>
                        <Field.Root flex="1">
                          <Field.Label>GitHub Link</Field.Label>
                          <Input
                            name="githubLink"
                            type="url"
                            placeholder="https://github.com/..."
                            value={formData.githubLink}
                            onChange={onChange}
                            px={2}
                          />
                        </Field.Root>
                        <Field.Root flex="1">
                          <Field.Label>Live Link</Field.Label>
                          <Input
                            name="liveDemoLink"
                            type="url"
                            placeholder="https://live-demo.com"
                            value={formData.liveDemoLink}
                            onChange={onChange}
                            px={2}
                          />
                        </Field.Root>
                      </Flex>

                      {/* Category, Languages, Tags, Status, Date... same pattern as above */}
                      <Field.Root required>
                        <Field.Label htmlFor="category-select">
                          Category
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            id="category-select"
                            name="category"
                            value={formData.category}
                            onChange={onChange}
                            paddingX={2}
                          >
                            <option value="" disabled>
                              Select a category…
                            </option>
                            {[
                              'Web Development',
                              'Data Analysis',
                              'Machine Learning/AI',
                              'Data Science',
                              'Other',
                            ].map(item => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Languages</Field.Label>
                        <Input name="languages" value={formData.languages} onChange={onChange} paddingX={2} alignContent="center"/>
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Tags</Field.Label>
                        <Input name="tags" value={formData.tags} onChange={onChange} paddingX={2} alignContent="center" />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label htmlFor="status-select">Project Status</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field id="status-select" name="status" value={formData.status} onChange={onChange} paddingX={2} alignContent="center">
                            <option value="" disabled>
                              Select status…
                            </option>
                            {['Not Started','In Progress','Completed'].map(item => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Upload Date</Field.Label>
                        <Input type="date" name="date" value={formData.date} onChange={onChange} paddingX={2} alignContent="center" />
                      </Field.Root>


                      {/* Image Upload & Featured */}
                      <Flex align="center" gap={4}>
                        <Field.Root>
                          <Field.Label>Preview Image</Field.Label>
                          <FileUpload.Root accept="image/*">
                          <FileUpload.HiddenInput
                              aria-label="Select preview image"
                              onChange={async e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setIsUploading(true)
                                try {
                                  const body = new FormData()
                                  body.append('image', file)
                                  const { data } = await apiClient.post('/api/projects/upload', body)
                                  if (!data?.imageUrl) {
                                    throw new Error('Missing imageUrl from upload')
                                  }
                                  setFormData(fd => ({ ...fd, imageUrl: data.imageUrl }))
                                } catch (err) {
                                  console.error(err)
                                  toaster.create({
                                    title: 'Image upload failed',
                                    type: 'error',
                                    closable: true,
                                  })
                                } finally {
                                  setIsUploading(false)
                                }
                              }}
                            />
                            <FileUpload.Trigger asChild>
                              <Button size="sm" variant="outline" aria-label="Upload image">
                                <RiImageAddLine />
                              </Button>
                            </FileUpload.Trigger>
                            <FileUploadList />
                          </FileUpload.Root>
                        </Field.Root>

                        <Field.Root>
                          <Checkbox.Root
                            name="featured"
                            checked={formData.featured}
                            onCheckedChange={val => {
                              // Radix/Chakra sometimes gives you { checked: true }
                              const bool = typeof val === 'boolean'
                                ? val
                                : Boolean(val?.checked);
                              setFormData(fd => ({ ...fd, featured: bool }));
                            }}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Featured?</Checkbox.Label>
                          </Checkbox.Root>
                        </Field.Root>
                      </Flex>
                    </Fieldset.Content>
                  </Fieldset.Root>
                </Dialog.Body>

                <Dialog.Footer display="flex" justifyContent="flex-end" mt={4} gap={3}>
                  <Dialog.ActionTrigger asChild>
                    <Button onClick={onSubmit} variant="solid" isDisabled={isUploading}>
                      {editMode ? 'Update' : 'Create'}
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button onClick={() => setCreateOpen(false)} variant="ghost">Cancel</Button>
                </Dialog.Footer>

              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>


        {/* Delete Confirmation Dialog */}
        <Dialog.Root
          open={isDeleteOpen}
          onOpenChange={details => setDeleteOpen(details.open)}
          placement="center"
          role="alertdialog"
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete Project?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  Are you sure you want to delete “{toDelete?.title}”?
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <Button ref={cancelRef}>Cancel</Button>
                  </Dialog.CloseTrigger>
                  <Dialog.ActionTrigger asChild>
                  <Button
                    bg="status.error"
                    color="white"
                    _hover={{ bg: 'fg.error', color: 'bg.canvas' }}
                    onClick={doDelete}
                  >
                    Delete
                  </Button>
                  </Dialog.ActionTrigger>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Box>
    </>
  )
}
