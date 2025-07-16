// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
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
  Checkbox,
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
} from '@chakra-ui/react'

import { useColorMode } from '../../components/Theme/color-mode'
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
import { RiImageAddLine } from "react-icons/ri";


// ────────────────────────────────────────────────────────────────────────────────
// StatCard now uses useColorMode to compute its colors
// ────────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, desc, icon: IconComp, onClick, disabled }) => {
  const { colorMode } = useColorMode()
  const accent  = colorMode === 'light' ? 'teal.500'     : 'teal.300'
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
  // for <Toaster />
  // ──────────────────────────────────────────────────────────────────────────────
  // color mode for background
  const { colorMode } = useColorMode()
  const bg = colorMode === 'light' ? 'gray.100' : 'whiteAlpha.100'

  // auth & session
  const [isAuth, setIsAuth]     = useState(false)
  const [password, setPassword] = useState('')

  // projects & form state
  const [projects, setProjects]       = useState([])
  const [loading,  setLoading]        = useState(true)
  const [error,    setError]          = useState('')
  const [editMode, setEditMode]       = useState(false)
  const [current,  setCurrent]        = useState(null)
  const [formData, setFormData]       = useState({
    title:'',description:'',externalLink:'',githubLink:'',
    liveDemoLink:'',imageUrl:'',category:'',languages:'',
    status:'',tags:'',date:'',featured:false,
  })

  // dialog state
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const cancelRef = useRef()
  const [toDelete, setToDelete] = useState(null)

  // ── fetchProjects ─────────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/projects')
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

  const FileUploadList = () => {
  const fileUpload = useFileUploadContext()
  const files = fileUpload.acceptedFiles
  if (files.length === 0) return null
  return (
    <FileUpload.ItemGroup>
      {files.map((file) => (
        <FileUpload.Item
          w="auto"
          boxSize="20"
          p="2"
          file={file}
          key={file.name}
        >
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

  // ── session check on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const auth = sessionStorage.getItem('isAdminAuthenticated')
    const time = sessionStorage.getItem('loginTime')
    if (auth && time && Date.now() - +time < 30 * 60_000) {
      setIsAuth(true)
      fetchProjects()
    } else {
      sessionStorage.clear()
    }
  }, [])

  // ── inactivity timeout (15m) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuth) return
    let tid
    const reset = () => {
      clearTimeout(tid)
      tid = setTimeout(() => {
        sessionStorage.clear()
        setIsAuth(false)
      }, 15 * 60_000)
    }
    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    reset()
    return () => {
      clearTimeout(tid)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [isAuth])

  // ── form change ───────────────────────────────────────────────────────────────
  const onChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // ── open create ───────────────────────────────────────────────────────────────
  const onOpenCreate = () => {
    setEditMode(false)
    setCurrent(null)
    setFormData({
      title:'',description:'',externalLink:'',githubLink:'',
      liveDemoLink:'',imageUrl:'',category:'',languages:'',
      status:'',tags:'',date:'',featured:false,
    })
    setCreateOpen(true)
  }

  // ── open edit ─────────────────────────────────────────────────────────────────
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

  // ── submit create/update ──────────────────────────────────────────────────────
  const onSubmit = async () => {
    try {
      const payload = {
        ...formData,
        languages: formData.languages.split(',').map(s=>s.trim()),
        tags:       formData.tags.split(',').map(s=>s.trim()),
        date:       new Date(formData.date),
      }
      const headers = { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET }
      if (editMode) {
        await axios.put(`/api/projects/${current._id}`, payload, { headers })
        toaster.create({ title:'Project updated', type:'success', closable:true, duration:3000 })
      } else {
        await axios.post('/api/projects', payload, { headers })
        toaster.create({ title:'Project created', type:'success', closable:true, duration:3000 })
      }
      fetchProjects()
      setCreateOpen(false)
    } catch {
      toaster.create({ title:'Error saving project', type:'error', closable:true, duration:5000 })
    }
  }

  // ── delete flows ──────────────────────────────────────────────────────────────
  const confirmDelete = proj => {
    setToDelete(proj)
    setDeleteOpen(true)
  }
  const doDelete = async () => {
    try {
      await axios.delete(`/api/projects/${toDelete._id}`, {
        headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
      })
      toaster.create({ title:'Project deleted', type:'success', closable:true, duration:3000 })
      fetchProjects()
    } catch {
      toaster.create({ title:'Error deleting', type:'error', closable:true, duration:5000 })
    } finally {
      setDeleteOpen(false)
    }
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
  if (!isAuth) {
    return (
      <>
        <Toaster />
        <Flex height="100vh" align="center" justify="center">
          <Box p={6} bg={bg} borderRadius="md">
            <Fieldset.Root size="md" maxW="sm">
              <Stack spaceX={2} spaceY={2} mb={4}>
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
                    onChange={e=>setPassword(e.target.value)}
                  />
                </Field.Root>
              </Fieldset.Content>

              <Button
                mt={4}
                w="full"
                colorScheme="teal"
                onClick={() => {
                  if (password === import.meta.env.VITE_ADMIN_SECRET) {
                    sessionStorage.setItem('isAdminAuthenticated','true')
                    sessionStorage.setItem('loginTime', String(Date.now()))
                    setIsAuth(true)
                    fetchProjects()
                  } else {
                    toaster.create({ title:'Wrong password', type:'error', closable:true, duration:3000 })
                  }
                }}
              >
                Login
              </Button>
            </Fieldset.Root>
          </Box>
        </Flex>
      </>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // MAIN DASHBOARD UI
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster />

      <Box p={{ base:4, md:8 }}>
        <Heading mb={1}>Welcome Back!</Heading>
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
          <Box>
            <Heading size="md" mb={4}>Recent Activity</Heading>
            <VStack spaceY={4} align="stretch">
              {recent.length
                ? recent.map(p=>(
                    <Box key={p._id} p={4} bg={bg} borderRadius="md">
                      <Flex justify="space-between" mb={2}>
                        <Text fontWeight="medium">{p.title}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(p.date).toLocaleString(undefined,{
                            month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
                          })}
                        </Text>
                      </Flex>
                      <Text fontSize="xs" color="gray.400">{p.description||'No details'}</Text>
                    </Box>
                  ))
                : <Text color="gray.500">No recent activity.</Text>
              }
            </VStack>
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

        {/*Create dialog to add, edit and delete projects */}
        <Dialog.Root placement="center" open={isCreateOpen} onOpenChange={setCreateOpen} scrollBehavior="inside" px={2}>          
          <Portal>
            <Dialog.Backdrop  />
            <Dialog.Positioner>
              <Dialog.Content
                w={{ base: "90vw", md: "600px" }}
                maxH="85vh"
                overflowY="auto"
                // theming
                bg={colorMode === "light" ? "white" : "gray.700"}
                color={colorMode === "light" ? "gray.800" : "whiteAlpha.900"}
                // decoration
                p={{ base: 4, md: 6 }}
                rounded="lg"
                shadow="lg"
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.300"}
                >
                <Dialog.Header display="flex" justifyContent="space-between" mb={4}>
                  <Dialog.Title fontSize="2xl" fontWeight="bold">{editMode ? 'Edit Project' : 'New Project'}</Dialog.Title>
                </Dialog.Header>


                <Dialog.Body px={0}>
                  <Fieldset.Root size="lg" maxW="2xl">
                    <Fieldset.Content>
                      <Field.Root required>
                        <Field.Label>Project Title</Field.Label>
                        <Input name="title" value={formData.title} onChange={onChange} paddingX={2} alignContent="center" />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Project Description</Field.Label>
                        <Textarea name="description" value={formData.description} onChange={onChange} aria-label="Project Description" paddingX={2} alignContent="center"  />
                      </Field.Root>
                      <Flex w="100%" gap={1} wrap="wrap" mb={4}>
                        <Field.Root required>
                          <Field.Label>External Link</Field.Label>
                          <Input
                            id="external-link"
                            type="url"
                            name="externalLink"
                            aria-label="External Link URL"
                            placeholder="https://example.com"
                            value={formData.externalLink}
                            onChange={onChange}
                            paddingX={2}
                            alignContent="center"/>
                        </Field.Root>
                        <Field.Root required>
                          <Field.Label>github Link</Field.Label>
                          <Input
                          id="github-link"
                            type="url"
                            name="githubLink"
                            aria-label="github Link URL"
                            placeholder="https://example.com"
                            value={formData.githubLink}
                            onChange={onChange}
                            paddingX={2}
                            alignContent="center"/>
                        </Field.Root>
                        <Field.Root required>
                          <Field.Label>Live Link</Field.Label>
                          <Input
                            id="live-link"
                            type="url"
                            name="liveDemoLink"
                            aria-label="live Link URL"
                            placeholder="https://example.com"
                            value={formData.liveDemoLink}
                            onChange={onChange}
                            paddingX={2}
                            alignContent="center"/>
                        </Field.Root>
                      </Flex>
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
                          <NativeSelect.Field id="status-select" name="status" value={formData.status} paddingX={2} alignContent="center">
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
                      <Flex>
                        <Field.Root required paddingX={2} pb={2} >
                            <FileUpload.Root id="image-upload" accept="image/png">
                              <FileUpload.HiddenInput
                                aria-label="Upload Preview Image"
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  const url = URL.createObjectURL(file)
                                  setFormData(fd => ({ ...fd, imageUrl: url }))
                                }}
                              />
                              <FileUpload.Trigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  aria-label="Upload Preview Image"
                                  
                                >
                                  <RiImageAddLine /> Upload Preview Image
                                </Button>
                              </FileUpload.Trigger>
                              <FileUploadList />
                            </FileUpload.Root>
                        </Field.Root>
                        <Field.Root required mb={4}>
                          <Checkbox.Root name="featured" isChecked={formData.featured} onChange={onChange} >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Featured</Checkbox.Label>                                                                                  
                          </Checkbox.Root>
                        </Field.Root>
                      </Flex>
                    </Fieldset.Content>
                  </Fieldset.Root>
                </Dialog.Body>
                <Dialog.Footer display="flex" justifyContent="flex-end" mt={4} gap={3}>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="solid" onClick={onSubmit}>
                      {editMode ? 'Update' : 'Create'}
                    </Button>                    
                  </Dialog.ActionTrigger>
                  <Button variant="solid">Cancel</Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" position="absolute" top="4" right="4"/>
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Box>
    </>
  )
}
