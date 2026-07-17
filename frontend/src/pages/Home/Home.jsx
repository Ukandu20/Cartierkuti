import React, { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link as ChakraLink,
  Separator,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import {
  FaArrowRight,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaDownload,
  FaPause,
  FaPlay,
  FaRunning,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useResumeDownload } from '@/hooks/useResumeDownload'
import { PageCta, SectionLabel, SurfaceCard } from '@/components/ui/DesignSystem'
import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'
import { absoluteUrl, siteTitle } from '@/utils/siteConfig'
import PortfolioProjectCard from '@/pages/Portfolio/ProjectCard'

const SELECTED_WORK_AUTOPLAY_DELAY = 5000

const AnalysisCanvas = () => {
  const bars = [34, 52, 45, 68, 61, 82, 74, 91]

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
          {[
            ['01', 'Frame'],
            ['02', 'Model'],
            ['03', 'Explain'],
          ].map(([number, label]) => (
            <Box key={label} borderTop="1px solid" borderColor={'border.subtle'} pt={3}>
              <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'}>{number}</Text>
              <Text mt={1} fontFamily={'body'} fontWeight="600" color={'fg.default'}>{label}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </SurfaceCard>
  )
}

const Hero = () => {
  const resumeDownload = useResumeDownload()

  return (
    <Box as="section" aria-labelledby="hero-heading" bg={'bg.canvas'} px={{ base: 5, md: 10 }} py={{ base: 14, md: 20 }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} alignItems="center" gap={{ base: 12, lg: 16 }} maxW="7xl" mx="auto">
        <Stack gap={7} align="flex-start">
          <Text fontFamily={'mono'} fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color={'accent.default'}>
            Preston Ukandu · Data Science & Sports Analytics
          </Text>
          <Heading
            id="hero-heading"
            fontFamily={'heading'}
            fontSize={{ base: '4xl', sm: '5xl', md: '6xl' }}
            fontWeight="600"
            color={'fg.default'}
            lineHeight="1.02"
            maxW="760px"
          >
            Turning complex data into{' '}
            <Box as="span" color={'accent.default'}>clear decisions.</Box>
          </Heading>
          <Text fontFamily={'body'} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.7" color={'fg.muted'} maxW="680px">
            I build decision-ready dashboards, analytical models, and reproducible data products—bringing rigorous data science to business questions and sports performance.
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
            <FaDownload /> Download resume
          </ChakraLink>
        </Stack>
        <Flex justify={{ base: 'center', lg: 'flex-end' }}>
          <AnalysisCanvas />
        </Flex>
      </SimpleGrid>
    </Box>
  )
}

const proofPoints = [
  { icon: FaChartLine, label: 'Decision intelligence', note: 'Dashboards, KPIs, and analytical storytelling' },
  { icon: FaRunning, label: 'Sports analytics', note: 'Performance, trends, and game context' },
  { icon: FaDatabase, label: 'Reproducible workflows', note: 'Clean data, evaluation, and reliable delivery' },
]

const ProofStrip = () => {

  return (
    <Box as="section" aria-label="Core practice areas" bg={'bg.surface'} borderY="1px solid" borderColor={'border.subtle'} px={{ base: 5, md: 10 }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} maxW="7xl" mx="auto">
        {proofPoints.map(({ icon, label, note }, index) => (
          <Flex
            key={label}
            gap={4}
            py={6}
            px={{ base: 0, md: 6 }}
            borderLeftWidth={{ base: 0, md: index ? '1px' : 0 }}
            borderTopWidth={{ base: index ? '1px' : 0, md: 0 }}
            borderColor={'border.subtle'}
          >
            <Icon as={icon} mt={1} color={'accent.default'} boxSize={5} />
            <Box>
              <Text fontFamily={'body'} fontWeight="700" color={'fg.default'}>{label}</Text>
              <Text fontFamily={'body'} fontSize="sm" color={'fg.muted'}>{note}</Text>
            </Box>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  )
}

const SelectedWorkCarousel = ({ projects }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [favorites, setFavorites] = useState([])
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(projects.length - 1, 0)))
  }, [projects.length])

  useEffect(() => {
    if (projects.length < 2 || isPaused || isHovered || isFocusWithin) return undefined

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % projects.length)
    }, SELECTED_WORK_AUTOPLAY_DELAY)

    return () => window.clearInterval(interval)
  }, [isFocusWithin, isHovered, isPaused, projects.length])

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + projects.length) % projects.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % projects.length)
  }

  const toggleFavorite = (id) => {
    setFavorites((current) => (
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    ))
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusWithin(false)
      }}
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
                minW={index === activeIndex ? 10 : 6}
                h={2}
                p={0}
                borderRadius="full"
                bg={index === activeIndex ? 'accent.default' : 'border.subtle'}
                aria-label={`Show ${project.title}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
                transition="width 0.2s ease, background-color 0.2s ease"
                _hover={{ bg: index === activeIndex ? 'accent.default' : 'fg.muted' }}
              />
            ))}
          </Flex>

          <ButtonGroup size="sm" variant="outline" colorPalette="brand">
            <IconButton aria-label="Previous selected project" onClick={showPrevious}>
              <FaChevronLeft />
            </IconButton>
            <IconButton
              aria-label={isPaused ? 'Resume carousel' : 'Pause carousel'}
              onClick={() => setIsPaused((current) => !current)}
            >
              {isPaused ? <FaPlay /> : <FaPause />}
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

const FeaturedWork = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiClient.get('/api/projects')
      .then(({ data }) => {
        if (active) setProjects(normalizeProjects(data))
      })
      .catch(() => {
        if (active) setProjects([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const selected = useMemo(
    () => [...projects]
      .sort((a, b) => Number(b.featured) - Number(a.featured) || (b.views || 0) - (a.views || 0))
      .slice(0, 3),
    [projects],
  )

  return (
    <Box as="section" aria-labelledby="featured-heading" bg={'bg.raised'} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Box maxW="7xl" mx="auto">
        <Flex justify="space-between" align="flex-end" gap={6} wrap="wrap" mb={10}>
          <Stack gap={3} maxW="700px">
            <SectionLabel number="01" color={'accent.default'}>Selected work</SectionLabel>
            <Heading id="featured-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '5xl' }} color={'fg.default'}>
              Evidence before adjectives.
            </Heading>
            <Text fontFamily={'body'} fontSize="lg" color={'fg.muted'}>
              A selection of analytical work across modeling, visualization, automation, and decision support.
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
        ) : selected.length ? (
          <SelectedWorkCarousel projects={selected} />
        ) : (
          <Box py={12} borderY="1px solid" borderColor={'border.subtle'}>
            <Text fontFamily={'body'} color={'fg.muted'}>Selected projects are being prepared. Visit the full portfolio to explore the latest work.</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

const capabilities = [
  {
    number: '01',
    title: 'Decision intelligence',
    desc: 'Turn business questions into KPI systems, dashboards, forecasts, and concise analytical narratives.',
    tools: ['SQL', 'Power BI', 'Tableau', 'Forecasting'],
  },
  {
    number: '02',
    title: 'Applied data science',
    desc: 'Build and evaluate models with careful validation, transparent assumptions, and reproducible workflows.',
    tools: ['Python', 'Pandas', 'scikit-learn', 'Experimentation'],
  },
  {
    number: '03',
    title: 'Sports analytics',
    desc: 'Study player and team performance, match trends, scouting questions, and the context behind the numbers.',
    tools: ['Performance data', 'Comparisons', 'Game context', 'Storytelling'],
  },
]

const Capabilities = () => {

  return (
    <Box as="section" aria-labelledby="capabilities-heading" bg={'bg.canvas'} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Box maxW="7xl" mx="auto">
        <Stack gap={3} mb={10} maxW="720px">
          <SectionLabel number="02" color={'accent.default'}>Capabilities</SectionLabel>
          <Heading id="capabilities-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '5xl' }} color={'fg.default'}>
            Three ways I approach the work.
          </Heading>
        </Stack>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
          {capabilities.map((capability) => (
            <SurfaceCard key={capability.title} p={{ base: 6, md: 7 }} boxShadow="none">
              <Stack gap={5}>
              <Text fontFamily={'mono'} fontSize="sm" color={'accent.default'}>{capability.number}</Text>
              <Heading as="h3" fontFamily={'heading'} fontSize="2xl" color={'fg.default'}>{capability.title}</Heading>
              <Text fontFamily={'body'} fontSize="lg" color={'fg.muted'}>{capability.desc}</Text>
              <Separator borderColor={'border.subtle'} />
              <Flex gap={2} wrap="wrap">
                {capability.tools.map((tool) => <Badge key={tool} variant="subtle" colorPalette="gray">{tool}</Badge>)}
              </Flex>
              </Stack>
            </SurfaceCard>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

const ProfileSnapshot = () => {

  return (
    <Box as="section" aria-labelledby="profile-heading" bg={'bg.surface'} px={{ base: 5, md: 10 }} py={{ base: 16, md: 20 }} borderY="1px solid" borderColor={'border.subtle'}>
      <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 12 }} gap={{ base: 8, lg: 14 }} alignItems="start">
        <Stack gridColumn={{ lg: 'span 4' }} gap={3}>
          <SectionLabel number="03" color={'accent.default'}>Profile</SectionLabel>
          <Heading id="profile-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '4xl' }} color={'fg.default'}>
            Analytical rigor, practical delivery.
          </Heading>
        </Stack>
        <Stack gridColumn={{ lg: 'span 8' }} gap={5}>
          <Text fontFamily={'body'} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.75" color={'fg.muted'}>
            My work sits where statistical thinking, clear communication, and useful software meet. I care about questions that can be framed precisely, analysis that can be reproduced, and conclusions that help someone act—especially in data science and sports performance.
          </Text>
          <ChakraLink asChild color={'accent.default'} fontFamily={'body'} fontWeight="700" alignSelf="flex-start">
            <Link to="/about">More about my approach <FaArrowRight /></Link>
          </ChakraLink>
        </Stack>
      </SimpleGrid>
    </Box>
  )
}

const CollaborationCta = () => (
  <PageCta
    headingId="collaboration-heading"
    eyebrow="Have a question worth measuring?"
    title="Let's turn it into something decision-ready."
    description="Open to data science, dashboarding, and sports analytics collaborations."
  >
    <Link to="/contact">Start a conversation <FaArrowRight /></Link>
  </PageCta>
)

export default function Home() {
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
      <Hero />
      <ProofStrip />
      <FeaturedWork />
      <Capabilities />
      <ProfileSnapshot />
      <CollaborationCta />
    </>
  )
}
