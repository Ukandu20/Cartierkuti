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
  Icon,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { FaDownload } from 'react-icons/fa'
import apiClient from '@/utils/axiosConfig'
import { useColorMode } from '@/components/Theme/color-mode'
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
  accentSecurity: '#7C2D12',
})

const DEFAULT_RESUME = {
  headline: 'Data analyst and security-minded developer',
  summary:
    'I build analytics systems that reveal risk, improve decisions, and secure data workflows.',
  highlights: [
    'Dashboarding, KPI reporting, and stakeholder storytelling.',
    'Threat-aware analytics and operational telemetry.',
    'Predictive modeling and anomaly detection.',
  ],
  metrics: [
    { label: 'Years', value: '3+', note: 'Professional practice' },
    { label: 'Projects', value: '20+', note: 'Data and software' },
    { label: 'Focus', value: 'Analytics', note: 'Security-aware' },
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
    secondary: ['Tableau', 'Power BI', 'Node.js', 'Express'],
    tools: ['Git', 'Docker', 'Linux', 'MongoDB'],
  },
}

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
          content="Resume and background of Preston Ukandu, a data analyst and security-minded developer."
        />
        <link rel="canonical" href={absoluteUrl('/about')} />
      </Helmet>

      <Box as="section" maxW="7xl" mx="auto" pt={{ base: 10, md: 16 }} px={{ base: 6, md: 10 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 10, lg: 16 }} alignItems="start">
          <Stack spacing={6}>
            <Text
              fontFamily={editorialFonts.mono}
              fontSize="xs"
              letterSpacing="0.3em"
              textTransform="uppercase"
              color={tokens.muted}
            >
              About
            </Text>
            <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '4xl' }}>
              About Me
            </Heading>
            <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>
              {resume.headline}
            </Text>
            <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted}>
              {resume.summary}
            </Text>

            <HStack spacing={4} flexWrap="wrap">
              <Button
                asChild
                size="lg"
                colorPalette="teal"
                fontFamily={editorialFonts.body}
              >
                <a href="/resume.pdf" download>
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
            </HStack>
          </Stack>

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
            <Stack spacing={3}>
              {resume.highlights.map((item, idx) => (
                <Text key={`${item}-${idx}`} fontFamily={editorialFonts.body} color={tokens.muted}>
                  {item}
                </Text>
              ))}
            </Stack>
          </Box>
        </SimpleGrid>
      </Box>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 12 }}>
          <Stack spacing={6}>
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
                  {item.company}{item.location ? ` · ${item.location}` : ''}
                </Text>
                <Text fontSize="sm" color={tokens.muted}>
                  {item.period}
                </Text>
                <Stack spacing={2} mt={3}>
                  {(item.bullets || []).map((bullet, bulletIdx) => (
                    <Text key={`${item.role}-bullet-${bulletIdx}`} color={tokens.muted}>
                      {bullet}
                    </Text>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Stack spacing={6}>
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
                <Stack spacing={2} mt={3}>
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
        <Stack spacing={8}>
          <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '2xl', md: '3xl' }}>
            Skills and Tools
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            <Box bg={tokens.surface} borderRadius="xl" border="1px solid" borderColor={tokens.rule} p={5}>
              <Text fontWeight="bold" mb={3}>Primary</Text>
              <HStack flexWrap="wrap" spacing={2}>
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
              <HStack flexWrap="wrap" spacing={2}>
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
              <HStack flexWrap="wrap" spacing={2}>
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
          <Stack spacing={6}>
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

      <Box as="section" px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }} bg={tokens.surface}>
        <Box maxW="5xl" mx="auto" textAlign="center">
          <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '2xl', md: '3xl' }}>
            Interested in Working Together?
          </Heading>
          <Text fontFamily={editorialFonts.body} fontSize="lg" color={tokens.muted} mt={4}>
            I am open to analytics, security-minded data work, and collaborative research projects.
          </Text>
          <Button
            asChild
            size="lg"
            mt={6}
            colorPalette="red"
            fontFamily={editorialFonts.body}
          >
            <Link to="/contact">Say Hello</Link>
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
