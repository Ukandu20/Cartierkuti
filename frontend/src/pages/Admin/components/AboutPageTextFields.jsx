import React from 'react'
import { Box, Button, Field, Input, SimpleGrid, Stack, Textarea } from '@chakra-ui/react'
import { aboutTextFields, normalizeAboutContent } from '@/utils/aboutContent'

export default function AboutPageTextFields({ value, onChange, errors = {} }) {
  const content = normalizeAboutContent(value)
  const update = (key, text) => onChange({ ...content, [key]: text })
  const updatePrinciple = (index, key, text) => update('principles', content.principles.map((item, i) => i === index ? { ...item, [key]: text } : item))
  return <Stack gap={6}>
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
      {aboutTextFields.filter(([key]) => !['ctaLabel', 'ctaTitle', 'ctaDescription'].includes(key)).map(([key, label]) => <Field.Root key={key} invalid={Boolean(errors[`pageContent.${key}`])}>
        <Field.Label>{label}</Field.Label>
        <Textarea value={content[key]} onChange={event => update(key, event.target.value)} maxLength={key === 'metaDescription' ? 320 : 1000} rows={2} />
        <Field.ErrorText>{errors[`pageContent.${key}`]}</Field.ErrorText>
      </Field.Root>)}
    </SimpleGrid>
    {content.principles.map((item, index) => <Box key={index} borderTop="1px solid" borderColor="border.subtle" pt={5}>
      <Stack gap={3}>
        <Field.Root><Field.Label>Approach {index + 1} title</Field.Label><Input value={item.title} onChange={event => updatePrinciple(index, 'title', event.target.value)} maxLength={160} /></Field.Root>
        <Field.Root><Field.Label>Approach {index + 1} description</Field.Label><Textarea value={item.description} onChange={event => updatePrinciple(index, 'description', event.target.value)} maxLength={1000} /></Field.Root>
        <Button alignSelf="start" size="sm" variant="outline" onClick={() => update('principles', content.principles.filter((_, i) => i !== index))}>Remove approach {index + 1}</Button>
      </Stack>
    </Box>)}
    <Button alignSelf="start" variant="outline" disabled={content.principles.length >= 12} onClick={() => update('principles', [...content.principles, { title: '', description: '' }])}>Add working approach</Button>
  </Stack>
}
