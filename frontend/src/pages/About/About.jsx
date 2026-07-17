'use client'

import React, { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Icon,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCheck, FaDownload } from 'react-icons/fa'
import { getPublicResume } from '@/services/resumeService'
import { getResumeDownloadFilename, getResumeDownloadUrl } from '@/hooks/useResumeDownload'
import { PageCta } from '@/components/ui/DesignSystem'
import { absoluteUrl } from '@/utils/siteConfig'

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
    { label: 'Practice', value: 'Data science', note: 'Models and evaluation' },
    { label: 'Domain', value: 'Sports analytics', note: 'Performance and game context' },
    { label: 'Delivery', value: 'Decision-ready', note: 'Dashboards and narratives' },
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
  certifications: [],
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
    number: '01',
    title: 'Data science',
    description: 'Statistical analysis, predictive models, and evaluation grounded in the question at hand.',
  },
  {
    number: '02',
    title: 'Sports analytics',
    description: 'Player, team, and game data translated into performance context and practical decisions.',
  },
  {
    number: '03',
    title: 'Decision intelligence',
    description: 'Reliable data workflows, clear reporting, and evidence stakeholders can confidently use.',
  },
]

const workingPrinciples = [
  {
    number: '01',
    title: 'Frame the question',
    description: 'Start with the decision, define what success means, and identify the evidence that can support it.',
  },
  {
    number: '02',
    title: 'Build and evaluate',
    description: 'Clean the data, choose an honest method, and test whether the result holds beyond a single metric.',
  },
  {
    number: '03',
    title: 'Make it useful',
    description: 'Turn the analysis into a dashboard, narrative, or product that makes the next action clearer.',
  },
]

const skillGroups = [
  { key: 'primary', label: 'Analysis and modelling' },
  { key: 'secondary', label: 'Visualisation and delivery' },
  { key: 'tools', label: 'Engineering and tools' },
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

function SectionLabel({ children, color }) {
  return (
    <Text
      fontFamily={'mono'}
      fontSize="xs"
      fontWeight="600"
      letterSpacing="0.2em"
      textTransform="uppercase"
      color={color}
    >
      {children}
    </Text>
  )
}

const headingWrapProps = {
  whiteSpace: 'normal',
  wordBreak: 'normal',
  overflowWrap: 'break-word',
}

function BulletList({ items }) {
  return (
    <Stack gap={3}>
      {items.map((item, index) => (
        <HStack key={`${item}-${index}`} align="start" gap={3}>
          <Icon as={FaCheck} color={'accent.default'} mt="1.5" boxSize="3" flexShrink="0" aria-hidden="true" />
          <Text fontFamily={'body'} color={'fg.muted'} lineHeight="1.7">
            {item}
          </Text>
        </HStack>
      ))}
    </Stack>
  )
}

export default function About() {
  const [resume, setResume] = useState(DEFAULT_RESUME)
  const [loading, setLoading] = useState(true)
  const resumeUrl = getResumeDownloadUrl(resume)
  const resumeFilename = getResumeDownloadFilename(resume)

  useEffect(() => {
    let active = true

    getPublicResume()
      .then((data) => {
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
    <Box bg={'bg.canvas'} color={'fg.default'} fontFamily={'body'}>
      <Helmet>
        <title>About | Preston Ukandu</title>
        <meta
          name="description"
          content="Meet Preston Ukandu, a data science and sports analytics practitioner who turns complex evidence into useful models, dashboards, and decisions."
        />
        <link rel="canonical" href={absoluteUrl('/about')} />
      </Helmet>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 14, md: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 12, lg: 20 }} alignItems="center">
          <Stack gap={7}>
            <SectionLabel color={'accent.default'}>About / Data science &amp; sports analytics</SectionLabel>
            <Heading
              as="h1"
              fontFamily={'heading'}
              fontSize={{ base: '4xl', sm: '5xl', md: '6xl' }}
              fontWeight="500"
              letterSpacing="-0.035em"
              lineHeight={{ base: '1.2', md: '1.12' }}
              maxW="820px"
              {...headingWrapProps}
            >
              I make analytical work{' '}
              <Box as="span" color={'accent.default'}>useful, explainable,</Box> and ready for decisions.
            </Heading>
            <Stack gap={3} maxW="680px">
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="600" color={'fg.default'}>
                {resume.headline}
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={'fg.muted'} lineHeight="1.8">
                {resume.summary}
              </Text>
            </Stack>
            <ButtonGroup gap={3} flexWrap="wrap">
              <Button asChild size="lg" colorPalette="brand" fontWeight="700">
                <a href={resumeUrl} download={resumeFilename}>
                  <Icon as={FaDownload} aria-hidden="true" />
                  Download résumé
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" colorPalette="brand" fontWeight="700">
                <Link to="/contact">Start a conversation</Link>
              </Button>
            </ButtonGroup>
          </Stack>

          <Box borderTop="1px solid" borderColor={'border.subtle'}>
            {focusAreas.map((area) => (
              <SimpleGrid
                key={area.title}
                columns="auto 1fr"
                gap={{ base: 4, md: 6 }}
                py={{ base: 5, md: 6 }}
                borderBottom="1px solid"
                borderColor={'border.subtle'}
              >
                <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} pt="1">
                  {area.number}
                </Text>
                <Box>
                  <Heading
                    as="h2"
                    fontFamily={'heading'}
                    fontSize="xl"
                    fontWeight="600"
                    lineHeight="1.35"
                    mb={1}
                    {...headingWrapProps}
                  >
                    {area.title}
                  </Heading>
                  <Text color={'fg.muted'} lineHeight="1.65">
                    {area.description}
                  </Text>
                </Box>
              </SimpleGrid>
            ))}
          </Box>
        </SimpleGrid>
      </Box>

      <Box bg={'bg.surface'} borderY="1px solid" borderColor={'border.subtle'}>
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }}>
          {loading ? (
            <HStack minH="144px" justify="center" role="status" aria-label="Loading profile details">
              <Spinner color={'accent.default'} />
            </HStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }}>
              {resume.metrics.map((metric, index) => (
                <Box
                  key={`${metric.label}-${index}`}
                  py={{ base: 6, md: 8 }}
                  px={{ base: 0, md: 6 }}
                  borderBottom={{ base: index < resume.metrics.length - 1 ? '1px solid' : '0', md: '0' }}
                  borderLeft={{ base: '0', md: index ? '1px solid' : '0' }}
                  borderColor={'border.subtle'}
                >
                  <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.15em">
                    {metric.label}
                  </Text>
                  <Text fontFamily={'heading'} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="600" mt={1}>
                    {metric.value}
                  </Text>
                  <Text color={'fg.muted'} mt={1}>{metric.note}</Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
        <Stack gap={{ base: 10, md: 14 }}>
          <Stack gap={4} maxW="720px">
            <SectionLabel color={'accent.default'}>01 / How I work</SectionLabel>
            <Heading
              as="h2"
              fontFamily={'heading'}
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="500"
              letterSpacing="-0.025em"
              lineHeight={{ base: '1.25', md: '1.16' }}
              {...headingWrapProps}
            >
              Rigour matters. So does usefulness.
            </Heading>
            <Text fontSize="lg" color={'fg.muted'} lineHeight="1.75">
              My process connects sound analysis to the people and decisions it is meant to serve.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 8, md: 10 }}>
            {workingPrinciples.map((principle) => (
              <Box key={principle.title} borderTop="2px solid" borderColor={'accent.default'} pt={5}>
                <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'}>{principle.number}</Text>
                <Heading
                  as="h3"
                  fontFamily={'heading'}
                  fontSize="2xl"
                  fontWeight="600"
                  lineHeight="1.3"
                  mt={3}
                  {...headingWrapProps}
                >
                  {principle.title}
                </Heading>
                <Text color={'fg.muted'} lineHeight="1.75" mt={3}>
                  {principle.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      </Box>

      <Box as="section" bg={'bg.raised'} borderY="1px solid" borderColor={'border.subtle'}>
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
          <Stack gap={{ base: 10, md: 14 }}>
            <Stack gap={4} maxW="760px">
              <SectionLabel color={'accent.default'}>02 / Experience</SectionLabel>
              <Heading
                as="h2"
                fontFamily={'heading'}
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight="500"
                letterSpacing="-0.025em"
                lineHeight={{ base: '1.25', md: '1.16' }}
                {...headingWrapProps}
              >
                An engineering foundation, applied through analytics.
              </Heading>
            </Stack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 12, lg: 20 }}>
              <Stack gap={0} borderTop="1px solid" borderColor={'border.subtle'}>
                {resume.experience.map((item, index) => (
                  <Box key={`${item.role}-${index}`} py={{ base: 7, md: 9 }} borderBottom="1px solid" borderColor={'border.subtle'}>
                    <SimpleGrid columns={{ base: 1, sm: '140px 1fr' }} gap={{ base: 3, sm: 6 }}>
                      <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} pt="1">
                        {item.period}
                      </Text>
                      <Stack gap={4}>
                        <Box>
                          <Heading
                            as="h3"
                            fontFamily={'heading'}
                            fontSize="2xl"
                            fontWeight="600"
                            lineHeight="1.3"
                            {...headingWrapProps}
                          >
                            {item.role}
                          </Heading>
                          <Text color={'fg.muted'} mt={1}>
                            {item.company}{item.location ? ` · ${item.location}` : ''}
                          </Text>
                        </Box>
                        <BulletList items={item.bullets || []} />
                      </Stack>
                    </SimpleGrid>
                  </Box>
                ))}
              </Stack>

              <Stack gap={10}>
                <Box>
                  <SectionLabel color={'fg.muted'}>Education</SectionLabel>
                  <Stack mt={4} borderTop="1px solid" borderColor={'border.subtle'}>
                    {resume.education.map((item, index) => (
                      <Box key={`${item.school}-${index}`} py={6} borderBottom="1px solid" borderColor={'border.subtle'}>
                        <HStack justify="space-between" align="start" gap={5}>
                          <Box>
                            <Heading
                              as="h3"
                              fontFamily={'heading'}
                              fontSize="xl"
                              fontWeight="600"
                              lineHeight="1.35"
                              {...headingWrapProps}
                            >
                              {item.degree}
                            </Heading>
                            <Text color={'fg.muted'} mt={1}>{item.school}</Text>
                          </Box>
                          <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textAlign="right" flexShrink="0">
                            {item.period}
                          </Text>
                        </HStack>
                        {item.bullets?.length ? <Box mt={4}><BulletList items={item.bullets} /></Box> : null}
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {resume.certifications.length ? (
                  <Box>
                    <SectionLabel color={'fg.muted'}>Credentials</SectionLabel>
                    <Stack mt={4} borderTop="1px solid" borderColor={'border.subtle'}>
                      {resume.certifications.map((item, index) => (
                        <HStack key={`${item.name}-${index}`} justify="space-between" align="start" gap={5} py={5} borderBottom="1px solid" borderColor={'border.subtle'}>
                          <Box>
                            <Text fontWeight="700">{item.name}</Text>
                            <Text color={'fg.muted'}>{item.issuer}</Text>
                          </Box>
                          <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'}>{item.year}</Text>
                        </HStack>
                      ))}
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            </SimpleGrid>
          </Stack>
        </Box>
      </Box>

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 12, lg: 20 }}>
          <Stack gap={6}>
            <SectionLabel color={'accent.default'}>03 / Capabilities</SectionLabel>
            <Heading
              as="h2"
              fontFamily={'heading'}
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="500"
              letterSpacing="-0.025em"
              lineHeight={{ base: '1.25', md: '1.16' }}
              {...headingWrapProps}
            >
              From raw data to a clear next move.
            </Heading>
            <Text fontSize="lg" color={'fg.muted'} lineHeight="1.75">
              I combine analytical methods, visual communication, and software delivery so insights do not stop at a notebook.
            </Text>
            <Separator borderColor={'border.subtle'} />
            <BulletList items={resume.highlights} />
          </Stack>

          <Stack gap={0} borderTop="1px solid" borderColor={'border.subtle'}>
            {skillGroups.map((group) => (
              <Box key={group.key} py={{ base: 6, md: 8 }} borderBottom="1px solid" borderColor={'border.subtle'}>
                <Text fontFamily={'mono'} fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={'fg.muted'} mb={4}>
                  {group.label}
                </Text>
                <HStack flexWrap="wrap" gap={2}>
                  {resume.skills[group.key].map((skill) => (
                    <Badge
                      key={skill}
                      bg={'accent.subtle'}
                      color={'fg.default'}
                      borderRadius="full"
                      px={3}
                      py={1.5}
                      fontFamily={'body'}
                      fontSize="sm"
                      fontWeight="600"
                    >
                      {skill}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            ))}
          </Stack>
        </SimpleGrid>
      </Box>

      <PageCta
        headingId="about-collaboration-heading"
        eyebrow="Let's work together"
        title="Have a data problem or a sports analytics idea?"
        description="I am interested in thoughtful projects where evidence can make a real decision clearer."
      >
        <Link to="/contact">Start a conversation <FaArrowRight /></Link>
      </PageCta>
    </Box>
  )
}
