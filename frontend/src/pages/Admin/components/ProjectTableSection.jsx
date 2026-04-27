import React from 'react'
import { Box, Button, Dialog, Flex, Portal, CloseButton, Stack, Text } from '@chakra-ui/react'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import PaginationControls from '@/components/pagination/pagination'

const ProjectRow = ({ project, bg, borderColor, onEdit, onDelete, mode = 'full' }) => (
  <Flex
    key={project.id || project._id}
    p={mode === 'full' ? 4 : 3}
    bg={bg}
    borderRadius="md"
    borderWidth={mode === 'full' ? '1px' : undefined}
    borderColor={borderColor}
    justify="space-between"
    align="center"
    wrap="wrap"
    gap={3}
  >
    <Box>
      <Text fontWeight="bold">{project.title}</Text>
      <Text fontSize="sm" color="fg.muted">
        {project.category}
        {project.featured ? ' · Featured' : ''}
      </Text>
    </Box>
    <Stack direction="row" spaceX={2} spaceY={2}>
      {onEdit && (
        <Button size="sm" onClick={() => onEdit(project)}>
          <HiPencil />
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          size="sm"
          colorPalette="red"
          onClick={() => onDelete(project)}
        >
          <HiTrash />
          Delete
        </Button>
      )}
    </Stack>
  </Flex>
)

const ProjectChooserDialog = ({
  open,
  onOpenChange,
  title,
  projects,
  bg,
  dialogBg,
  dialogBorder,
  closeHoverBg,
  action,
  onClose,
}) => (
  <Dialog.Root placement="center" open={open} onOpenChange={onOpenChange}>
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
            <Dialog.Title fontSize="xl" fontWeight="bold">{title}</Dialog.Title>
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
                projects.map((project) => (
                  <ProjectRow
                    key={project.id || project._id}
                    project={project}
                    bg={bg}
                    borderColor={dialogBorder}
                    mode="compact"
                    onEdit={action === 'edit' ? onClose : undefined}
                    onDelete={action === 'delete' ? onClose : undefined}
                  />
                ))
              ) : (
                <Text color="fg.muted">No projects available.</Text>
              )}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer display="flex" justifyContent="flex-end" mt={4}>
            <Button variant="ghost" onClick={() => onOpenChange({ open: false })}>Close</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
)

export default function ProjectTableSection({
  projects,
  paginatedProjects,
  projectPage,
  projectPageCount,
  projectPageSize,
  onProjectPageChange,
  onOpenCreate,
  onOpenEdit,
  onConfirmDelete,
  isQuickEditOpen,
  setQuickEditOpen,
  isQuickDeleteOpen,
  setQuickDeleteOpen,
  bg,
  dialogBg,
  dialogBorder,
  closeHoverBg,
}) {
  return (
    <>
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
            <Text as="h2" fontSize="2xl" fontWeight="bold">Existing Projects</Text>
            <Text fontSize="sm" color="fg.muted">
              {projects.length} total · Page {projectPage} of {projectPageCount}
            </Text>
          </Box>
          <Button colorPalette="teal" onClick={onOpenCreate}>
            <HiPlus />
            New Project
          </Button>
        </Flex>
        <Stack spaceY={3}>
          {paginatedProjects.length ? (
            paginatedProjects.map((project) => (
              <ProjectRow
                key={project.id || project._id}
                project={project}
                bg={bg}
                borderColor={dialogBorder}
                onEdit={onOpenEdit}
                onDelete={onConfirmDelete}
              />
            ))
          ) : (
            <Text color="fg.muted">No projects yet.</Text>
          )}
        </Stack>
        {projectPageCount > 1 && (
          <Flex justify="center" mt={5}>
            <PaginationControls
              count={projects.length}
              pageSize={projectPageSize}
              page={projectPage}
              onPageChange={onProjectPageChange}
            />
          </Flex>
        )}
      </Box>

      <ProjectChooserDialog
        open={isQuickEditOpen}
        onOpenChange={(details) => setQuickEditOpen(details.open)}
        title="Choose a Project to Edit"
        projects={projects}
        bg={bg}
        dialogBg={dialogBg}
        dialogBorder={dialogBorder}
        closeHoverBg={closeHoverBg}
        action="edit"
        onClose={(project) => {
          if (project) onOpenEdit(project)
          setQuickEditOpen(false)
        }}
      />

      <ProjectChooserDialog
        open={isQuickDeleteOpen}
        onOpenChange={(details) => setQuickDeleteOpen(details.open)}
        title="Choose a Project to Delete"
        projects={projects}
        bg={bg}
        dialogBg={dialogBg}
        dialogBorder={dialogBorder}
        closeHoverBg={closeHoverBg}
        action="delete"
        onClose={(project) => {
          if (project) onConfirmDelete(project)
          setQuickDeleteOpen(false)
        }}
      />
    </>
  )
}
