'use client'

import React from 'react'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  FaArrowRight,
  FaExternalLinkAlt,
  FaGithub,
  FaHeart,
  FaRegHeart,
  FaStar,
} from 'react-icons/fa'
import { interactiveSurfaceStyles } from '@/components/ui/DesignSystem'
import ProjectDetails from './ProjectDetails'

const formatProjectDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

export default function ProjectCard({
  project,
  favorites,
  handleFavorite,
  hitAndOpen,
  featured = false,
}) {
  const isFavorite = favorites.includes(project.id)
  const technologies = (project.tags?.length ? project.tags : project.languages || []).slice(0, 4)
  const liveUrl = project.liveDemoLink || project.externalLink
  const projectDate = formatProjectDate(project.lastUpdatedDate || project.createdDate)
  const hasReviews = (project.reviews?.length || 0) > 0

  return (
    <Dialog.Root size="xl" placement="center" motionPreset="slide-in-bottom">
      <Card.Root
        as="article"
        h="full"
        color={'fg.default'}
        {...interactiveSurfaceStyles}
        overflow="hidden"
      >
        <SimpleGrid columns={{ base: 1, lg: featured ? 2 : 1 }} h="full">
          <Box position="relative" bg={'bg.raised'}>
            <AspectRatio ratio={featured ? 4 / 3 : 16 / 10} h="full" minH={featured ? { lg: '430px' } : undefined}>
              <Image
                src={project.imageUrl || '/placeholder.svg'}
                alt={`${project.title} project preview`}
                objectFit="cover"
                loading="lazy"
              />
            </AspectRatio>
            <Flex position="absolute" top={4} left={4} right={4} justify="space-between" align="start" gap={3}>
              {project.featured ? (
                <Badge bg={'accent.default'} color="brand.contrast" px={3} py={1} borderRadius="full">
                  Featured
                </Badge>
              ) : <Box />}
              <IconButton
                aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
                size="sm"
                borderRadius="full"
                bg={'bg.surface'}
                color={isFavorite ? 'red.500' : 'fg.muted'}
                boxShadow="md"
                _hover={{ color: 'red.500', bg: 'bg.surface' }}
                onClick={() => handleFavorite(project.id)}
              >
                <Icon as={isFavorite ? FaHeart : FaRegHeart} aria-hidden="true" />
              </IconButton>
            </Flex>
          </Box>

          <Stack p={{ base: 5, md: featured ? 8 : 6 }} gap={5} justify="space-between" minW="0">
            <Stack gap={4}>
              <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} textTransform="uppercase" letterSpacing="0.14em">
                  {project.category || 'Project'}
                </Text>
                <HStack gap={2}>
                  {project.status ? <Badge variant="subtle" colorPalette="gray">{project.status}</Badge> : null}
                  {projectDate ? <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'}>{projectDate}</Text> : null}
                </HStack>
              </Flex>

              <Heading
                as="h3"
                fontFamily={'heading'}
                fontSize={featured ? { base: '2xl', md: '4xl' } : '2xl'}
                fontWeight="600"
                lineHeight="1.25"
                overflowWrap="break-word"
              >
                {project.title}
              </Heading>

              <Text color={'fg.muted'} fontSize={featured ? 'lg' : 'md'} lineHeight="1.7" lineClamp={featured ? 5 : 3}>
                {project.description || 'A closer look at the methods, tools, and decisions behind this project.'}
              </Text>

              {technologies.length ? (
                <Flex gap={2} wrap="wrap" aria-label="Project technologies">
                  {technologies.map((technology) => (
                    <Badge key={technology} bg={'accent.subtle'} color={'fg.default'} borderRadius="full" px={3} py={1} fontWeight="600">
                      {technology}
                    </Badge>
                  ))}
                </Flex>
              ) : null}

              {hasReviews || project.views ? (
                <HStack gap={4} color={'fg.muted'} fontSize="sm">
                  {hasReviews ? (
                    <HStack gap={1} aria-label={`${project.avgStars?.toFixed(1) || '0'} average rating`}>
                      <Icon as={FaStar} color="yellow.500" aria-hidden="true" />
                      <Text>{project.avgStars?.toFixed(1)} · {project.reviews.length} review{project.reviews.length === 1 ? '' : 's'}</Text>
                    </HStack>
                  ) : null}
                  {project.views ? <Text>{project.views} views</Text> : null}
                </HStack>
              ) : null}
            </Stack>

            <Flex pt={2} borderTop="1px solid" borderColor={'border.subtle'} justify="space-between" align="center" gap={3} wrap="wrap">
              <Dialog.Trigger asChild>
                <Button colorPalette="brand" size="sm">
                  View case study <FaArrowRight />
                </Button>
              </Dialog.Trigger>
              <ButtonGroup size="sm" variant="ghost" gap={1}>
                {liveUrl ? (
                  <Button onClick={(event) => hitAndOpen(project.id, liveUrl, event)}>
                    Live project <FaExternalLinkAlt />
                  </Button>
                ) : null}
                {project.githubLink ? (
                  <Button onClick={(event) => hitAndOpen(project.id, project.githubLink, event)}>
                    <FaGithub /> Source
                  </Button>
                ) : null}
              </ButtonGroup>
            </Flex>
          </Stack>
        </SimpleGrid>
      </Card.Root>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={{ base: 3, md: 6 }}>
          <Dialog.Content
            maxW="6xl"
            maxH="calc(100dvh - 2rem)"
            overflow="hidden"
            borderRadius="lg"
            border="1px solid"
            borderColor={'border.subtle'}
            bg={'bg.surface'}
            color={'fg.default'}
          >
            <Dialog.Header borderBottom="1px solid" borderColor={'border.subtle'} pr={16} py={5}>
              <Stack gap={1}>
                <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} textTransform="uppercase" letterSpacing="0.14em">
                  {project.category || 'Project case study'}
                </Text>
                <Dialog.Title fontFamily={'heading'} fontSize={{ base: '2xl', md: '3xl' }} lineHeight="1.25">
                  {project.title}
                </Dialog.Title>
              </Stack>
              <Dialog.CloseTrigger asChild>
                <CloseButton aria-label="Close case study" position="absolute" top={5} right={5} />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body p={0} overflowY="auto">
              <ProjectDetails
                project={project}
                openLink={hitAndOpen}
                handleFavorite={handleFavorite}
                isFavorite={isFavorite}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
