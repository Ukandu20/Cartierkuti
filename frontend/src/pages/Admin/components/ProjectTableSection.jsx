import React, { useMemo } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Input,
  Menu,
  NativeSelect,
  Portal,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { HiDotsVertical, HiEye, HiPencil, HiTrash } from 'react-icons/hi'
import PaginationControls from '@/components/pagination/pagination'
import { fieldStyles, interactiveSurfaceStyles, SurfaceCard } from '@/components/ui/DesignSystem'

const statusPalette = (status = '') => {
  const normalized = status.toLowerCase()
  if (normalized.includes('complete') || normalized.includes('finish')) return 'green'
  if (normalized.includes('progress') || normalized.includes('active')) return 'blue'
  return 'gray'
}

const projectDate = (project) => {
  const value = project.lastUpdatedDate || project.updatedAt || project.createdDate || project.createdAt
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const ProjectIdentity = ({ project, compact = false }) => (
  <Flex align="center" gap={3} minW={0}>
    <Box
      boxSize={compact ? '40px' : '44px'}
      flexShrink={0}
      borderRadius="md"
      overflow="hidden"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.subtle"
    >
      {project.imageUrl ? (
        <Image src={project.imageUrl} alt="" boxSize="full" objectFit="cover" />
      ) : (
        <Flex boxSize="full" align="center" justify="center" color="fg.muted" fontWeight="bold">
          {(project.title || 'P').slice(0, 1).toUpperCase()}
        </Flex>
      )}
    </Box>
    <Box minW={0}>
      <Text fontWeight="semibold" lineClamp={1}>{project.title || 'Untitled project'}</Text>
      <Text fontSize="xs" color="fg.muted" lineClamp={1}>{project.category || 'Uncategorized'}</Text>
    </Box>
  </Flex>
)

const ProjectActions = ({ project, onEdit, onDelete, onAnalytics }) => (
  <Menu.Root positioning={{ placement: 'bottom-end' }}>
    <Menu.Trigger asChild>
      <IconButton size="sm" variant="ghost" aria-label={`Actions for ${project.title || 'project'}`}>
        <HiDotsVertical />
      </IconButton>
    </Menu.Trigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content minW="160px">
          <Menu.Item value="edit" onClick={() => onEdit(project)}>
            <HiPencil /> Edit
          </Menu.Item>
          <Menu.Item value="analytics" onClick={() => onAnalytics(project)}>
            <HiEye /> Analytics
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item value="delete" color="fg.error" onClick={() => onDelete(project)}>
            <HiTrash /> Delete
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
)

const ProjectCard = ({ project, onEdit, onDelete, onAnalytics }) => (
  <Box p={4} {...interactiveSurfaceStyles}>
    <Flex justify="space-between" align="flex-start" gap={3}>
      <ProjectIdentity project={project} compact />
      <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} onAnalytics={onAnalytics} />
    </Flex>
    <Flex mt={4} gap={2} wrap="wrap">
      <Badge colorPalette={statusPalette(project.status)} variant="subtle">{project.status || 'Not set'}</Badge>
      {project.featured && <Badge colorPalette="yellow" variant="subtle">Featured</Badge>}
    </Flex>
    <Flex mt={4} pt={3} borderTopWidth="1px" borderColor="border.subtle" justify="space-between" gap={4}>
      <Box><Text fontSize="xs" color="fg.muted">Views</Text><Text fontWeight="semibold">{project.views || 0}</Text></Box>
      <Box textAlign="right"><Text fontSize="xs" color="fg.muted">Updated</Text><Text fontSize="sm" fontWeight="medium">{projectDate(project)}</Text></Box>
    </Flex>
  </Box>
)

export default function ProjectTableSection({
  projects,
  paginatedProjects,
  filteredProjectCount,
  projectPage,
  projectPageCount,
  projectPageSize,
  onProjectPageChange,
  onOpenEdit,
  onConfirmDelete,
  onOpenAnalytics,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onClearFilters,
  dialogBg,
  dialogBorder,
}) {
  const categories = useMemo(
    () => [...new Set(projects.map((project) => project.category).filter(Boolean))].sort(),
    [projects],
  )
  const hasFilters = Boolean(search || statusFilter !== 'all' || categoryFilter !== 'all')

  return (
    <SurfaceCard
      as="section"
      aria-labelledby="admin-projects-heading"
      mb={8}
      borderColor={dialogBorder}
      overflow="hidden"
    >
      <Flex p={{ base: 4, md: 5 }} justify="space-between" align="center" wrap="wrap" gap={3} borderBottomWidth="1px" borderColor={dialogBorder}>
        <Box>
          <Text as="h2" id="admin-projects-heading" fontSize="xl" fontWeight="bold">Projects</Text>
          <Text fontSize="sm" color="fg.muted">{filteredProjectCount} of {projects.length} projects</Text>
        </Box>
      </Flex>

      <Flex p={{ base: 4, md: 5 }} gap={3} align="center" wrap="wrap" bg="bg.subtle">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects…"
          aria-label="Search projects"
          bg={dialogBg}
          {...fieldStyles}
          maxW={{ base: '100%', md: '320px' }}
        />
        <NativeSelect.Root maxW={{ base: '100%', sm: '190px' }}>
          <NativeSelect.Field value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} {...fieldStyles} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root maxW={{ base: '100%', sm: '210px' }}>
          <NativeSelect.Field value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)} {...fieldStyles} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        {hasFilters && <Button size="sm" variant="ghost" onClick={onClearFilters}>Clear filters</Button>}
      </Flex>

      {paginatedProjects.length ? (
        <>
          <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader pl={5}>Project</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Featured</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Views</Table.ColumnHeader>
                  <Table.ColumnHeader>Updated</Table.ColumnHeader>
                  <Table.ColumnHeader width="56px"><Text srOnly>Actions</Text></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedProjects.map((project) => (
                  <Table.Row key={project.id || project._id}>
                    <Table.Cell pl={5} minW="240px"><ProjectIdentity project={project} /></Table.Cell>
                    <Table.Cell><Badge colorPalette={statusPalette(project.status)} variant="subtle">{project.status || 'Not set'}</Badge></Table.Cell>
                    <Table.Cell>{project.featured ? <Badge colorPalette="yellow" variant="subtle">Featured</Badge> : <Text color="fg.muted">—</Text>}</Table.Cell>
                    <Table.Cell textAlign="end" fontWeight="medium">{project.views || 0}</Table.Cell>
                    <Table.Cell whiteSpace="nowrap">{projectDate(project)}</Table.Cell>
                    <Table.Cell><ProjectActions project={project} onEdit={onOpenEdit} onDelete={onConfirmDelete} onAnalytics={onOpenAnalytics} /></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          <Stack display={{ base: 'flex', md: 'none' }} p={4} gap={3} bg="bg.subtle">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id || project._id} project={project} onEdit={onOpenEdit} onDelete={onConfirmDelete} onAnalytics={onOpenAnalytics} />
            ))}
          </Stack>
        </>
      ) : (
        <Box py={12} px={5} textAlign="center">
          <Text fontWeight="semibold">{hasFilters ? 'No projects match these filters.' : 'No projects yet.'}</Text>
          <Text mt={1} fontSize="sm" color="fg.muted">{hasFilters ? 'Try changing or clearing the filters.' : 'Create your first project to get started.'}</Text>
          {hasFilters && <Button mt={4} size="sm" variant="outline" onClick={onClearFilters}>Clear filters</Button>}
        </Box>
      )}

      {projectPageCount > 1 && (
        <Flex justify="center" p={5} borderTopWidth="1px" borderColor={dialogBorder}>
          <PaginationControls count={filteredProjectCount} pageSize={projectPageSize} page={projectPage} onPageChange={onProjectPageChange} />
        </Flex>
      )}
    </SurfaceCard>
  )
}
