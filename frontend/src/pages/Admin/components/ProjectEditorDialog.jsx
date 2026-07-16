import React from 'react'
import {
  Button,
  ButtonGroup,
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
import { categoryOptions } from '@/utils/projectCategories'

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
  isSaving,
  errors = {},
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
            w={{ base: 'calc(100vw - 16px)', md: '760px' }}
            maxW="760px"
            maxH={{ base: '96vh', md: '90vh' }}
            overflowY="auto"
            bg={dialogBg}
            color="fg.default"
            p={0}
            rounded="lg"
            shadow="xl"
            borderWidth="1px"
            borderColor={dialogBorder}
          >
            <Dialog.Header
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={{ base: 4, md: 6 }}
              py={4}
              position="sticky"
              top={0}
              zIndex={2}
              bg={dialogBg}
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

            <Dialog.Body px={{ base: 4, md: 6 }} py={5}>
              <Fieldset.Root size="lg" maxW="2xl">
                <Fieldset.Content>
                  <Field.Root required invalid={Boolean(errors.title)}>
                    <Field.Label>Project Title</Field.Label>
                    <Input name="title" value={formData.title} onChange={onChange} px={2} />
                    <Field.ErrorText>{errors.title}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={Boolean(errors.description)}>
                    <Field.Label>Project Description</Field.Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={onChange}
                      px={2}
                      aria-label="Project Description"
                    />
                    <Field.ErrorText>{errors.description}</Field.ErrorText>
                  </Field.Root>

                  <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
                    <Field.Root flex="1" required invalid={Boolean(errors.externalLink)}>
                      <Field.Label>External Link</Field.Label>
                      <Input
                        name="externalLink"
                        type="url"
                        placeholder="https://example.com"
                        value={formData.externalLink}
                        onChange={onChange}
                        px={2}
                      />
                      <Field.ErrorText>{errors.externalLink}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root flex="1" required invalid={Boolean(errors.githubLink)}>
                      <Field.Label>GitHub Link</Field.Label>
                      <Input
                        name="githubLink"
                        type="url"
                        placeholder="https://github.com/..."
                        value={formData.githubLink}
                        onChange={onChange}
                        px={2}
                      />
                      <Field.ErrorText>{errors.githubLink}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root flex="1" invalid={Boolean(errors.liveDemoLink)}>
                      <Field.Label>Live Link</Field.Label>
                      <Input
                        name="liveDemoLink"
                        type="url"
                        placeholder="https://live-demo.com"
                        value={formData.liveDemoLink}
                        onChange={onChange}
                        px={2}
                      />
                      <Field.ErrorText>{errors.liveDemoLink}</Field.ErrorText>
                    </Field.Root>
                  </Flex>

                  <Field.Root required invalid={Boolean(errors.category)}>
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
                        {categoryOptions.map((item) => (
                          <option key={item.value} value={item.label}>{item.label}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Field.ErrorText>{errors.category}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={Boolean(errors.languages)}>
                    <Field.Label>Languages</Field.Label>
                    <Input name="languages" value={formData.languages} onChange={onChange} paddingX={2} alignContent="center" />
                    <Field.ErrorText>{errors.languages}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={Boolean(errors.tags)}>
                    <Field.Label>Tags</Field.Label>
                    <Input name="tags" value={formData.tags} onChange={onChange} paddingX={2} alignContent="center" />
                    <Field.ErrorText>{errors.tags}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={Boolean(errors.status)}>
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
                    <Field.ErrorText>{errors.status}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Upload Date</Field.Label>
                    <Input type="date" name="date" value={formData.date} onChange={onChange} paddingX={2} alignContent="center" />
                  </Field.Root>

                  <Flex align="center" gap={4}>
                    <Field.Root invalid={Boolean(errors.imageUrl)}>
                      <Field.Label>Preview Image</Field.Label>
                      <FileUpload.Root accept="image/*">
                        <FileUpload.HiddenInput aria-label="Select preview image" onChange={onUploadImage} disabled={isUploading || isSaving} />
                        <FileUpload.Trigger asChild>
                          <Button size="sm" variant="outline" aria-label="Upload image" loading={isUploading} disabled={isSaving}>
                            <RiImageAddLine />
                          </Button>
                        </FileUpload.Trigger>
                        <FileUploadList />
                      </FileUpload.Root>
                      <Field.ErrorText>{errors.imageUrl}</Field.ErrorText>
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

            <Dialog.Footer
              display="flex"
              justifyContent="flex-end"
              px={{ base: 4, md: 6 }}
              py={4}
              position="sticky"
              bottom={0}
              zIndex={2}
              bg={dialogBg}
              borderTopWidth="1px"
              borderColor={dialogBorder}
            >
              <ButtonGroup gap={3}>
                <Button colorPalette="brand" onClick={onSubmit} variant="solid" loading={isSaving} disabled={isUploading}>
                  {editMode ? 'Update' : 'Create'}
                </Button>
                <Button onClick={onCancel} variant="ghost" disabled={isSaving}>Cancel</Button>
              </ButtonGroup>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
