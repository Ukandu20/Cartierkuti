// src/pages/Home/Home.jsx
'use client'

import React, { Suspense } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { FaArrowRight, FaDownload } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useColorMode } from '@/components/Theme/color-mode'
import { useResumeDownload } from '@/hooks/useResumeDownload'
import { absoluteUrl, siteTitle } from '@/utils/siteConfig'

const editorialFonts = {
  heading: "'Playfair Display', serif",
  body: "'Source Sans 3', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
}

const getEditorialTokens = (colorMode) => ({
  bg: colorMode === 'light' ? '#F6F4F1' : '#141414',
  surface: colorMode === 'light' ? '#FFFFFF' : '#1B1B1B',
  surfaceAlt: colorMode === 'light' ? '#FBFAF8' : '#222222',
  ink: colorMode === 'light' ? '#1A1A1A' : 'gray.100',
  muted: colorMode === 'light' ? '#4B4B4B' : 'gray.400',
  rule: colorMode === 'light' ? '#E2DED8' : 'gray.700',
  accentData: '#0F766E',
})

/* ------------------------------ Hero ------------------------------ */
const Hero = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)
  const resumeDownload = useResumeDownload()

  return (
    <Box as="section" role="region" aria-labelledby="hero-heading" bg={tokens.bg}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={8}
        minH={{ base: 'auto', md: 'calc(85vh - 90px)' }}
        px={{ base: 6, md: 10 }}
        py={{ base: 14, md: 20 }}
        maxW="5xl"
        mx="auto"
      >
        <Stack gap={6} align="center" textAlign="center">
          <Text
            fontFamily={editorialFonts.mono}
            fontSize="xs"
            letterSpacing="0.24em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            Data analytics / Artificial intelligence / Sports analytics
          </Text>

          <Heading
            id="hero-heading"
            fontFamily={editorialFonts.heading}
            fontSize={{ base: '4xl', md: '6xl' }}
            fontWeight="600"
            color={tokens.ink}
            lineHeight="1.05"
            textAlign="center"
          >
            <Box as="span" color={tokens.accentData}>Preston Ukandu</Box>
          </Heading>

          <Text
            fontFamily={editorialFonts.body}
            fontSize={{ base: 'lg', md: 'xl' }}
            color={tokens.muted}
            maxW="760px"
            textAlign="center"
          >
            <Box as="span" color={tokens.accentData}>Data science and analytics practitioner.</Box> I turn messy data into clear stories, useful models, and decision-ready dashboards. My work brings together statistical thinking, machine learning, and applied analysis, with a growing interest in sports performance and game intelligence.
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={6} w="full" pt={2}>
            {[
              'Dashboards and data storytelling',
              'Predictive modeling and evaluation',
              'Sports performance analytics',
            ].map((item) => (
              <Box key={item} borderTop="1px solid" borderColor={tokens.rule} pt={3}>
                <Text
                  fontFamily={editorialFonts.mono}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                  color={tokens.muted}
                >
                  {item}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          <ButtonGroup gap={4} pt={4} flexWrap="wrap" justifyContent={{ base: 'center', lg: 'flex-start' }}>
            <Button
              asChild
              size="lg"
              colorPalette="teal"
              fontFamily={editorialFonts.body}
            >
              <Link to="/portfolio">
                View Projects
                <Icon as={FaArrowRight} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              colorPalette="teal"
              fontFamily={editorialFonts.body}
            >
              <a href={resumeDownload.url} download={resumeDownload.filename}>
                <Icon as={FaDownload} aria-hidden="true" />
                Download Resume
              </a>
            </Button>
          </ButtonGroup>
        </Stack>
      </Flex>
    </Box>
  )
}

/* --------------------------- Featured projects --------------------------- */
const Projects = React.lazy(() =>
  import(
    /* webpackChunkName: "ProjectsCarousel" */
    '../../components/Carousel/Carousel'
  )
)

const FeaturedProjects = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="featured-heading"
      py={{ base: 12, md: 16 }}
      px={{ base: 6, md: 10 }}
    >
      <Box maxW="7xl" mx="auto">
        <Heading
          id="featured-heading"
          fontFamily={editorialFonts.heading}
          fontSize={{ base: '3xl', md: '4xl' }}
          color={tokens.ink}
        >
          Selected Work
        </Heading>
        <Text
          fontFamily={editorialFonts.body}
          fontSize="lg"
          color={tokens.muted}
          maxW="640px"
          mt={3}
          mb={10}
        >
          Projects centered on analytics, data storytelling, automation, and modeling.
        </Text>

        <Suspense fallback={<Spinner size="xl" />}>
          <Projects />
        </Suspense>
      </Box>
    </Box>
  )
}

/* ------------------------------ Snapshot ------------------------------ */
const focusAreas = [
  {
    title: 'Sports and Performance Analytics',
    desc: 'Explore player, team, and game data to surface trends, strengths, and decision points.',
  },
  {
    title: 'Decision Intelligence',
    desc: 'Model outcomes, track KPIs, and translate data into executive-ready insights.',
  },
  {
    title: 'Data Engineering Foundations',
    desc: 'Build reliable pipelines, clean datasets, and automated quality checks.',
  },
]

const AboutSnapshot = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box as="section" px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }}>
      <Box maxW="7xl" mx="auto">
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 10, lg: 16 }}>
          <Stack gap={4}>
            <Text
              fontFamily={editorialFonts.mono}
              fontSize="xs"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color={tokens.muted}
            >
              Profile snapshot
            </Text>
            <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '4xl' }} color={tokens.ink}>
              Analytics-first, model-minded.
            </Heading>
            <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>
              I focus on <Box as="span" fontWeight="600" color={tokens.ink}>analytics</Box>, statistical
              interpretation, and practical model evaluation. My goal is to deliver insights that are
              trusted, reproducible, and useful for business, product, and sports decisions.
            </Text>
          </Stack>

          <Stack gap={5} bg={tokens.surfaceAlt} border="1px solid" borderColor={tokens.rule} borderRadius="2xl" p={6}>
            <Text
              fontFamily={editorialFonts.mono}
              fontSize="xs"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color={tokens.muted}
            >
              Focus areas
            </Text>
            {focusAreas.map((area) => (
              <Box key={area.title}>
                <Text fontFamily={editorialFonts.body} fontWeight="600" color={tokens.ink}>
                  {area.title}
                </Text>
                <Text fontFamily={editorialFonts.body} color={tokens.muted}>
                  {area.desc}
                </Text>
              </Box>
            ))}
          </Stack>
        </SimpleGrid>
      </Box>
    </Box>
  )
}

/* ------------------------------ Skills ------------------------------ */
const Skills = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)
  const subSize = useBreakpointValue({ base: 'lg', md: 'xl' })

  return (
    <Box as="section" role="region" aria-labelledby="skills-heading" py={{ base: 12, md: 16 }} px={{ base: 6, md: 10 }}>
      <Box maxW="7xl" mx="auto">
        <Heading
          id="skills-heading"
          fontFamily={editorialFonts.heading}
          fontSize={{ base: '3xl', md: '4xl' }}
          color={tokens.ink}
        >
          Tools and Methods
        </Heading>
        <Separator mt={4} borderColor={tokens.rule} />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, md: 14 }} mt={10}>
          <Box>
            <Text
              fontFamily={editorialFonts.mono}
              fontSize="xs"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color={tokens.muted}
              mb={3}
            >
              Data analytics and science
            </Text>
            <Stack gap={3} fontFamily={editorialFonts.body} fontSize="lg" color={tokens.ink}>
              <Text>SQL, Python, Pandas, NumPy</Text>
              <Text>Data modeling, forecasting, anomaly detection</Text>
              <Text>Tableau / Power BI dashboards, KPI reporting</Text>
              <Text>scikit-learn, experimentation and evaluation</Text>
            </Stack>
          </Box>

          <Box>
            <Text
              fontFamily={editorialFonts.mono}
              fontSize="xs"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color={tokens.muted}
              mb={3}
            >
              Sports analytics and applied analysis
            </Text>
            <Stack gap={3} fontFamily={editorialFonts.body} fontSize="lg" color={tokens.ink}>
              <Text>Player and team performance analysis</Text>
              <Text>Match trends, scouting questions, and game context</Text>
              <Text>Visualization for rankings, comparisons, and storylines</Text>
              <Text>Security-aware data handling as a supporting foundation</Text>
            </Stack>
          </Box>
        </SimpleGrid>

        <Text fontFamily={editorialFonts.mono} fontSize={subSize} color={tokens.muted} mt={12}>
          Engineering foundations: Python scripting, API integrations, data QA automation, and reproducible analysis workflows.
        </Text>
      </Box>
    </Box>
  )
}

/* ------------------------------ Main page ------------------------------ */
export default function Home() {
  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta
          name="description"
          content="Portfolio of Preston, a data science and analytics practitioner building dashboards, models, and decision-ready insights with an interest in sports analytics."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta
          property="og:description"
          content="Explore data science, analytics, dashboarding, modeling, and sports analytics projects."
        />
        <meta property="og:url" content={absoluteUrl('/')} />
        <meta property="og:image" content={absoluteUrl('/personalportfolio.png')} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main>
        <Hero />
        <AboutSnapshot />
        <FeaturedProjects />
        <Skills />
      </main>
    </>
  )
}
