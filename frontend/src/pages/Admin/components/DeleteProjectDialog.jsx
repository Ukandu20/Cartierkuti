import React from 'react'
import { Button, ButtonGroup, Dialog, Portal } from '@chakra-ui/react'

export default function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  cancelRef,
  onDelete,
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
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete Project?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Are you sure you want to delete "{project?.title}"?
            </Dialog.Body>
            <Dialog.Footer>
              <ButtonGroup gap={3}>
                <Dialog.CloseTrigger asChild>
                  <Button ref={cancelRef}>Cancel</Button>
                </Dialog.CloseTrigger>
                <Dialog.ActionTrigger asChild>
                  <Button
                    colorPalette="red"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                </Dialog.ActionTrigger>
              </ButtonGroup>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
