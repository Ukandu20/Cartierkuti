import React from 'react'
import {
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  Fieldset,
  FileUpload,
  Flex,
  Float,
  Input,
  NativeSelect,
  Portal,
  Textarea,
  useFileUploadContext,
} from '@chakra-ui/react'
import { RiImageAddLine } from 'react-icons/ri'

const FileUploadList = () => {
  const fileUpload = useFileUploadContext()
  const files = fileUpload.acceptedFiles
  if (!files.length) return null
  return (
    <FileUpload.ItemGroup>
      {files.map((file) => (
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

export default function ProjectEditorDialog({
  open,
  onOpenChange,
  editMode,
  formData,
  onChange,
  onSubmit,
  onCancel,
  onUploadImage,
  isUploading,
  setFormData,
  dialogBg,
  dialogBorder,
  closeHoverBg,
}) {
  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
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
                  <Field.Root required>
                    <Field.Label>Project Title</Field.Label>
                    <Input name="title" value={formData.title} onChange={onChange} px={2} />
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

                  <Field.Root required>
                    <Field.Label htmlFor="category-select">Category</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        id="category-select"
                        name="category"
                        value={formData.category}
                        onChange={onChange}
                        paddingX={2}
                      >
                        <option value="" disabled>Select a category...</option>
                        {[
                          'Web Development',
                          'Data Analysis',
                          'Machine Learning/AI',
                          'Data Science',
                          'Other',
                        ].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Languages</Field.Label>
                    <Input name="languages" value={formData.languages} onChange={onChange} paddingX={2} alignContent="center" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Tags</Field.Label>
                    <Input name="tags" value={formData.tags} onChange={onChange} paddingX={2} alignContent="center" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label htmlFor="status-select">Project Status</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        id="status-select"
                        name="status"
                        value={formData.status}
                        onChange={onChange}
                        paddingX={2}
                        alignContent="center"
                      >
                        <option value="" disabled>Select status...</option>
                        {['Not Started', 'In Progress', 'Completed'].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Upload Date</Field.Label>
                    <Input type="date" name="date" value={formData.date} onChange={onChange} paddingX={2} alignContent="center" />
                  </Field.Root>

                  <Flex align="center" gap={4}>
                    <Field.Root>
                      <Field.Label>Preview Image</Field.Label>
                      <FileUpload.Root accept="image/*">
                        <FileUpload.HiddenInput aria-label="Select preview image" onChange={onUploadImage} />
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
                        onCheckedChange={(value) => {
                          const checked = typeof value === 'boolean'
                            ? value
                            : Boolean(value?.checked)
                          setFormData((current) => ({ ...current, featured: checked }))
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
                <Button onClick={onSubmit} variant="solid" disabled={isUploading}>
                  {editMode ? 'Update' : 'Create'}
                </Button>
              </Dialog.ActionTrigger>
              <Button onClick={onCancel} variant="ghost">Cancel</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
