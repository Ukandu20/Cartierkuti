// src/pages/Home/Home.jsx
'use client'

import React, { Suspense } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
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
  accentSecurity: '#7C2D12',
})

/* ------------------------------ Hero ------------------------------ */
const Hero = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)
  const sparkline = [12, 26, 18, 34, 22, 40, 28]

  return (
    <Box as="section" role="region" aria-labelledby="hero-heading" bg={tokens.bg}>
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        justify="space-between"
        gap={{ base: 10, lg: 16 }}
        minH={{ base: 'auto', md: 'calc(85vh - 90px)' }}
        px={{ base: 6, md: 10 }}
        py={{ base: 14, md: 20 }}
        maxW="7xl"
        mx="auto"
      >
        <Stack spacing={6} flex="1" align={{ base: 'center', lg: 'flex-start' }}>
          <Text
            fontFamily={editorialFonts.mono}
            fontSize="xs"
            letterSpacing="0.24em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            Data analytics / security insights / scientific rigor
          </Text>

          <Heading
            id="hero-heading"
            fontFamily={editorialFonts.heading}
            fontSize={{ base: '4xl', md: '6xl' }}
            fontWeight="600"
            color={tokens.ink}
            lineHeight="1.05"
            textAlign={{ base: 'center', lg: 'left' }}
          >
            Data Analyst &amp; <Box as="span" color={tokens.accentData}>Cybersecurity-minded</Box>
            <br />
            Scientist.
          </Heading>

          <Text
            fontFamily={editorialFonts.body}
            fontSize={{ base: 'lg', md: 'xl' }}
            color={tokens.muted}
            maxW="560px"
            textAlign={{ base: 'center', lg: 'left' }}
          >
            I build analytics systems that reveal risk, improve decisions, and secure data workflows.
            My work blends BI, statistical modeling, and security-aware analysis.
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6} w="full" pt={2}>
            {[
              'Dashboards and KPI reporting',
              'Predictive modeling and anomaly detection',
              'Risk analytics and security telemetry',
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

          <HStack spacing={4} pt={4} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
            <Button
              as={Link}
              to="/portfolio"
              size="lg"
              bg={tokens.accentData}
              color="white"
              fontFamily={editorialFonts.body}
              rightIcon={<Icon as={FaArrowRight} aria-hidden="true" />}
              _hover={{ bg: '#0B5D56' }}
            >
              View Projects
            </Button>
            <Button
              as="a"
              href="/resume.pdf"
              download
              size="lg"
              variant="outline"
              borderColor={tokens.ink}
              color={tokens.ink}
              fontFamily={editorialFonts.body}
              leftIcon={<Icon as={FaDownload} aria-hidden="true" />}
              _hover={{ bg: tokens.surfaceAlt }}
            >
              Download Resume
            </Button>
          </HStack>
        </Stack>

        <Stack
          spacing={6}
          flex="1"
          maxW="420px"
          w="full"
          bg={tokens.surface}
          border="1px solid"
          borderColor={tokens.rule}
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          boxShadow="md"
        >
          <Text
            fontFamily={editorialFonts.mono}
            fontSize="xs"
            letterSpacing="0.24em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            Signal overview
          </Text>
          <Heading fontFamily={editorialFonts.heading} fontSize="2xl" color={tokens.ink}>
            Risk Drift Index
          </Heading>
          <Text fontFamily={editorialFonts.body} color={tokens.muted}>
            Monitoring anomaly patterns across operational data streams and security events.
          </Text>
          <HStack spacing="6px" align="flex-end" h="48px">
            {sparkline.map((height, idx) => (
              <Box
                key={`${height}-${idx}`}
                w="10px"
                h={`${height}px`}
                bg={idx === sparkline.length - 1 ? tokens.accentSecurity : tokens.rule}
                borderRadius="full"
              />
            ))}
          </HStack>
          <Text fontFamily={editorialFonts.mono} fontSize="xs" color={tokens.muted}>
            Status: stable | last updated today
          </Text>
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
      bg={tokens.surfaceAlt}
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
          Projects centered on analytics, automation, and security-aware data pipelines.
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
    title: 'Risk and Threat Analytics',
    desc: 'Turn logs, alerts, and operational data into actionable security signals.',
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
    <Box as="section" px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }} bg={tokens.surface}>
      <Box maxW="7xl" mx="auto">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }}>
          <Stack spacing={4}>
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
              Analytics-first, security-aware.
            </Heading>
            <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>
              I focus on <Box as="span" fontWeight="600" color={tokens.ink}>analytics</Box>, threat-aware
              data interpretation, and statistical rigor. My goal is to deliver
              insights that are trusted, reproducible, and aligned with risk management.
            </Text>
          </Stack>

          <Stack spacing={5} bg={tokens.surfaceAlt} border="1px solid" borderColor={tokens.rule} borderRadius="2xl" p={6}>
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
    <Box as="section" role="region" aria-labelledby="skills-heading" py={{ base: 12, md: 16 }} px={{ base: 6, md: 10 }} bg={tokens.bg}>
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

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 14 }} mt={10}>
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
            <Stack spacing={3} fontFamily={editorialFonts.body} fontSize="lg" color={tokens.ink}>
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
              Cybersecurity analytics
            </Text>
            <Stack spacing={3} fontFamily={editorialFonts.body} fontSize="lg" color={tokens.ink}>
              <Text>Security log analysis and alert triage</Text>
              <Text>Threat modeling fundamentals</Text>
              <Text>SIEM concepts, incident support workflows</Text>
              <Text>Network and identity telemetry interpretation</Text>
            </Stack>
          </Box>
        </SimpleGrid>

        <Text fontFamily={editorialFonts.mono} fontSize={subSize} color={tokens.muted} mt={12}>
          Engineering foundations: Python scripting, API integrations, data QA automation.
        </Text>
      </Box>
    </Box>
  )
}

/* ------------------------------ CTA ------------------------------ */
const ContactCTA = () => {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)

  return (
    <Box as="section" py={{ base: 12, md: 16 }} px={{ base: 6, md: 10 }} bg={tokens.surface}>
      <Box maxW="7xl" mx="auto">
        <Separator borderColor={tokens.rule} mb={10} />
        <Stack spacing={4} align={{ base: 'center', md: 'flex-start' }}>
          <Text
            fontFamily={editorialFonts.mono}
            fontSize="xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            Collaboration
          </Text>
          <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '4xl' }} color={tokens.ink}>
            Let's solve data or security problems.
          </Heading>
          <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted} maxW="620px">
            Open to analyst and security-focused roles, consulting, and project collaborations.
          </Text>
          <Button
            as={Link}
            to="/contact"
            size="lg"
            bg={tokens.accentSecurity}
            color="white"
            fontFamily={editorialFonts.body}
            rightIcon={<Icon as={FaArrowRight} aria-hidden="true" />}
            _hover={{ bg: '#5C2310' }}
          >
            Say Hello
          </Button>
        </Stack>
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
          content="Portfolio of Preston, a data analyst and cybersecurity-minded scientist delivering analytics, risk insights, and decision intelligence."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta
          property="og:description"
          content="Explore analytics projects, security-minded insights, and data science capabilities."
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
        <ContactCTA />
      </main>
    </>
  )
}
