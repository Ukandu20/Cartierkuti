import React from 'react'
import { Badge, Heading, HStack, Text } from '@chakra-ui/react'

export default function EducationDetails({ item }) {
  return <>
    <Heading as="h3" fontFamily="heading" fontSize="xl" fontWeight="600" lineHeight="1.35" overflowWrap="break-word">{item.program || item.degree}</Heading>
    {(item.level || item.status) ? <HStack gap={2} wrap="wrap" mt={2}>
      {item.level ? <Badge colorPalette="brand" variant="subtle">{item.level}</Badge> : null}
      {item.status ? <Badge variant="outline">{item.status}</Badge> : null}
    </HStack> : null}
    <Text color="fg.muted" mt={2}>{item.school}</Text>
  </>
}
