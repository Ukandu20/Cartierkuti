import React from 'react'
import { Stack, Text } from '@chakra-ui/react'

const toParagraphs = (value, fallback) => String(value || fallback || '')
  .split(/\r?\n\s*\r?\n/)
  .map((paragraph) => paragraph.trim())
  .filter(Boolean)

export default function FormattedParagraphs({ value, fallback, gap = 4, textProps, ...props }) {
  const paragraphs = toParagraphs(value, fallback)

  return (
    <Stack gap={gap} {...props}>
      {paragraphs.map((paragraph, index) => (
        <Text key={`${index}-${paragraph.slice(0, 32)}`} whiteSpace="pre-line" {...textProps}>
          {paragraph}
        </Text>
      ))}
    </Stack>
  )
}
