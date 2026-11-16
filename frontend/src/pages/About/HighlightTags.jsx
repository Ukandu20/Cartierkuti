import React from 'react'
import { Badge, HStack } from '@chakra-ui/react'

export default function HighlightTags({ items = [], label = 'Highlights', ...props }) {
  if (!items.length) return null
  return <HStack role="list" aria-label={label} gap={2} wrap="wrap" align="start" {...props}>
    {items.map((item, index) => <Badge role="listitem" key={`${item}-${index}`} colorPalette="brand" variant="subtle" borderRadius="full" px={3} py={1} whiteSpace="normal" overflowWrap="anywhere" maxW="full" lineHeight="1.6">{item}</Badge>)}
  </HStack>
}
