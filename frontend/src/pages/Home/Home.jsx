import React, { useEffect, useMemo, useState } from 'react'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Image,
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
  FaDatabase,
  FaDownload,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub,
  FaRunning,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useColorMode } from '@/components/Theme/color-mode'
import { useResumeDownload } from '@/hooks/useResumeDownload'
import apiClient from '@/utils/axiosConfig'
import { editorialFonts, getEditorialTokens } from '@/utils/editorialTheme'
import { normalizeProjects } from '@/utils/projectNormalizer'
import { absoluteUrl, siteTitle } from '@/utils/siteConfig'

const SectionLabel = ({ number, children, color }) => (
  <Text
    fontFamily={editorialFonts.mono}
    fontSize="xs"
    letterSpacing="0.2em"
    textTransform="uppercase"
    color={color}
  >
    {number} / {children}
  </Text>
)

const AnalysisCanvas = ({ tokens }) => {
  const bars = [34, 52, 45, 68, 61, 82, 74, 91]

  return (
    <Box
      aria-hidden="true"
      w="full"
      maxW="560px"
      bg={tokens.surface}
      border="1px solid"
      borderColor={tokens.rule}
      borderRadius="2xl"
      boxShadow="0 26px 70px rgba(15, 118, 110, 0.12)"
      overflow="hidden"
    >
      <Flex px={5} py={4} justify="space-between" align="center" borderBottom="1px solid" borderColor={tokens.rule}>
        <Box>
          <Text fontFamily={editorialFonts.mono} fontSize="xs" color={tokens.muted} textTransform="uppercase" letterSpacing="0.14em">
            Analysis workflow
          </Text>
          <Text mt={1} fontFamily={editorialFonts.body} fontWeight="600" color={tokens.ink}>
            From raw signals to decisions
          </Text>
        </Box>
        <Flex align="center" gap={2} color={tokens.accentData}>
          <Box boxSize="7px" borderRadius="full" bg="currentColor" />
          <Text fontFamily={editorialFonts.mono} fontSize="xs">READY</Text>
        </Flex>
      </Flex>

      <Box p={{ base: 5, md: 7 }}>
        <Flex h="210px" align="flex-end" gap={{ base: 2, md: 3 }} px={2} borderBottom="1px solid" borderColor={tokens.rule}>
          {bars.map((height, index) => (
            <Box key={height + index} flex="1" h={`${height}%`} bg={index >= 5 ? tokens.accentData : tokens.accentSoft} borderRadius="6px 6px 0 0" />
          ))}
        </Flex>
        <SimpleGrid columns={3} gap={3} mt={5}>
          {[
            ['01', 'Frame'],
            ['02', 'Model'],
            ['03', 'Explain'],
          ].map(([number, label]) => (
            <Box key={label} borderTop="1px solid" borderColor={tokens.rule} pt={3}>
              <Text fontFamily={editorialFonts.mono} fontSize="xs" color={tokens.accentData}>{number}</Text>
              <Text mt={1} fontFamily={editorialFonts.body} fontWeight="600" color={tokens.ink}>{label}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

const Hero = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)
  const resumeDownload = useResumeDownload()

  return (
    <Box as="section" aria-labelledby="hero-heading" bg={tokens.bg} px={{ base: 5, md: 10 }} py={{ base: 14, md: 20 }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} alignItems="center" gap={{ base: 12, lg: 16 }} maxW="7xl" mx="auto">
        <Stack gap={7} align="flex-start">
          <Text fontFamily={editorialFonts.mono} fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color={tokens.accentData}>
            Preston Ukandu · Data Science & Sports Analytics
          </Text>
          <Heading
            id="hero-heading"
            fontFamily={editorialFonts.heading}
            fontSize={{ base: '4xl', sm: '5xl', md: '6xl' }}
            fontWeight="600"
            color={tokens.ink}
            lineHeight="1.02"
            maxW="760px"
          >
            Turning complex data into{' '}
            <Box as="span" color={tokens.accentData}>clear decisions.</Box>
          </Heading>
          <Text fontFamily={editorialFonts.body} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.7" color={tokens.muted} maxW="680px">
            I build decision-ready dashboards, analytical models, and reproducible data products—bringing rigorous data science to business questions and sports performance.
          </Text>
          <ButtonGroup w={{ base: 'full', sm: 'auto' }} gap={3} flexDirection={{ base: 'column', sm: 'row' }} alignItems="stretch">
            <Button asChild size="lg" colorPalette="brand" fontFamily={editorialFonts.body}>
              <Link to="/portfolio">View selected work <FaArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" colorPalette="brand" fontFamily={editorialFonts.body}>
              <Link to="/contact">Let&apos;s collaborate</Link>
            </Button>
          </ButtonGroup>
          <ChakraLink
            href={resumeDownload.url}
            download={resumeDownload.filename}
            display="inline-flex"
            alignItems="center"
            gap={2}
            fontFamily={editorialFonts.body}
            fontWeight="600"
            color={tokens.muted}
            _hover={{ color: tokens.accentData }}
          >
            <FaDownload /> Download resume
          </ChakraLink>
        </Stack>
        <Flex justify={{ base: 'center', lg: 'flex-end' }}>
          <AnalysisCanvas tokens={tokens} />
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
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box as="section" aria-label="Core practice areas" bg={tokens.surface} borderY="1px solid" borderColor={tokens.rule} px={{ base: 5, md: 10 }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} maxW="7xl" mx="auto">
        {proofPoints.map(({ icon, label, note }, index) => (
          <Flex
            key={label}
            gap={4}
            py={6}
            px={{ base: 0, md: 6 }}
            borderLeftWidth={{ base: 0, md: index ? '1px' : 0 }}
            borderTopWidth={{ base: index ? '1px' : 0, md: 0 }}
            borderColor={tokens.rule}
          >
            <Icon as={icon} mt={1} color={tokens.accentData} boxSize={5} />
            <Box>
              <Text fontFamily={editorialFonts.body} fontWeight="700" color={tokens.ink}>{label}</Text>
              <Text fontFamily={editorialFonts.body} fontSize="sm" color={tokens.muted}>{note}</Text>
            </Box>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  )
}

const ProjectCard = ({ project, featured, tokens }) => {
  const tags = (project.tags?.length ? project.tags : project.languages || []).slice(0, 3)

  return (
    <Box
      as="article"
      gridColumn={{ base: 'auto', lg: featured ? 'span 2' : 'auto' }}
      bg={tokens.surface}
      border="1px solid"
      borderColor={tokens.rule}
      borderRadius="2xl"
      overflow="hidden"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{ transform: 'translateY(-3px)', boxShadow: 'lg' }}
      _motionReduce={{ transition: 'none', transform: 'none' }}
    >
      <SimpleGrid columns={{ base: 1, md: featured ? 2 : 1 }} h="full">
        <AspectRatio ratio={featured ? 4 / 3 : 16 / 10} bg={tokens.surfaceAlt}>
          <Image src={project.imageUrl || '/placeholder.svg'} alt="" objectFit="cover" loading="lazy" />
        </AspectRatio>
        <Stack p={{ base: 5, md: featured ? 8 : 6 }} gap={4} justify="center">
          <Flex align="center" justify="space-between" gap={3}>
            <Text fontFamily={editorialFonts.mono} fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" color={tokens.accentData}>
              {project.category || 'Data project'}
            </Text>
            {project.featured && <Badge colorPalette="teal" variant="subtle">Featured</Badge>}
          </Flex>
          <Heading as="h3" fontFamily={editorialFonts.heading} fontSize={featured ? { base: '2xl', md: '3xl' } : '2xl'} color={tokens.ink}>
            {project.title}
          </Heading>
          <Text fontFamily={editorialFonts.body} color={tokens.muted} lineClamp={featured ? 4 : 3}>{project.description}</Text>
          {tags.length > 0 && (
            <Flex gap={2} wrap="wrap">
              {tags.map((tag) => <Badge key={tag} variant="outline" colorPalette="gray">{tag}</Badge>)}
            </Flex>
          )}
          <ButtonGroup size="sm" gap={2} flexWrap="wrap" pt={2}>
            {project.liveDemoLink || project.externalLink ? (
              <Button asChild colorPalette="brand">
                <a href={project.liveDemoLink || project.externalLink} target="_blank" rel="noreferrer">Open project <FaExternalLinkAlt /></a>
              </Button>
            ) : null}
            {project.githubLink ? (
              <Button asChild variant="outline">
                <a href={project.githubLink} target="_blank" rel="noreferrer"><FaGithub /> Source</a>
              </Button>
            ) : null}
          </ButtonGroup>
        </Stack>
      </SimpleGrid>
    </Box>
  )
}

const FeaturedWork = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)
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
    <Box as="section" aria-labelledby="featured-heading" bg={tokens.surfaceAlt} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Box maxW="7xl" mx="auto">
        <Flex justify="space-between" align="flex-end" gap={6} wrap="wrap" mb={10}>
          <Stack gap={3} maxW="700px">
            <SectionLabel number="01" color={tokens.accentData}>Selected work</SectionLabel>
            <Heading id="featured-heading" fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '5xl' }} color={tokens.ink}>
              Evidence before adjectives.
            </Heading>
            <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>
              A selection of analytical work across modeling, visualization, automation, and decision support.
            </Text>
          </Stack>
          <Button asChild variant="outline" colorPalette="brand">
            <Link to="/portfolio">Explore all projects <FaArrowRight /></Link>
          </Button>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5} aria-label="Loading selected projects" role="status">
            <Skeleton minH="420px" borderRadius="2xl" gridColumn={{ lg: 'span 2' }} />
            <Skeleton minH="420px" borderRadius="2xl" />
          </SimpleGrid>
        ) : selected.length ? (
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5} alignItems="stretch">
            {selected.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0} tokens={tokens} />)}
          </SimpleGrid>
        ) : (
          <Box py={12} borderY="1px solid" borderColor={tokens.rule}>
            <Text fontFamily={editorialFonts.body} color={tokens.muted}>Selected projects are being prepared. Visit the full portfolio to explore the latest work.</Text>
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
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box as="section" aria-labelledby="capabilities-heading" bg={tokens.bg} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Box maxW="7xl" mx="auto">
        <Stack gap={3} mb={10} maxW="720px">
          <SectionLabel number="02" color={tokens.accentData}>Capabilities</SectionLabel>
          <Heading id="capabilities-heading" fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '5xl' }} color={tokens.ink}>
            Three ways I approach the work.
          </Heading>
        </Stack>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
          {capabilities.map((capability) => (
            <Stack key={capability.title} bg={tokens.surface} border="1px solid" borderColor={tokens.rule} borderRadius="2xl" p={{ base: 6, md: 7 }} gap={5}>
              <Text fontFamily={editorialFonts.mono} fontSize="sm" color={tokens.accentData}>{capability.number}</Text>
              <Heading as="h3" fontFamily={editorialFonts.heading} fontSize="2xl" color={tokens.ink}>{capability.title}</Heading>
              <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>{capability.desc}</Text>
              <Separator borderColor={tokens.rule} />
              <Flex gap={2} wrap="wrap">
                {capability.tools.map((tool) => <Badge key={tool} variant="subtle" colorPalette="gray">{tool}</Badge>)}
              </Flex>
            </Stack>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

const ProfileSnapshot = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box as="section" aria-labelledby="profile-heading" bg={tokens.surface} px={{ base: 5, md: 10 }} py={{ base: 16, md: 20 }} borderY="1px solid" borderColor={tokens.rule}>
      <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 12 }} gap={{ base: 8, lg: 14 }} alignItems="start">
        <Stack gridColumn={{ lg: 'span 4' }} gap={3}>
          <SectionLabel number="03" color={tokens.accentData}>Profile</SectionLabel>
          <Heading id="profile-heading" fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '4xl' }} color={tokens.ink}>
            Analytical rigor, practical delivery.
          </Heading>
        </Stack>
        <Stack gridColumn={{ lg: 'span 8' }} gap={5}>
          <Text fontFamily={editorialFonts.body} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.75" color={tokens.muted}>
            My work sits where statistical thinking, clear communication, and useful software meet. I care about questions that can be framed precisely, analysis that can be reproduced, and conclusions that help someone act—especially in data science and sports performance.
          </Text>
          <ChakraLink asChild color={tokens.accentData} fontFamily={editorialFonts.body} fontWeight="700" alignSelf="flex-start">
            <Link to="/about">More about my approach <FaArrowRight /></Link>
          </ChakraLink>
        </Stack>
      </SimpleGrid>
    </Box>
  )
}

const CollaborationCta = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box as="section" aria-labelledby="collaboration-heading" bg={tokens.bg} px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <Flex
        maxW="7xl"
        mx="auto"
        bg={tokens.accentData}
        color={colorMode === 'light' ? 'white' : '#0B2421'}
        borderRadius="2xl"
        px={{ base: 6, md: 12 }}
        py={{ base: 10, md: 14 }}
        align={{ base: 'flex-start', lg: 'center' }}
        justify="space-between"
        direction={{ base: 'column', lg: 'row' }}
        gap={8}
      >
        <Stack gap={3} maxW="760px">
          <Text fontFamily={editorialFonts.mono} fontSize="xs" textTransform="uppercase" letterSpacing="0.18em">Have a question worth measuring?</Text>
          <Heading id="collaboration-heading" fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '5xl' }} lineHeight="1.08">
            Let&apos;s turn it into something decision-ready.
          </Heading>
          <Text fontFamily={editorialFonts.body} fontSize="lg" opacity={0.9}>
            Open to data science, dashboarding, and sports analytics collaborations.
          </Text>
        </Stack>
        <Button asChild size="lg" bg={tokens.surface} color={tokens.ink} _hover={{ bg: tokens.surfaceAlt }} flexShrink={0}>
          <Link to="/contact"><FaEnvelope /> Start a conversation</Link>
        </Button>
      </Flex>
    </Box>
  )
}

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
