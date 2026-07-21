import React, { useEffect, useMemo, useRef } from 'react'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  FileUpload,
  Flex,
  Heading,
  Image,
  Input,
  NativeSelect,
  Portal,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { HiOutlinePhoto, HiOutlineTrash } from 'react-icons/hi2'
import { categoryOptions } from '@/utils/projectCategories'
import { PROJECT_METHOD_SUGGESTIONS, PROJECT_TAG_SUGGESTIONS, PROJECT_TOOL_SUGGESTIONS } from '@/utils/projectClassification'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import TagInput from './TagInput'

const splitItems = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean)

function FormSection({ eyebrow, title, description, children }) {
  return (
    <SurfaceCard p={{ base: 4, md: 5 }} boxShadow="none">
      <Stack gap={5}>
        <Box>
          <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">{eyebrow}</Text>
          <Heading as="h3" fontFamily="body" fontSize="lg" mt={1}>{title}</Heading>
          {description ? <Text color="fg.muted" fontSize="sm" mt={1}>{description}</Text> : null}
        </Box>
        {children}
      </Stack>
    </SurfaceCard>
  )
}

function ProjectCardPreview({ formData }) {
  const topics = splitItems(formData.tags).slice(0, 4)
  return (
    <SurfaceCard overflow="hidden" boxShadow="none">
      <AspectRatio ratio={16 / 9} bg="bg.raised">
        <Image src={formData.imageUrl || '/placeholder.svg'} alt="Project card preview" objectFit="cover" />
      </AspectRatio>
      <Stack p={5} gap={3}>
        <Flex justify="space-between" align="center" gap={3} wrap="wrap">
          <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.12em">
            {formData.category || 'Project category'}
          </Text>
          {formData.featured ? <Badge colorPalette="brand">Featured</Badge> : null}
        </Flex>
        <Heading as="h4" fontSize="xl" lineHeight="1.25">{formData.title || 'Untitled project'}</Heading>
        <Text color="fg.muted" fontSize="sm" lineClamp={3}>{formData.description || 'Your project description will appear here.'}</Text>
        {topics.length ? (
          <Flex gap={2} wrap="wrap">
            {topics.map((item) => <Badge key={item} variant="subtle" colorPalette="brand">{item}</Badge>)}
          </Flex>
        ) : null}
      </Stack>
    </SurfaceCard>
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
  onRemoveImage,
}) {
  const bodyRef = useRef(null)
  const errorKeys = Object.keys(errors)
  const errorSignature = errorKeys.join('|')
  const tags = useMemo(() => splitItems(formData.tags), [formData.tags])
  const methods = useMemo(() => splitItems(formData.methods), [formData.methods])
  const tools = useMemo(() => splitItems(formData.tools), [formData.tools])

  useEffect(() => {
    if (!errorKeys.length) return
    const firstInvalid = bodyRef.current?.querySelector(`[name="${errorKeys[0]}"]`)
    firstInvalid?.focus?.()
  // The signature changes only when validation returns a new field set.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorSignature])

  const setTextField = (name, value) => onChange({ target: { name, value, type: 'text' } })

  return (
    <Dialog.Root placement="center" open={open} onOpenChange={onOpenChange} scrollBehavior="inside">
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <Dialog.Positioner p={{ base: 2, md: 6 }}>
          <Dialog.Content
            w="full"
            maxW="1100px"
            maxH="calc(100dvh - 1rem)"
            overflow="hidden"
            bg="bg.surface"
            color="fg.default"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="lg"
            boxShadow="xl"
          >
            <Dialog.Header px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor="border.subtle">
              <Box pr={12}>
                <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">
                  {editMode ? 'Project editor' : 'New case study'}
                </Text>
                <Dialog.Title fontSize={{ base: 'xl', md: '2xl' }} mt={1}>
                  {editMode ? `Edit ${formData.title || 'project'}` : 'Create a project'}
                </Dialog.Title>
                <Text color="fg.muted" fontSize="sm" mt={1}>Shape the public card, links, and publishing details in one place.</Text>
              </Box>
              <Dialog.CloseTrigger asChild>
                <CloseButton aria-label="Close project editor" position="absolute" top={4} right={4} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body ref={bodyRef} p={{ base: 4, md: 6 }} overflowY="auto">
              {errorKeys.length ? (
                <Box role="alert" mb={5} p={4} bg="bg.error" border="1px solid" borderColor="border.error" borderRadius="md">
                  <Text fontWeight="700" color="fg.error">Review {errorKeys.length} field{errorKeys.length === 1 ? '' : 's'} before saving.</Text>
                  <Flex mt={2} gap={2} wrap="wrap">
                    {errorKeys.map((key) => (
                      <Button key={key} size="xs" variant="outline" colorPalette="red" onClick={() => bodyRef.current?.querySelector(`[name="${key}"]`)?.focus()}>
                        {errors[key]}
                      </Button>
                    ))}
                  </Flex>
                </Box>
              ) : null}

              <SimpleGrid columns={{ base: 1, lg: 'minmax(0, 1.6fr) minmax(300px, 0.9fr)' }} gap={6} alignItems="start">
                <Stack gap={5}>
                  <FormSection eyebrow="01" title="Project information" description="Lead with a concise title and the decision or outcome behind the work.">
                    <Field.Root required invalid={Boolean(errors.title)}>
                      <Flex justify="space-between" gap={4}><Field.Label>Project title</Field.Label><Text fontSize="xs" color="fg.muted">{formData.title.length}/90</Text></Flex>
                      <Input name="title" value={formData.title} onChange={onChange} maxLength={90} placeholder="e.g. Match performance model" />
                      <Field.ErrorText>{errors.title}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root required invalid={Boolean(errors.description)}>
                      <Flex justify="space-between" gap={4}><Field.Label>Project description</Field.Label><Text fontSize="xs" color="fg.muted">{formData.description.length}/500</Text></Flex>
                      <Textarea name="description" value={formData.description} onChange={onChange} maxLength={500} minH="140px" placeholder="Explain the question, method, and value of the result." />
                      <Field.HelperText>This becomes the summary on project cards and search results.</Field.HelperText>
                      <Field.ErrorText>{errors.description}</Field.ErrorText>
                    </Field.Root>
                  </FormSection>

                  <FormSection eyebrow="02" title="Classification" description="Separate the project's discipline, subject, approach, and implementation.">
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field.Root required invalid={Boolean(errors.category)}>
                        <Field.Label htmlFor="category-select">Category</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field id="category-select" name="category" value={formData.category} onChange={onChange}>
                            <option value="" disabled>Select a category…</option>
                            {categoryOptions.map((item) => <option key={item.value} value={item.label}>{item.label}</option>)}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <Field.ErrorText>{errors.category}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root required invalid={Boolean(errors.status)}>
                        <Field.Label htmlFor="status-select">Project status</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field id="status-select" name="status" value={formData.status} onChange={onChange}>
                            <option value="" disabled>Select status…</option>
                            {['Not Started', 'In Progress', 'Completed'].map((item) => <option key={item}>{item}</option>)}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <Field.ErrorText>{errors.status}</Field.ErrorText>
                      </Field.Root>
                    </SimpleGrid>
                    <Field.Root required invalid={Boolean(errors.tags)}>
                      <Field.Label>Topics and domains</Field.Label>
                      <TagInput name="tags" value={formData.tags} onChange={(value) => setTextField('tags', value)} placeholder="Add Football, Sales, Decision Support…" ariaLabel="Topics and domains" suggestions={PROJECT_TAG_SUGGESTIONS} maxItems={8} />
                      <Field.HelperText>{tags.length}/8 tags · describe the subject or use case without repeating the category.</Field.HelperText>
                      <Field.ErrorText>{errors.tags}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root required invalid={Boolean(errors.methods)}>
                      <Field.Label>Methods</Field.Label>
                      <TagInput name="methods" value={formData.methods} onChange={(value) => setTextField('methods', value)} placeholder="Add Feature Engineering, Forecasting, Model Evaluation…" ariaLabel="Project methods" suggestions={PROJECT_METHOD_SUGGESTIONS} maxItems={12} />
                      <Field.HelperText>{methods.length}/12 methods · explain how the problem was solved.</Field.HelperText>
                      <Field.ErrorText>{errors.methods}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root required invalid={Boolean(errors.tools)}>
                      <Field.Label>Tools and technologies</Field.Label>
                      <TagInput name="tools" value={formData.tools} onChange={(value) => setTextField('tools', value)} placeholder="Add Python, SQL, Power BI…" ariaLabel="Tools and technologies" suggestions={PROJECT_TOOL_SUGGESTIONS} maxItems={20} />
                      <Field.HelperText>{tools.length}/20 tools · use canonical product and library names.</Field.HelperText>
                      <Field.ErrorText>{errors.tools}</Field.ErrorText>
                    </Field.Root>
                  </FormSection>

                  <FormSection eyebrow="03" title="Project links" description="Published case studies require an external destination and source repository.">
                    <Field.Root required invalid={Boolean(errors.externalLink)}>
                      <Field.Label>Primary project URL</Field.Label>
                      <Input name="externalLink" type="url" placeholder="https://example.com/project" value={formData.externalLink} onChange={onChange} />
                      <Field.HelperText>Required. Used when no dedicated live-demo URL is supplied.</Field.HelperText>
                      <Field.ErrorText>{errors.externalLink}</Field.ErrorText>
                    </Field.Root>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field.Root required invalid={Boolean(errors.githubLink)}>
                        <Field.Label>GitHub repository</Field.Label>
                        <Input name="githubLink" type="url" placeholder="https://github.com/…" value={formData.githubLink} onChange={onChange} />
                        <Field.ErrorText>{errors.githubLink}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={Boolean(errors.liveDemoLink)}>
                        <Field.Label>Live demo URL</Field.Label>
                        <Input name="liveDemoLink" type="url" placeholder="https://demo.example.com" value={formData.liveDemoLink} onChange={onChange} />
                        <Field.HelperText>Optional.</Field.HelperText>
                        <Field.ErrorText>{errors.liveDemoLink}</Field.ErrorText>
                      </Field.Root>
                    </SimpleGrid>
                  </FormSection>
                </Stack>

                <Stack gap={5} position={{ lg: 'sticky' }} top={{ lg: 0 }}>
                  <FormSection eyebrow="04" title="Publishing" description="Control the image and emphasis used across the public portfolio.">
                    <Field.Root invalid={Boolean(errors.imageUrl)}>
                      <Field.Label>Preview image</Field.Label>
                      <AspectRatio ratio={16 / 10} bg="bg.raised" borderRadius="md" overflow="hidden" border="1px solid" borderColor="border.subtle">
                        <Image src={formData.imageUrl || '/placeholder.svg'} alt={formData.imageUrl ? 'Current project preview' : 'Placeholder project preview'} objectFit="cover" />
                      </AspectRatio>
                      <Flex gap={2} wrap="wrap">
                        <FileUpload.Root accept="image/png,image/jpeg,image/webp">
                          <FileUpload.HiddenInput name="imageUrl" aria-label="Select preview image" onChange={onUploadImage} disabled={isUploading || isSaving} />
                          <FileUpload.Trigger asChild>
                            <Button size="sm" variant="outline" colorPalette="brand" loading={isUploading} disabled={isSaving}>
                              <HiOutlinePhoto /> {formData.imageUrl ? 'Replace image' : 'Upload image'}
                            </Button>
                          </FileUpload.Trigger>
                        </FileUpload.Root>
                        {formData.imageUrl ? (
                          <Button size="sm" variant="ghost" colorPalette="red" onClick={onRemoveImage}>
                            <HiOutlineTrash /> Remove
                          </Button>
                        ) : null}
                      </Flex>
                      <Field.HelperText>PNG, JPG or WebP. Use a 16:10 image under 2 MB.</Field.HelperText>
                      <Field.ErrorText>{errors.imageUrl}</Field.ErrorText>
                    </Field.Root>

                    <Flex justify="space-between" align="center" gap={4} p={4} bg="bg.subtle" borderRadius="md">
                      <Box>
                        <Text fontWeight="700">Feature this project</Text>
                        <Text color="fg.muted" fontSize="sm">Featured work is prioritised on the Home and Portfolio pages.</Text>
                      </Box>
                      <Switch.Root checked={formData.featured} onCheckedChange={(details) => setFormData((current) => ({ ...current, featured: Boolean(details.checked) }))}>
                        <Switch.HiddenInput name="featured" />
                        <Switch.Control><Switch.Thumb /></Switch.Control>
                      </Switch.Root>
                    </Flex>
                    <Text fontSize="sm" color="fg.muted">
                      {editMode && formData.date ? `Originally published ${new Date(formData.date).toLocaleDateString()}.` : 'Publication date is assigned automatically when the project is created.'}
                    </Text>
                  </FormSection>

                  <Box as="details">
                    <Box as="summary" cursor="pointer" fontWeight="700" py={2}>Preview public card</Box>
                    <Box mt={3}><ProjectCardPreview formData={formData} /></Box>
                  </Box>
                </Stack>
              </SimpleGrid>
            </Dialog.Body>

            <Dialog.Footer px={{ base: 4, md: 6 }} py={4} borderTop="1px solid" borderColor="border.subtle" bg="bg.surface">
              <Flex w="full" justify="space-between" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={3}>
                <Text color="fg.muted" fontSize="sm">Fields marked required must be completed before publishing.</Text>
                <Flex gap={3} direction={{ base: 'column-reverse', sm: 'row' }}>
                  <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                  <Button colorPalette="brand" onClick={onSubmit} loading={isSaving} disabled={isUploading}>
                    {editMode ? 'Save changes' : 'Create project'}
                  </Button>
                </Flex>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
