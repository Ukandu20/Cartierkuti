import React from 'react'
import { Button, ButtonGroup, Dialog, Portal } from '@chakra-ui/react'

export default function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  cancelRef,
  onDelete,
  isDeleting,
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      placement="center"
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <Dialog.Positioner>
          <Dialog.Content maxW="440px" mx={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle" shadow="xl">
            <Dialog.Header>
              <Dialog.Title>Delete Project?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Are you sure you want to delete "{project?.title}"?
            </Dialog.Body>
            <Dialog.Footer display="flex" justifyContent="flex-end" gap={3}>
              <ButtonGroup gap={3}>
                <Dialog.ActionTrigger asChild>
                  <Button ref={cancelRef} disabled={isDeleting}>Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={onDelete}
                  loading={isDeleting}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
