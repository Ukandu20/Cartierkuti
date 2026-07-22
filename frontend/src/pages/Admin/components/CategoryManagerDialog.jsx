import React, { useEffect, useState } from 'react'
import { Box, Button, CloseButton, Dialog, Field, Flex, Input, Portal, Spinner, Stack, Text } from '@chakra-ui/react'
import { dialogContentStyles, dialogFooterStyles, dialogHeaderStyles } from '@/components/ui/DesignSystem'

const aliasesText = (category) => (category.aliases || []).join(', ')

export default function CategoryManagerDialog({
  open,
  onOpenChange,
  categories,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [newName, setNewName] = useState('')
  const [drafts, setDrafts] = useState({})
  const [busyId, setBusyId] = useState('')
  const [confirmingId, setConfirmingId] = useState('')

  useEffect(() => {
    setDrafts(Object.fromEntries(categories.map((category) => [category.id || category._id, {
      name: category.name,
      aliases: aliasesText(category),
      order: category.order || 0,
    }])))
  }, [categories])

  const create = async () => {
    if (!newName.trim()) return
    setBusyId('new')
    const saved = await onCreate({ name: newName.trim(), aliases: [], order: categories.length * 10 + 10 })
    if (saved) setNewName('')
    setBusyId('')
  }

  const update = async (category) => {
    const id = category.id || category._id
    const draft = drafts[id]
    if (!draft?.name.trim()) return
    setBusyId(id)
    await onUpdate(id, {
      name: draft.name.trim(),
      aliases: draft.aliases.split(',').map((item) => item.trim()).filter(Boolean),
      order: Number(draft.order) || 0,
    })
    setBusyId('')
  }

  const remove = async (category) => {
    const id = category.id || category._id
    if (confirmingId !== id) {
      setConfirmingId(id)
      return
    }
    setBusyId(id)
    const deleted = await onDelete(id)
    if (deleted) setConfirmingId('')
    setBusyId('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} placement="center" size="lg">
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <Dialog.Positioner p={4}>
          <Dialog.Content maxW="760px" maxH="90dvh" {...dialogContentStyles}>
            <Dialog.Header {...dialogHeaderStyles}>
              <Box>
                <Dialog.Title>Manage categories</Dialog.Title>
                <Text color="fg.muted" fontSize="sm" mt={1}>Add, rename, reorder, or delete unused project categories.</Text>
              </Box>
              <Dialog.CloseTrigger asChild><CloseButton /></Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body overflowY="auto">
              <Stack gap={5}>
                <Field.Root>
                  <Field.Label>New category</Field.Label>
                  <Flex gap={2} align="end">
                    <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Category name" onKeyDown={(event) => event.key === 'Enter' && create()} />
                    <Button colorPalette="brand" onClick={create} loading={busyId === 'new'} disabled={!newName.trim()}>Add</Button>
                  </Flex>
                </Field.Root>

                {loading ? <Spinner alignSelf="center" /> : categories.map((category) => {
                  const id = category.id || category._id
                  const draft = drafts[id] || { name: category.name, aliases: aliasesText(category), order: category.order || 0 }
                  const setDraft = (field, value) => setDrafts((current) => ({ ...current, [id]: { ...draft, [field]: value } }))
                  return (
                    <Stack key={id} gap={3} p={4} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
                      <Flex gap={3} direction={{ base: 'column', md: 'row' }}>
                        <Field.Root required flex="2">
                          <Field.Label>Name</Field.Label>
                          <Input value={draft.name} onChange={(event) => setDraft('name', event.target.value)} />
                        </Field.Root>
                        <Field.Root flex="0 0 100px">
                          <Field.Label>Order</Field.Label>
                          <Input type="number" min="0" value={draft.order} onChange={(event) => setDraft('order', event.target.value)} />
                        </Field.Root>
                      </Flex>
                      <Field.Root>
                        <Field.Label>Aliases</Field.Label>
                        <Input value={draft.aliases} onChange={(event) => setDraft('aliases', event.target.value)} placeholder="Comma-separated legacy names" />
                      </Field.Root>
                      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                        <Text fontFamily="mono" fontSize="xs" color="fg.muted">{category.slug}</Text>
                        <Flex gap={2}>
                          {confirmingId === id ? <Button size="sm" variant="ghost" onClick={() => setConfirmingId('')}>Cancel delete</Button> : null}
                          <Button size="sm" colorPalette="red" variant={confirmingId === id ? 'solid' : 'outline'} onClick={() => remove(category)} loading={busyId === id}>
                            {confirmingId === id ? 'Confirm delete' : 'Delete'}
                          </Button>
                          <Button size="sm" colorPalette="brand" onClick={() => update(category)} loading={busyId === id}>Save</Button>
                        </Flex>
                      </Flex>
                    </Stack>
                  )
                })}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer {...dialogFooterStyles}><Dialog.ActionTrigger asChild><Button variant="outline">Done</Button></Dialog.ActionTrigger></Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
