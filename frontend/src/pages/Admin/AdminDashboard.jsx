import React, { useState, useEffect, useMemo, useRef } from 'react'
import apiClient from '@/utils/axiosConfig'
import { niceDate } from '@/utils/formatDate'
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

import { useColorMode } from '../../components/Theme/color-mode'
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
} from 'react-icons/hi'
import { RiImageAddLine } from 'react-icons/ri'
import ActivityCard from './activity'


// ────────────────────────────────────────────────────────────────────────────────
// StatCard now uses useColorMode to compute its colors
// ────────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, desc, icon: IconComp, onClick, disabled }) => {
  const { colorMode } = useColorMode()
  const accent  = colorMode === 'light' ? 'brand.700'     : 'brand.500'
  const bg      = colorMode === 'light' ? 'gray.100'      : 'whiteAlpha.100'
  const idleTxt = colorMode === 'light' ? 'gray.700'      : 'whiteAlpha.800'

  return (
    <Box
      p={4}
      bg={bg}
      boxShadow="sm"
      borderRadius="md"
      _hover={{
        boxShadow: !disabled ? 'md' : undefined,
        cursor:    !disabled ? 'pointer' : undefined,
      }}
      onClick={!disabled ? onClick : undefined}
      opacity={disabled ? 0.6 : 1}
    >
      <Text fontSize="md" fontWeight="bold" mb={2}>{label}</Text>
      <Flex align="center" justify="space-between" mb={2}>
        <IconComp size="1.75rem" color={accent} />
        <Text fontSize="2xl" fontWeight="bold" color={accent}>{value}</Text>
      </Flex>
      <Text fontSize="xs" color={idleTxt} opacity={0.7}>{desc}</Text>
    </Box>
  )
}

// ────────────────────────────────────────────────────────────────────────────────
// Main AdminDashboard
// ────────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { colorMode } = useColorMode()
  const accent  = colorMode === 'light' ? 'brand.700'     : 'brand.500'
  const bg      = colorMode === 'light' ? 'gray.100'      : 'whiteAlpha.100'
  const idleTxt = colorMode === 'light' ? 'gray.700'      : 'whiteAlpha.800'

  const [isAuth, setIsAuth] = useState(false)
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
  const cancelRef = useRef()
  const [toDelete, setToDelete] = useState(null)

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
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

// ---- initial load & auth check (run once) ----
   useEffect(() => {
     const auth = sessionStorage.getItem('isAdminAuthenticated')
     const time = sessionStorage.getItem('loginTime')
     const secret = sessionStorage.getItem('adminSecret')
     const cached = localStorage.getItem('activities')
     if (cached) {
       try { setActivities(JSON.parse(cached)) } catch {}
     }

     const restore = async () => {
       if (auth && time && secret && Date.now() - +time < 30 * 60_000) {
         try {
           await apiClient.get('/api/admin/verify', {
             headers: { 'x-admin-secret': secret },
           })
           setIsAuth(true)
           fetchProjects()
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

  const handleLogin = async () => {
    if (!password.trim()) {
      toaster.create({ title: 'Password required', type: 'error', closable: true })
      return
    }
    try {
      await apiClient.get('/api/admin/verify', {
        headers: { 'x-admin-secret': password },
      })
      sessionStorage.setItem('isAdminAuthenticated', 'true')
      sessionStorage.setItem('loginTime', `${Date.now()}`)
      sessionStorage.setItem('adminSecret', password)
      setIsAuth(true)
      fetchProjects()
      setPassword('')
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
      date: proj.date ? new Date(proj.date).toISOString().slice(0,10) : '',
      featured: proj.featured || false,
    })
    setCreateOpen(true)
  }

  // ---- CRUD handlers with Activity POST ----
  const onSubmit = async () => {
    // required checks omitted
    try {
        const payload = {
          ...formData,
          languages: formData.languages.split(',').map(s => s.trim()),
          tags:      formData.tags.split(',').map(s => s.trim()),
          date:      new Date(formData.date),
        };

        if (editMode) {
        // 1) Update project
        const { data: updated } = await apiClient.put(
          `/api/projects/${current._id}`,
          payload
        );
        toaster.create({ title: 'Project updated', type: 'success', closable: true });

        // 2) Compute a simple list of changed fields
        const changed = Object.keys(payload).filter(key => {
          // JSON.stringify for arrays/objects
          return JSON.stringify(payload[key]) !== JSON.stringify(current[key]);
        });

        // 3) Post an “Updated” activity
        await apiClient.post('/api/activities', {
          projectId: updated._id,
          type:      'Updated',
          title:     updated.title,
          detail:    changed.length
            ? `Changed: ${changed.join(', ')}`
            : '',
        });

      } else {
        // 1) Create project
        const { data: created } = await apiClient.post('/api/projects', payload);
        toaster.create({ title: 'Project created', type: 'success', closable: true });

        // 2) Log the creation
        await apiClient.post('/api/activities', {
          projectId: created._id,
          type:      'Created',
          title:     created.title,
          detail:    `Added a new project ${created.title}, Category: ${created.category}; Languages: ${created.languages.join(', ')}; Status: ${created.status}`,
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
      await apiClient.delete(`/api/projects/${toDelete._id}`)
      toaster.create({ title: 'Project deleted', type: 'success', closable: true })

      // record deletion
      await apiClient.post('/api/activities', {
        projectId: toDelete._id,
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
  const kpis = useMemo(() => [
    { label:'Total Projects',    value:projects.length,                                desc:'all projects', icon:HiFolderOpen, onClick:() => {} },
    { label:'Active Projects',   value:projects.filter(p=>p.status==='active').length, desc:'in progress', icon:HiPlay,       onClick:() => {} },
    { label:'Most Viewed',       value:projects.length?Math.max(...projects.map(p=>p.views||0)):0, desc:'peak views', icon:HiEye, onClick:() => {} },
    { label:'Featured Projects', value:projects.filter(p=>p.featured).length,         desc:'your best',    icon:HiStar,      onClick:() => {} },
  ], [projects])

  const quickActions = [
    { label:'Add Project',    value:'',              desc:'create new', icon:HiPlus,   onClick:onOpenCreate },
    { label:'Edit Project',   value:projects.length, desc:'modify',     icon:HiPencil, onClick:()=>{} },
    { label:'Delete Project', value:projects.length, desc:'remove',     icon:HiTrash,  onClick:()=>{} },
    { label:'View Analytics', value:'',              desc:'charts',     icon:HiEye,    onClick:()=>{} },
  ]

  const recent = useMemo(
    () => [...projects].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5),
    [projects],
  )

  const counts = {
    started:  projects.filter(p=>p.status==='active').length,
    finished: projects.filter(p=>p.status==='completed').length,
    total:    projects.length,
  }


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
                <Fieldset.HelperText>Enter your admin password</Fieldset.HelperText>
              </Stack>
              <Fieldset.Content>
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
        <Heading>Welcome Back!</Heading>
        {/* KPI, Recent, Quick Actions, Listing same as before */}
        <Text mb={6} color="gray.400">Here’s what’s happening with your projects</Text>

        {/* KPI Row */}
        <SimpleGrid columns={{ base:1, md:2, lg:4 }} spaceX={6} spaceY={4} mb={8}>
          {kpis.map(k => (
            <StatCard key={k.label} {...k} disabled={!k.onClick} />
          ))}
        </SimpleGrid>

        {/* Recent & Insights */}
        <SimpleGrid columns={{ base:1, md:2 }} spaceX={6} spaceY={4} mb={8}>
          {/* Recent Activity */}
          <Box mb={8}>
            <Heading size="md" mb={4}>Activity Log</Heading>
              <Flex mb={4} py={3} gap={4} align="center" wrap="wrap">
                <SimpleGrid columns={{base:1, md:2, lg: 5}} spaceX={3}>
                  <NativeSelect.Root >
                  <NativeSelect.Field
                    placeholder="All"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    bg={bg} px={2} borderRadius={4} 
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
                      onChange={e => setFilterStart(e.target.value)} bg={bg} px={3} borderRadius={4} height={10}
                    />
                    <Input
                      type="date"
                      value={filterEnd}
                      onChange={e => setFilterEnd(e.target.value)} bg={bg} px={3} borderRadius={4} height={10}
                    />
                    <Button size="sm" onClick={() => { setPage(1); fetchActivities() }} bg={accent} px={2} borderRadius={4}>
                    Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="solid"
                      bg={accent} px={2} borderRadius={4}
                      onClick={() => {
                        setFilterType(''); setFilterStart(''); setFilterEnd('');
                        setPage(1); fetchActivities();
                      }}
                    >
                      Clear
                    </Button>
                </SimpleGrid>
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
                <Text color="gray.500">No activity yet.</Text>
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



          {/* Quick Insights */}
          <Box>
            <Heading size="md" mb={4}>Quick Insights</Heading>
            <Box p={4} bg={bg} borderRadius="md">
              <Stack spaceX={3}>
                <Flex justify="space-between"><Text>Started</Text><Text fontWeight="bold">{counts.started}</Text></Flex>
                <Flex justify="space-between"><Text>Finished</Text><Text fontWeight="bold">{counts.finished}</Text></Flex>
                <Flex justify="space-between"><Text>Total</Text><Text fontWeight="bold">{counts.total}</Text></Flex>
              </Stack>
            </Box>
          </Box>
        </SimpleGrid>

        {/* Quick Actions */}
        <SimpleGrid columns={{ base:1, md:2, lg:4 }} spaceX={6} spaceY={4} mb={8}>
          {quickActions.map(a => (
            <StatCard key={a.label} {...a} />
          ))}
        </SimpleGrid>

        {/* Project Listing */}
        <Box mb={6}>
          <Flex justify="space-between" mb={4}>
            <Heading size="lg">Existing Projects</Heading>
            <Button leftIcon={<HiPlus />} colorScheme="teal" onClick={onOpenCreate}>New Project</Button>
          </Flex>
          <Stack spaceY={3}>
            {projects.map(p=>(
              <Flex
                key={p._id}
                p={4}
                bg={bg}
                borderRadius="md"
                justify="space-between"
              >
                <Box>
                  <Text fontWeight="bold">{p.title}</Text>
                  <Text fontSize="sm" color="gray.500">{p.category}</Text>
                </Box>
                <Stack direction="row" spaceX={2} spaceY={2}>
                  <Button size="sm" leftIcon={<HiPencil />} onClick={()=>onOpenEdit(p)}>Edit</Button>
                  <Button size="sm" leftIcon={<HiTrash />} colorScheme="red" onClick={()=>confirmDelete(p)}>Delete</Button>
                </Stack>
              </Flex>
            ))}
          </Stack>
        </Box>        



        <Button leftIcon={<HiPlus />} colorScheme="teal" onClick={onOpenCreate}>New Project</Button>

        <Dialog.Root placement="center" open={isCreateOpen} onOpenChange={setCreateOpen} scrollBehavior="inside" px={2}>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: '90vw', md: '600px' }}
                maxH="85vh"
                overflowY="auto"
                bg={bg}
                color={colorMode === 'light' ? 'gray.800' : 'whiteAlpha.900'}
                p={{ base: 4, md: 6 }}
                rounded="lg"
                shadow="lg"
                borderWidth="1px"
                borderColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.300'}
              >
                <Dialog.Header display="flex" justifyContent="space-between" mb={4}>
                  <Dialog.Title fontSize="2xl" fontWeight="bold">
                    {editMode ? 'Edit Project' : 'New Project'}
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton />
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
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const url = URL.createObjectURL(file)
                                setFormData(fd => ({ ...fd, imageUrl: url }))
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
                    <Button onClick={onSubmit} variant="solid">
                      {editMode ? 'Update' : 'Create'}
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button onClick={() => setCreateOpen(false)} variant="ghost">Cancel</Button>
                </Dialog.Footer>

                <Dialog.CloseTrigger asChild>
                  <CloseButton position="absolute" top="4" right="4"/>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>


        {/* Delete Confirmation Dialog */}
        <Dialog.Root
          open={isDeleteOpen}
          onOpenChange={setDeleteOpen}
          placement="center"
          role="alertdialog"
        >
          <Portal>
            <Dialog.Backdrop />
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
                    <Button colorScheme="red" onClick={doDelete}>Delete</Button>
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
