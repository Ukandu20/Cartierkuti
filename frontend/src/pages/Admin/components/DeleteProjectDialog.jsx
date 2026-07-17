import React from 'react'
import { Button, ButtonGroup, Dialog, Portal } from '@chakra-ui/react'
import { dialogContentStyles, dialogFooterStyles, dialogHeaderStyles } from '@/components/ui/DesignSystem'

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
          <Dialog.Content maxW="440px" mx={4} {...dialogContentStyles}>
            <Dialog.Header {...dialogHeaderStyles}>
              <Dialog.Title>Delete Project?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Are you sure you want to delete "{project?.title}"?
            </Dialog.Body>
            <Dialog.Footer {...dialogFooterStyles}>
              <ButtonGroup gap={3} flexWrap="wrap" w={{ base: 'full', sm: 'auto' }}>
                <Dialog.ActionTrigger asChild>
                  <Button ref={cancelRef} disabled={isDeleting} variant="outline" flex={{ base: 1, sm: 'initial' }}>Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={onDelete}
                  loading={isDeleting}
                  flex={{ base: 1, sm: 'initial' }}
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
