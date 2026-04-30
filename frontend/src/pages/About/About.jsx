'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  HStack,
  Badge,
  Separator,
  Spinner,
  Button,
  ButtonGroup,
  Icon,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { FaDownload } from 'react-icons/fa'
import apiClient from '@/utils/axiosConfig'
import { useColorMode } from '@/components/Theme/color-mode'
import { getResumeDownloadUrl } from '@/hooks/useResumeDownload'
import { absoluteUrl } from '@/utils/siteConfig'

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

const DEFAULT_RESUME = {
  headline: 'Data science and analytics practitioner',
  summary:
    'I turn messy data into clear stories, useful models, and decision-ready dashboards.',
  highlights: [
    'Dashboarding, KPI reporting, and stakeholder data storytelling.',
    'Predictive modeling, experimentation, and practical model evaluation.',
    'Sports performance analytics and applied decision intelligence.',
  ],
  metrics: [
    { label: 'Years', value: '3+', note: 'Professional practice' },
    { label: 'Projects', value: '20+', note: 'Analytics and software' },
    { label: 'Focus', value: 'Analytics', note: 'Models and sports' },
  ],
  experience: [
    {
      role: 'Full-Stack Developer',
      company: 'Freelance',
      location: 'Remote',
      period: '2022 - Present',
      bullets: [
        'Shipped analytics dashboards and data pipelines for clients.',
        'Automated reporting workflows and data QA checks.',
      ],
    },
  ],
  education: [
    {
      school: 'University of Windsor',
      degree: 'B.Sc. Computer Science',
      period: '2019 - 2023',
      bullets: ['Data structures, algorithms, and software engineering.'],
    },
  ],
  certifications: [
    { name: 'Data Science Specialisation', issuer: 'Coursera / edX', year: '2023' },
  ],
  skills: {
    primary: ['Python', 'SQL', 'Pandas', 'React'],
    secondary: ['Tableau', 'Power BI', 'scikit-learn', 'Node.js'],
    tools: ['Git', 'Docker', 'Linux', 'MongoDB'],
  },
  resumeFileUrl: '',
  resumeFileName: '',
  resumeFileUpdatedAt: '',
}

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

const normalizeResume = (data) => {
  const safeArray = (value) => (Array.isArray(value) ? value : [])
  return {
    headline: data?.headline || DEFAULT_RESUME.headline,
    summary: data?.summary || DEFAULT_RESUME.summary,
    highlights: safeArray(data?.highlights).length
      ? safeArray(data?.highlights)
      : DEFAULT_RESUME.highlights,
    metrics: safeArray(data?.metrics).length ? safeArray(data?.metrics) : DEFAULT_RESUME.metrics,
    experience: safeArray(data?.experience).length
      ? safeArray(data?.experience)
      : DEFAULT_RESUME.experience,
    education: safeArray(data?.education).length
      ? safeArray(data?.education)
      : DEFAULT_RESUME.education,
    certifications: safeArray(data?.certifications),
    resumeFileUrl: data?.resumeFileUrl || DEFAULT_RESUME.resumeFileUrl,
    resumeFileName: data?.resumeFileName || DEFAULT_RESUME.resumeFileName,
    resumeFileUpdatedAt: data?.resumeFileUpdatedAt || DEFAULT_RESUME.resumeFileUpdatedAt,
    skills: {
      primary: safeArray(data?.skills?.primary).length
        ? safeArray(data?.skills?.primary)
        : DEFAULT_RESUME.skills.primary,
      secondary: safeArray(data?.skills?.secondary).length
        ? safeArray(data?.skills?.secondary)
        : DEFAULT_RESUME.skills.secondary,
      tools: safeArray(data?.skills?.tools).length
        ? safeArray(data?.skills?.tools)
        : DEFAULT_RESUME.skills.tools,
    },
  }
}

export default function About() {
  const { colorMode } = useColorMode()
  const tokens = getEditorialTokens(colorMode)
  const [resume, setResume] = useState(DEFAULT_RESUME)
  const [loading, setLoading] = useState(true)
  const resumeUrl = getResumeDownloadUrl(resume)

  useEffect(() => {
    let active = true
    apiClient
      .get('/api/resume')
      .then(({ data }) => {
        if (active) setResume(normalizeResume(data))
      })
      .catch(() => {
        if (active) setResume(DEFAULT_RESUME)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <Box bg={tokens.bg} color={tokens.ink}>
      <Helmet>
        <title>About Me | Preston Ukandu</title>
        <meta
          name="description"
          content="Resume and background of Preston Ukandu, a data science and analytics practitioner focused on dashboards, models, and sports analytics."
        />
        <link rel="canonical" href={absoluteUrl('/about')} />
      </Helmet>

      <Box as="section" maxW="5xl" mx="auto" pt={{ base: 12, md: 18 }} px={{ base: 6, md: 10 }}>
        <Stack gap={6} align="center" textAlign="center">
          <Text
            fontFamily={editorialFonts.mono}
            fontSize="xs"
            letterSpacing="0.3em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            About
          </Text>
          <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '4xl', md: '5xl' }}>
            <Box as="span" color={tokens.accentData}>Preston Ukandu</Box>
          </Heading>
          <Text fontFamily={editorialFonts.body} fontSize={{ base: 'lg', md: 'xl' }} color={tokens.muted} maxW="760px">
            {resume.headline}
          </Text>
          <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted} maxW="760px">
            {resume.summary}
          </Text>

          <ButtonGroup gap={4} flexWrap="wrap" justifyContent="center">
            <Button
              asChild
              size="lg"
              colorPalette="teal"
              fontFamily={editorialFonts.body}
            >
              <a href={resumeUrl} download>
                <Icon as={FaDownload} aria-hidden="true" />
                Download Resume
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              colorPalette="teal"
              fontFamily={editorialFonts.body}
            >
              <Link to="/contact">Contact Me</Link>
            </Button>
          </ButtonGroup>
        </Stack>
      </Box>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 10, lg: 16 }} alignItems="start">
          <Stack gap={5}>
            <Text
              fontFamily={editorialFonts.mono}
              fontSize="xs"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color={tokens.muted}
            >
              Profile snapshot
            </Text>
            <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '4xl' }}>
              Analytics-first, model-minded.
            </Heading>
            <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>
              I focus on <Box as="span" fontWeight="600" color={tokens.ink}>analytics</Box>, statistical
              interpretation, and practical model evaluation. My work connects clean data workflows,
              useful dashboards, and applied analysis for business, product, and sports decisions.
            </Text>
          </Stack>

          <Stack
            gap={5}
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
              letterSpacing="0.25em"
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

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} pb={{ base: 12, md: 16 }}>
        <Box
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
            letterSpacing="0.25em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            Resume Snapshot
          </Text>
          <Heading fontFamily={editorialFonts.heading} fontSize="2xl" mt={2}>
            What I Deliver
          </Heading>
          <Separator my={4} borderColor={tokens.rule} />
            {loading ? (
              <Spinner size="lg" />
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 3 }} gap={5}>
                {resume.metrics.map((metric, idx) => (
                  <Box
                    key={`${metric.label}-${idx}`}
                    bg={tokens.surfaceAlt}
                    borderRadius="lg"
                    p={4}
                    border="1px solid"
                    borderColor={tokens.rule}
                  >
                    <Text fontFamily={editorialFonts.mono} fontSize="xs" color={tokens.muted}>
                      {metric.label}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {metric.value}
                    </Text>
                    <Text fontSize="sm" color={tokens.muted}>
                      {metric.note}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}
            <Separator my={5} borderColor={tokens.rule} />
            <Stack gap={3}>
              {resume.highlights.map((item, idx) => (
                <Text key={`${item}-${idx}`} fontFamily={editorialFonts.body} color={tokens.muted}>
                  {item}
                </Text>
              ))}
            </Stack>
        </Box>
      </Box>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} pb={{ base: 12, md: 16 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 12 }}>
          <Stack gap={6}>
            <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '2xl', md: '3xl' }}>
              Experience
            </Heading>
            {resume.experience.map((item, idx) => (
              <Box
                key={`${item.role}-${idx}`}
                bg={tokens.surface}
                borderRadius="xl"
                border="1px solid"
                borderColor={tokens.rule}
                p={5}
              >
                <Text fontWeight="bold" fontSize="lg">
                  {item.role}
                </Text>
                <Text fontFamily={editorialFonts.body} color={tokens.muted}>
                  {item.company}{item.location ? ` - ${item.location}` : ''}
                </Text>
                <Text fontSize="sm" color={tokens.muted}>
                  {item.period}
                </Text>
                <Stack gap={2} mt={3}>
                  {(item.bullets || []).map((bullet, bulletIdx) => (
                    <Text key={`${item.role}-bullet-${bulletIdx}`} color={tokens.muted}>
                      {bullet}
                    </Text>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Stack gap={6}>
            <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '2xl', md: '3xl' }}>
              Education
            </Heading>
            {resume.education.map((item, idx) => (
              <Box
                key={`${item.school}-${idx}`}
                bg={tokens.surface}
                borderRadius="xl"
                border="1px solid"
                borderColor={tokens.rule}
                p={5}
              >
                <Text fontWeight="bold" fontSize="lg">
                  {item.school}
                </Text>
                <Text fontFamily={editorialFonts.body} color={tokens.muted}>
                  {item.degree}
                </Text>
                <Text fontSize="sm" color={tokens.muted}>
                  {item.period}
                </Text>
                <Stack gap={2} mt={3}>
                  {(item.bullets || []).map((bullet, bulletIdx) => (
                    <Text key={`${item.school}-bullet-${bulletIdx}`} color={tokens.muted}>
                      {bullet}
                    </Text>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </SimpleGrid>
      </Box>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} pb={{ base: 12, md: 16 }}>
        <Stack gap={8}>
          <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '2xl', md: '3xl' }}>
            Skills and Tools
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            <Box bg={tokens.surface} borderRadius="xl" border="1px solid" borderColor={tokens.rule} p={5}>
              <Text fontWeight="bold" mb={3}>Primary</Text>
              <HStack flexWrap="wrap" gap={2}>
                {resume.skills.primary.map((skill) => (
                  <Badge
                    key={skill}
                    bg={tokens.surfaceAlt}
                    color={tokens.ink}
                    border="1px solid"
                    borderColor={tokens.rule}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {skill}
                  </Badge>
                ))}
              </HStack>
            </Box>
            <Box bg={tokens.surface} borderRadius="xl" border="1px solid" borderColor={tokens.rule} p={5}>
              <Text fontWeight="bold" mb={3}>Secondary</Text>
              <HStack flexWrap="wrap" gap={2}>
                {resume.skills.secondary.map((skill) => (
                  <Badge
                    key={skill}
                    bg={tokens.surfaceAlt}
                    color={tokens.ink}
                    border="1px solid"
                    borderColor={tokens.rule}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {skill}
                  </Badge>
                ))}
              </HStack>
            </Box>
            <Box bg={tokens.surface} borderRadius="xl" border="1px solid" borderColor={tokens.rule} p={5}>
              <Text fontWeight="bold" mb={3}>Tools</Text>
              <HStack flexWrap="wrap" gap={2}>
                {resume.skills.tools.map((skill) => (
                  <Badge
                    key={skill}
                    bg={tokens.surfaceAlt}
                    color={tokens.ink}
                    border="1px solid"
                    borderColor={tokens.rule}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {skill}
                  </Badge>
                ))}
              </HStack>
            </Box>
          </SimpleGrid>
        </Stack>
      </Box>

      {resume.certifications.length ? (
        <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} pb={{ base: 12, md: 16 }}>
          <Stack gap={6}>
            <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '2xl', md: '3xl' }}>
              Certifications
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
              {resume.certifications.map((item, idx) => (
                <Box
                  key={`${item.name}-${idx}`}
                  bg={tokens.surface}
                  border="1px solid"
                  borderColor={tokens.rule}
                  borderRadius="xl"
                  p={5}
                >
                  <Text fontWeight="bold">{item.name}</Text>
                  <Text color={tokens.muted}>{item.issuer}</Text>
                  <Text fontSize="sm" color={tokens.muted}>{item.year}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}
