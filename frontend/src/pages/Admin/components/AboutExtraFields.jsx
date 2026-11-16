import { isStudyInProgress } from '@/utils/educationDates'
import React, { useState } from 'react'
import { Box, Field, Flex, Image, Input, NativeSelect, SimpleGrid, Stack, Switch, Text, Textarea } from '@chakra-ui/react'
import apiClient from '@/utils/axiosConfig'
import { projectImageProps } from '@/utils/projectImages'

export function VisibilityControl({ checked, onChange, label = 'Show on About page' }) {
  return <Switch.Root checked={checked !== false} onCheckedChange={({ checked: next }) => onChange(next)}>
    <Switch.HiddenInput aria-label={label} /><Switch.Control><Switch.Thumb /></Switch.Control><Switch.Label>{label}</Switch.Label>
  </Switch.Root>
}

function TextField({ label, value, onChange, error, multiline = false, ...props }) {
  const Control = multiline ? Textarea : Input
  return <Field.Root invalid={Boolean(error)}>
    <Field.Label>{label}</Field.Label>
    <Control value={value || ''} onChange={event => onChange(event.target.value)} {...props} />
    <Field.ErrorText>{error}</Field.ErrorText>
  </Field.Root>
}

export function EducationFields({ item, onChange, errors }) {
  return <Stack gap={4}>
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      <TextField label="Institution" value={item.school} onChange={value => onChange('school', value)} error={errors.school} maxLength={160} />
      <TextField label="Program name" value={item.program} onChange={value => onChange('program', value)} error={errors.program} placeholder="Data Science" maxLength={160} />
      <TextField label="Program level" value={item.level} onChange={value => onChange('level', value)} placeholder="Master’s degree, Bachelor’s degree, Diploma…" maxLength={80} />
      <TextField label="Education status" value={item.status} onChange={value => onChange('status', value)} placeholder="In progress, Completed, Starting soon…" maxLength={80} />
      <TextField label="Study start date" value={item.startDate} onChange={value => { onChange('startDate', value); onChange('period', '') }} error={errors.startDate} placeholder="2025 or 2025-09" maxLength={7} />
      {isStudyInProgress(item.status)
        ? <TextField label="Expected finish date (optional)" value={item.expectedFinishDate} onChange={value => { onChange('expectedFinishDate', value); onChange('period', '') }} error={errors.expectedFinishDate} placeholder="2027 or 2027-06" maxLength={7} />
        : <TextField label="Study finish date" value={item.finishDate} onChange={value => { onChange('finishDate', value); onChange('period', '') }} error={errors.finishDate} placeholder="2027 or 2027-06" maxLength={7} />}
    </SimpleGrid>
    <Text color="fg.muted" fontSize="sm">Use a year or year and month. For In progress, leave the expected finish empty to show Present. The program level and status appear as separate badges.</Text>
    <VisibilityControl checked={item.visible} onChange={value => onChange('visible', value)} label={`Show education for ${item.program || 'this program'}`} />
  </Stack>
}

export function PersonalFields({ item, onChange, errors }) {
  return <Stack gap={4}>
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      <TextField label="Personal card title" value={item.title} onChange={value => onChange('title', value)} error={errors.title} placeholder="French, hiking, community mentoring…" maxLength={100} />
      <Field.Root><Field.Label>Type of personal card</Field.Label><NativeSelect.Root><NativeSelect.Field aria-label="Type of personal card" value={item.category} onChange={event => onChange('category', event.target.value)}>
        {['Language', 'Learning', 'Interest', 'Volunteering'].map(value => <option key={value}>{value}</option>)}
      </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
      <TextField label="Current status" value={item.status} onChange={value => onChange('status', value)} placeholder="Currently learning, Active, Exploring…" maxLength={80} />
      <TextField label="Proficiency or experience level" value={item.level} onChange={value => onChange('level', value)} placeholder="Beginner, Conversational, B1…" maxLength={80} />
    </SimpleGrid>
    <TextField label="Personal note" value={item.notes} onChange={value => onChange('notes', value)} error={errors.notes} multiline rows={4} maxLength={800} placeholder="What interests you about it? What are you working toward?" />
    <VisibilityControl checked={item.visible} onChange={value => onChange('visible', value)} label={`Show personal card ${item.title || 'on About page'}`} />
  </Stack>
}

export function GalleryFields({ item, onChange, onImageUploaded, onUploadingChange, errors }) {
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const upload = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setUploadError('Choose a PNG, JPEG, WebP, or GIF image, maximum 2 MB.')
      return
    }
    setUploading(true)
    onUploadingChange(true)
    setUploadError('')
    try {
      const body = new FormData()
      body.append('image', file)
      const { data } = await apiClient.post('/api/resume/gallery-image', body)
      onImageUploaded(data)
    } catch (error) {
      setUploadError(error?.response?.data?.message || 'Photo upload failed. Please try again.')
    } finally {
      setUploading(false)
      onUploadingChange(false)
    }
  }
  return <Stack gap={4}>
    <TextField label="Gallery title" value={item.title} onChange={value => onChange('title', value)} error={errors.title} maxLength={160} placeholder="A conference, a trip, a memorable day…" />
    <Box>
      {item.imageUrl ? <Image {...projectImageProps(item.imageUrl)} alt={item.altText || item.title || 'Gallery photo preview'} maxH="240px" w="full" objectFit="contain" bg="bg.subtle" borderRadius="md" mb={3} /> : null}
      <Field.Root invalid={Boolean(errors.imageUrl || uploadError)}>
        <Field.Label>Upload gallery photo</Field.Label>
        <Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={upload} aria-label="Upload gallery photo" p={2} h="auto" />
        <Field.HelperText>{uploading ? 'Uploading photo…' : 'Up to 2 MB. Photos appear publicly only after you save the About page.'}</Field.HelperText>
        <Field.ErrorText>{uploadError || errors.imageUrl}</Field.ErrorText>
      </Field.Root>
    </Box>
    <TextField label="Photo description for accessibility" value={item.altText} onChange={value => onChange('altText', value)} maxLength={200} placeholder="Briefly describe what is in the photo." />
    <TextField label="Caption or story" value={item.caption} onChange={value => onChange('caption', value)} error={errors.caption} multiline rows={4} maxLength={1000} />
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      <TextField label="Gallery date or period" value={item.date} onChange={value => onChange('date', value)} placeholder="June 2026 or Summer 2026" maxLength={80} />
      <TextField label="Gallery location" value={item.location} onChange={value => onChange('location', value)} maxLength={160} />
    </SimpleGrid>
    <Flex gap={5} wrap="wrap">
      <VisibilityControl checked={item.visible} onChange={value => onChange('visible', value)} label={`Show gallery entry ${item.title || 'on About page'}`} />
      <VisibilityControl checked={item.featured} onChange={value => onChange('featured', value)} label="Feature this photo" />
    </Flex>
  </Stack>
}
