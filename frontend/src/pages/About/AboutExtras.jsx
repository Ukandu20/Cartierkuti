import React, { Suspense } from 'react'
import { Badge, Box, Heading, HStack, SimpleGrid, Skeleton, Stack, Text } from '@chakra-ui/react'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import FormattedParagraphs from '@/components/ui/FormattedParagraphs'

const ExperienceGallery = React.lazy(() => import('./ExperienceGallery'))

export default function AboutExtras({ personalItems = [], gallery = [] }) {
  const cards = personalItems.filter(item => item.visible !== false && item.title)
  const photos = gallery.filter(item => item.visible !== false && item.imageUrl && item.title)
  if (!cards.length && !photos.length) return null
  return <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} pb={{ base: 16, md: 24 }}>
    <Stack gap={{ base: 12, md: 16 }}>
      {cards.length ? <Box as="section" aria-labelledby="about-personal-heading">
        <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">A little more about me</Text>
        <Heading as="h2" id="about-personal-heading" fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} mt={3} mb={7}>Outside my work</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
          {cards.map((item, index) => <SurfaceCard key={item._id || item._editorId || index} as="article" p={6}>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">{item.category}</Text>
            <Heading as="h3" fontSize="xl" mt={3}>{item.title}</Heading>
            <HStack wrap="wrap" gap={2} mt={3}>
              {item.status ? <Badge colorPalette="brand" variant="subtle">{item.status}</Badge> : null}
              {item.level ? <Badge variant="outline">{item.level}</Badge> : null}
            </HStack>
            {item.notes ? <FormattedParagraphs value={item.notes} mt={4} textProps={{ color: 'fg.muted', lineHeight: '1.7' }} /> : null}
          </SurfaceCard>)}
        </SimpleGrid>
      </Box> : null}
      {photos.length ? <Suspense fallback={<Skeleton minH="320px" borderRadius="lg" aria-label="Loading experience gallery" />}><ExperienceGallery items={photos} /></Suspense> : null}
    </Stack>
  </Box>
}
