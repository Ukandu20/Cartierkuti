import React from 'react'
import { Button, Dialog, Portal, Text } from '@chakra-ui/react'
import { dialogContentStyles, dialogFooterStyles, dialogHeaderStyles } from '@/components/ui/DesignSystem'

export default function DiscardChangesDialog({ open, onOpenChange, title, description, onKeepEditing, onDiscard }) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        onOpenChange?.(details)
        if (!details.open) onKeepEditing?.()
      }}
      placement="center"
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <Dialog.Positioner p={4}>
          <Dialog.Content maxW="460px" {...dialogContentStyles}>
            <Dialog.Header {...dialogHeaderStyles}>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py={5}>
              <Text color="fg.muted">{description}</Text>
            </Dialog.Body>
            <Dialog.Footer {...dialogFooterStyles}>
              <Button variant="ghost" onClick={onKeepEditing}>Keep editing</Button>
              <Button colorPalette="red" onClick={onDiscard}>Discard changes</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
