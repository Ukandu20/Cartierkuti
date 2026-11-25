import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  IconButton,
  Link as ChakraLink,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useResumeDownload } from '@/hooks/useResumeDownload'
import { SectionLabel, SurfaceCard } from '@/components/ui/DesignSystem'
import apiClient from '@/utils/axiosConfig'
import { getSelectedPublicProjects } from '@/services/projectService'
import { ErrorState } from '@/components/ui/StateFeedback'
import { absoluteUrl, siteTitle } from '@/utils/siteConfig'
import PortfolioProjectCard from '@/pages/Portfolio/ProjectCard'
import { useProjectFavorites } from '@/hooks/useProjectFavorites'
import { getPublicResume } from '@/services/resumeService'
import { useWorkingPrinciples } from '@/hooks/useWorkingPrinciples'
import { normalizeHomeContent } from '@/utils/homeContent'

const AnalysisCanvas = () => {
  const bars = [34, 52, 45, 68, 61, 82, 74, 91]
  const principles = useWorkingPrinciples()

  return (
    <SurfaceCard
      aria-hidden="true"
      w="full"
      maxW="560px"
      boxShadow="md"
      overflow="hidden"
    >
      <Flex px={5} py={4} justify="space-between" align="center" borderBottom="1px solid" borderColor={'border.subtle'}>
        <Box>
          <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.14em">
            Analysis workflow
          </Text>
          <Text mt={1} fontFamily={'body'} fontWeight="600" color={'fg.default'}>
            From raw signals to decisions
          </Text>
        </Box>
        <Flex align="center" gap={2} color={'accent.default'}>
          <Box boxSize="7px" borderRadius="full" bg="currentColor" />
          <Text fontFamily={'mono'} fontSize="xs">READY</Text>
        </Flex>
      </Flex>

      <Box p={{ base: 5, md: 7 }}>
        <Flex h="210px" align="flex-end" gap={{ base: 2, md: 3 }} px={2} borderBottom="1px solid" borderColor={'border.subtle'}>
          {bars.map((height, index) => (
            <Box key={height + index} flex="1" h={`${height}%`} bg={index >= 5 ? 'accent.default' : 'accent.subtle'} borderRadius="6px 6px 0 0" />
          ))}
        </Flex>
        <SimpleGrid columns={3} gap={3} mt={5}>
          {principles.slice(0, 3).map(({ title: label }, index) => (
            <Box key={label} borderTop="1px solid" borderColor={'border.subtle'} pt={3}>
              <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'}>{String(index + 1).padStart(2, '0')}</Text>
              <Text mt={1} fontFamily={'body'} fontWeight="600" color={'fg.default'}>{label}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </SurfaceCard>
  )
}

const Hero = ({ content }) => {
  const resumeDownload = useResumeDownload()

  return (
    <Box as="section" aria-labelledby="hero-heading" bg={'bg.canvas'} px={{ base: 5, md: 10 }} py={{ base: 14, md: 20 }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} alignItems="center" gap={{ base: 12, lg: 16 }} maxW="7xl" mx="auto">
        <Stack gap={7} align="flex-start">
          <Text fontFamily={'mono'} fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color={'accent.default'}>
            {content.heroEyebrow}
          </Text>
          <Heading
            as="h1"
            id="hero-heading"
            fontFamily={'heading'}
            fontSize={{ base: '4xl', sm: '5xl', md: '6xl' }}
            fontWeight="500"
            color={'fg.default'}
            letterSpacing="-0.035em"
            lineHeight={{ base: '1.2', md: '1.12' }}
            maxW="760px"
          >
            {content.heroLead}{' '}
            <Box as="span" color={'accent.default'}>{content.heroAccent}</Box>
          </Heading>
          <Text fontFamily={'body'} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.7" color={'fg.muted'} maxW="680px">
            {content.heroDescription}
          </Text>
          <ButtonGroup w={{ base: 'full', sm: 'auto' }} gap={3} flexDirection={{ base: 'column', sm: 'row' }} alignItems="stretch">
            <Button asChild size="lg" colorPalette="brand" fontFamily={'body'}>
              <Link to="/portfolio">View selected work <FaArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" colorPalette="brand" fontFamily={'body'}>
              <Link to="/contact">Let&apos;s collaborate</Link>
            </Button>
          </ButtonGroup>
          <ChakraLink
            href={resumeDownload.url}
            download={resumeDownload.filename}
            display="inline-flex"
            alignItems="center"
            gap={2}
            fontFamily={'body'}
            fontWeight="600"
            color={'fg.muted'}
            _hover={{ color: 'accent.default' }}
          >
            <FaDownload /> Download résumé
          </ChakraLink>
        </Stack>
        <Flex display={{ base: 'none', lg: 'flex' }} justify="flex-end">
          <AnalysisCanvas />
        </Flex>
      </SimpleGrid>
    </Box>
  )
}

const SelectedWorkCarousel = ({ projects, onReviewSaved }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const { favorites, toggleFavorite } = useProjectFavorites()

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(projects.length - 1, 0)))
  }, [projects.length])

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + projects.length) % projects.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % projects.length)
  }

  const hitAndOpen = (id, url, event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()
    if (!url) return
    apiClient.patch(`/api/projects/${id}/hit`).catch(() => {})
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected projects"
    >
      <Box overflow="hidden" borderRadius="lg">
        <Flex
          align="stretch"
          transform={`translateX(-${activeIndex * 100}%)`}
          transition="transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)"
          _motionReduce={{ transition: 'none' }}
        >
          {projects.map((project, index) => (
            <Box
              key={project.id}
              flex="0 0 100%"
              minW={0}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${projects.length}: ${project.title}`}
              aria-hidden={index !== activeIndex}
              inert={index !== activeIndex ? '' : undefined}
            >
              <PortfolioProjectCard
                project={project}
                favorites={favorites}
                handleFavorite={toggleFavorite}
                hitAndOpen={hitAndOpen}
                onReviewSaved={onReviewSaved}
                featured
              />
            </Box>
          ))}
        </Flex>
      </Box>

      {projects.length > 1 ? (
        <Flex mt={6} align="center" justify="space-between" gap={4} wrap="wrap">
          <Flex gap={2} aria-label="Choose a selected project">
            {projects.map((project, index) => (
              <Button
                key={project.id}
                size="xs"
                minW={10}
                h={8}
                p={0}
                variant={index === activeIndex ? 'solid' : 'outline'}
                colorPalette="brand"
                aria-label={`Show ${project.title}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
              >{index + 1}</Button>
            ))}
          </Flex>

          <ButtonGroup size="sm" variant="outline" colorPalette="brand">
            <IconButton aria-label="Previous selected project" onClick={showPrevious}>
              <FaChevronLeft />
            </IconButton>
            <IconButton aria-label="Next selected project" onClick={showNext}>
              <FaChevronRight />
            </IconButton>
          </ButtonGroup>
        </Flex>
      ) : null}
    </Box>
  )
}

const FeaturedWork = ({ content }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')
  const load = useCallback(async (fresh = false) => {
    setLoading(true)
    setError('')
    try { setProjects(await getSelectedPublicProjects({ fresh })) }
    catch { setError('Selected projects could not be loaded.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const selected = projects

  return (
    <Box as="section" aria-labelledby="featured-heading" bg={'bg.raised'} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Box maxW="7xl" mx="auto">
        <Flex justify="space-between" align="flex-end" gap={6} wrap="wrap" mb={10}>
          <Stack gap={3} maxW="700px">
            <SectionLabel number="01" color={'accent.default'}>Selected work</SectionLabel>
            <Heading id="featured-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '5xl' }} color={'fg.default'}>
              {content.workTitle}
            </Heading>
            <Text fontFamily={'body'} fontSize="lg" color={'fg.muted'}>
              {content.workDescription}
            </Text>
          </Stack>
          <Button asChild variant="outline" colorPalette="brand">
            <Link to="/portfolio">Explore all projects <FaArrowRight /></Link>
          </Button>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5} aria-label="Loading selected projects" role="status">
            <Skeleton minH="420px" borderRadius="lg" gridColumn={{ lg: 'span 2' }} />
            <Skeleton minH="420px" borderRadius="lg" />
          </SimpleGrid>
        ) : error ? (
          <ErrorState title={error} description="Please try loading the selected work again." onRetry={() => load(true)} />
        ) : selected.length ? (
          <SelectedWorkCarousel projects={selected} onReviewSaved={(id, summary) => setProjects(current => current.map(project => project.id === id ? { ...project, ...summary } : project))} />
        ) : (
          <Box py={12} borderY="1px solid" borderColor={'border.subtle'}>
            <Text fontFamily={'body'} color={'fg.muted'}>Selected projects are being prepared. Visit the full portfolio to explore the latest work.</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

const Capabilities = ({ content }) => {
  const capabilities = [1, 2, 3].map(number => ({
    number: String(number).padStart(2, '0'),
    title: content[`capability${number}Title`],
    desc: content[`capability${number}Description`],
  }))

  return (
    <Box as="section" aria-labelledby="capabilities-heading" bg={'bg.canvas'} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Box maxW="7xl" mx="auto">
        <Stack gap={3} mb={10} maxW="720px">
          <SectionLabel number="02" color={'accent.default'}>Capabilities</SectionLabel>
          <Heading id="capabilities-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '5xl' }} color={'fg.default'}>
            {content.capabilitiesTitle}
          </Heading>
        </Stack>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
          {capabilities.map((capability) => (
            <SurfaceCard key={capability.number} p={{ base: 6, md: 7 }} boxShadow="none">
              <Stack gap={5}>
              <Text fontFamily={'mono'} fontSize="sm" color={'accent.default'}>{capability.number}</Text>
              <Heading as="h3" fontFamily={'heading'} fontSize="2xl" color={'fg.default'}>{capability.title}</Heading>
              <Text fontFamily={'body'} fontSize="lg" color={'fg.muted'}>{capability.desc}</Text>
              </Stack>
            </SurfaceCard>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

const ProfileSnapshot = ({ summary, content }) => {

  if (!summary) return null

  return (
    <Box as="section" aria-labelledby="profile-heading" bg={'bg.surface'} px={{ base: 5, md: 10 }} py={{ base: 16, md: 20 }} borderY="1px solid" borderColor={'border.subtle'}>
      <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 12 }} gap={{ base: 8, lg: 14 }} alignItems="start">
        <Stack gridColumn={{ lg: 'span 4' }} gap={3}>
          <SectionLabel number="03" color={'accent.default'}>Profile</SectionLabel>
          <Heading id="profile-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '4xl' }} color={'fg.default'}>
            {content.profileTitle}
          </Heading>
        </Stack>
        <Stack gridColumn={{ lg: 'span 8' }} gap={5}>
          <Text fontFamily={'body'} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.75" color={'fg.muted'}>
            {summary}
          </Text>
          <ChakraLink asChild color={'accent.default'} fontFamily={'body'} fontWeight="700" alignSelf="flex-start">
            <Link to="/about">More about my approach <FaArrowRight /></Link>
          </ChakraLink>
        </Stack>
      </SimpleGrid>
    </Box>
  )
}

export function HomeContent({ content, summary }) {
  return <>
    <Hero content={content} />
    <FeaturedWork content={content} />
    <Capabilities content={content} />
    <ProfileSnapshot summary={summary} content={content} />
  </>
}

export default function Home() {
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState(() => normalizeHomeContent())
  useEffect(() => {
    let active = true
    getPublicResume().then(data => { if (active) { setSummary(data?.summary || ''); setContent(normalizeHomeContent(data?.homeContent)) } }).catch(() => {})
    return () => { active = false }
  }, [])
  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content="Portfolio of Preston Ukandu, a data science and sports analytics practitioner building decision-ready dashboards, models, and reproducible analytical workflows." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content="Explore data science, decision intelligence, and sports analytics projects by Preston Ukandu." />
        <meta property="og:url" content={absoluteUrl('/')} />
        <meta property="og:image" content={absoluteUrl('/personalportfolio.png')} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <HomeContent content={content} summary={summary} />
    </>
  )
}
