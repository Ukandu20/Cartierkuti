import React, { useState } from 'react'
import { AspectRatio, Box, Button, CloseButton, Dialog, Heading, Image, Portal, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { projectImageProps } from '@/utils/projectImages'
import FormattedParagraphs from '@/components/ui/FormattedParagraphs'

export default function ExperienceGallery({ items, content }) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState(null)
  const ordered = [...items].sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)))
  const shown = expanded ? ordered : ordered.slice(0, 6)
  return <Box as="section" aria-labelledby="about-gallery-heading">
    <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">{content.galleryLabel}</Text>
    <Heading as="h2" id="about-gallery-heading" fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} mt={3} mb={7}>{content.galleryTitle}</Heading>
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
      {shown.map((item, index) => <Box as="figure" key={item._id || item._editorId || index} m={0}>
        <Box as="button" type="button" aria-label={`Open photo: ${item.title}`} onClick={() => setSelected(item)} display="block" w="full" overflow="hidden" borderRadius="lg" cursor="pointer" _focusVisible={{ outline: '2px solid', outlineColor: 'accent.default', outlineOffset: '3px' }}>
          <AspectRatio ratio={16 / 10} bg="bg.subtle"><Image {...projectImageProps(item.imageUrl)} alt={item.altText || item.title} loading="lazy" objectFit="cover" /></AspectRatio>
        </Box>
        <Box as="figcaption" mt={4}>
          <Heading as="h3" fontSize="lg">{item.title}</Heading>
          {(item.date || item.location) ? <Text fontFamily="mono" fontSize="xs" color="fg.muted" mt={2}>{[item.date, item.location].filter(Boolean).join(' · ')}</Text> : null}
          {item.caption ? <Text color="fg.muted" lineClamp={3} mt={2}>{item.caption}</Text> : null}
        </Box>
      </Box>)}
    </SimpleGrid>
    {ordered.length > 6 ? <Button mt={7} variant="outline" colorPalette="brand" onClick={() => setExpanded(value => !value)}>{expanded ? 'Show fewer photos' : `View more photos (${ordered.length - 6})`}</Button> : null}
    {selected ? <Dialog.Root open onOpenChange={({ open }) => { if (!open) setSelected(null) }} size="xl" placement="center" scrollBehavior="inside">
      <Portal><Dialog.Backdrop /><Dialog.Positioner p={3}><Dialog.Content bg="bg.surface" maxW="1100px" maxH="95dvh" overflow="hidden">
        <Dialog.Header pr={14}><Dialog.Title>{selected.title}</Dialog.Title><Dialog.CloseTrigger asChild><CloseButton aria-label="Close photo" position="absolute" right={3} top={3} /></Dialog.CloseTrigger></Dialog.Header>
        <Dialog.Body><Stack gap={4}>
          <Image {...projectImageProps(selected.imageUrl, { detail: true })} alt={selected.altText || selected.title} maxH="65dvh" w="full" objectFit="contain" />
          <Text fontFamily="mono" fontSize="xs" color="fg.muted">{[selected.date, selected.location].filter(Boolean).join(' · ')}</Text>
          {selected.caption ? <FormattedParagraphs value={selected.caption} textProps={{ color: 'fg.muted', lineHeight: '1.7' }} /> : null}
        </Stack></Dialog.Body>
      </Dialog.Content></Dialog.Positioner></Portal>
    </Dialog.Root> : null}
  </Box>
}
