import React, { useEffect, useMemo, useState } from 'react'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import {
  FaExternalLinkAlt,
  FaGithub,
  FaHeart,
  FaHeartBroken,
  FaRegStar,
  FaStar,
} from 'react-icons/fa'
import { toaster } from '../../components/ui/toaster'
import apiClient from '@/utils/axiosConfig'

const formatDate = (value) => {
  if (!value) return 'Not specified'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not specified'
    : new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date)
}

const DetailRow = ({ label, children }) => (
  <Box py={4} borderBottom="1px solid" borderColor={'border.subtle'}>
    <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.12em">
      {label}
    </Text>
    <Text mt={1} color={'fg.default'} fontWeight="600">{children}</Text>
  </Box>
)

export default function ProjectDetails({ project, openLink, handleFavorite, isFavorite }) {
  const [reviews, setReviews] = useState([])
  const [tempStars, setTempStars] = useState(0)
  const [comment, setComment] = useState('')
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const projectId = project?._id ?? project?.id
  const liveUrl = project.liveDemoLink || project.externalLink
  const technologies = useMemo(
    () => Array.from(new Set([...(project.languages || []), ...(project.tags || [])])),
    [project.languages, project.tags]
  )

  useEffect(() => {
    if (!projectId) return
    let active = true

    const loadReviews = async () => {
      setLoadingReviews(true)
      try {
        const { data } = await apiClient.get(`/api/projects/${projectId}/reviews`)
        if (active) setReviews(Array.isArray(data) ? data : data?.reviews ?? [])
      } catch {
        if (active) setReviews([])
      } finally {
        if (active) setLoadingReviews(false)
      }
    }

    loadReviews()
    return () => { active = false }
  }, [projectId])

  const submitReview = async () => {
    if (!projectId || submittingReview) return
    setSubmittingReview(true)
    try {
      const payload = { stars: tempStars, comment: comment.trim() }
      const { data } = await apiClient.post(`/api/projects/${projectId}/reviews`, payload)
      setReviews((current) => (data?.review ? [data.review, ...current] : current))
      setTempStars(0)
      setComment('')
      toaster.create({ title: 'Review submitted', description: 'Thanks for the review!', type: 'success' })
    } catch {
      toaster.create({ title: 'Review not saved', description: 'Could not save review.', type: 'error' })
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <Stack gap={0}>
      <AspectRatio ratio={16 / 8} bg={'bg.raised'}>
        <Image
          src={project.imageUrl || '/placeholder.svg'}
          alt={`${project.title} project overview`}
          objectFit="cover"
          loading="lazy"
        />
      </AspectRatio>

      <Box px={{ base: 5, md: 8 }} py={{ base: 7, md: 10 }}>
        <Stack gap={10}>
          <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: 8, lg: 14 }} alignItems="start">
            <Stack gridColumn={{ lg: 'span 8' }} gap={6}>
              <Box>
                <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} textTransform="uppercase" letterSpacing="0.14em">
                  Project overview
                </Text>
                <Heading as="h3" fontFamily={'heading'} fontSize={{ base: '2xl', md: '4xl' }} fontWeight="500" lineHeight="1.22" mt={3}>
                  The question, method, and delivery.
                </Heading>
              </Box>

              <Text fontSize={{ base: 'md', md: 'lg' }} color={'fg.muted'} lineHeight="1.8">
                {project.description || 'This case study documents the decisions, tools, and delivery behind the project.'}
              </Text>

              <ButtonGroup gap={3} flexWrap="wrap">
                {liveUrl ? (
                  <Button colorPalette="brand" onClick={(event) => openLink(projectId, liveUrl, event)}>
                    Live project <FaExternalLinkAlt />
                  </Button>
                ) : null}
                {project.githubLink ? (
                  <Button variant="outline" onClick={(event) => openLink(projectId, project.githubLink, event)}>
                    <FaGithub /> Source code
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  colorPalette="red"
                  aria-pressed={isFavorite}
                  onClick={() => handleFavorite(projectId)}
                >
                  <Icon as={isFavorite ? FaHeartBroken : FaHeart} aria-hidden="true" />
                  {isFavorite ? 'Remove favourite' : 'Save project'}
                </Button>
              </ButtonGroup>

              <Separator borderColor={'border.subtle'} />

              <Box>
                <Heading as="h4" fontFamily={'heading'} fontSize="2xl" lineHeight="1.3" mb={3}>
                  Approach and delivery
                </Heading>
                <Text color={'fg.muted'} lineHeight="1.8">
                  {project.metadata || (
                    technologies.length
                      ? `The project was delivered with ${technologies.join(', ')}, connecting the technical implementation to the project objective.`
                      : 'The implementation was shaped around the project objective and the clearest practical route to delivery.'
                  )}
                </Text>
              </Box>

              {technologies.length ? (
                <Box>
                  <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.12em" mb={3}>
                    Methods and tools
                  </Text>
                  <Flex gap={2} wrap="wrap">
                    {technologies.map((technology) => (
                      <Badge key={technology} bg={'accent.subtle'} color={'fg.default'} borderRadius="full" px={3} py={1.5} fontWeight="600">
                        {technology}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              ) : null}
            </Stack>

            <Box gridColumn={{ lg: 'span 4' }} borderTop="2px solid" borderColor={'accent.default'}>
              <DetailRow label="Discipline">{project.category || 'Not specified'}</DetailRow>
              <DetailRow label="Status">{project.status || 'Not specified'}</DetailRow>
              <DetailRow label="Updated">{formatDate(project.lastUpdatedDate || project.createdDate)}</DetailRow>
              <DetailRow label="Engagement">
                {project.views ? `${project.views} view${project.views === 1 ? '' : 's'}` : 'New project'}
              </DetailRow>
            </Box>
          </SimpleGrid>

          <Box bg={'bg.raised'} border="1px solid" borderColor={'border.subtle'} p={{ base: 5, md: 7 }}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 10, lg: 14 }}>
              <Box>
                <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} textTransform="uppercase" letterSpacing="0.14em">
                  Community feedback
                </Text>
                <Heading as="h3" fontFamily={'heading'} fontSize="2xl" lineHeight="1.3" mt={2} mb={5}>
                  Reviews
                </Heading>

                {loadingReviews ? (
                  <HStack color={'fg.muted'} role="status"><Spinner size="sm" /><Text>Loading reviews</Text></HStack>
                ) : reviews.length === 0 ? (
                  <Text color={'fg.muted'}>No reviews yet. Be the first to leave thoughtful feedback.</Text>
                ) : (
                  <Stack gap={5}>
                    {reviews.map((review, index) => (
                      <Box key={review._id ?? `${review.date}-${index}`} pb={5} borderBottom="1px solid" borderColor={'border.subtle'}>
                        <HStack gap={2} mb={2}>
                          <HStack gap={0.5} aria-label={`${review.stars} out of 5 stars`}>
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Icon key={starIndex} as={FaStar} boxSize={3.5} color={starIndex < review.stars ? 'yellow.500' : 'border.subtle'} aria-hidden="true" />
                            ))}
                          </HStack>
                          <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'}>
                            {review.date ? new Date(review.date).toLocaleDateString() : ''}
                          </Text>
                        </HStack>
                        <Text color={'fg.default'}>{review.comment}</Text>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Heading as="h3" fontFamily={'heading'} fontSize="2xl" lineHeight="1.3" mb={2}>
                  Leave a review
                </Heading>
                <Text color={'fg.muted'} mb={4}>Share a rating and a concise note about the work.</Text>
                <HStack gap={1} mb={3} role="group" aria-label="Choose a project rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <IconButton
                      key={index}
                      aria-label={`${index + 1} star`}
                      aria-pressed={tempStars === index + 1}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTempStars(index + 1)}
                    >
                      <Icon as={index < tempStars ? FaStar : FaRegStar} color={index < tempStars ? 'yellow.500' : 'fg.muted'} />
                    </IconButton>
                  ))}
                </HStack>
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="What did you think?"
                  bg={'bg.surface'}
                  color={'fg.default'}
                  borderColor={'border.subtle'}
                  minH="110px"
                  mb={3}
                  _focusVisible={{ borderColor: 'accent.default', boxShadow: 'none' }}
                />
                <Button
                  onClick={submitReview}
                  colorPalette="brand"
                  disabled={!tempStars || comment.trim() === ''}
                  loading={submittingReview}
                  loadingText="Submitting"
                >
                  Submit review
                </Button>
              </Box>
            </SimpleGrid>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}
