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
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { getPublicResume } from '@/services/resumeService'
import EducationDetails from './EducationDetails'
import HighlightTags from './HighlightTags'
import { formatStudyPeriod } from '@/utils/educationDates'
import AboutExtras from './AboutExtras'
import { getResumeDownloadFilename, getResumeDownloadUrl } from '@/hooks/useResumeDownload'
import FormattedParagraphs from '@/components/ui/FormattedParagraphs'
import { absoluteUrl } from '@/utils/siteConfig'
import { normalizeAboutContent } from '@/utils/aboutContent'
import { visibleProfileMetrics } from '@/utils/profileMetrics'

const DEFAULT_RESUME = {
  headline: '', summary: '', highlights: [], metrics: [], experience: [], education: [], certifications: [],
  personalItems: [], gallery: [], skills: { primary: [], secondary: [], tools: [] },
  resumeFileUrl: '', resumeFileName: '', resumeFileUpdatedAt: '', pageContent: normalizeAboutContent(),
}

const normalizeSkillItems = (value) => {
  const entries = Array.isArray(value) ? value : []
  const seen = new Set()

  return entries
    .flatMap((entry) => String(entry || '').split(/(?:\r?\n|\\n|,)/))
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false
      const normalized = item.toLowerCase()
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
}

export const normalizeResume = (data) => {
  const safeArray = (value) => (Array.isArray(value) ? value : [])
  const primarySkills = normalizeSkillItems(data?.skills?.primary)
  const secondarySkills = normalizeSkillItems(data?.skills?.secondary)
  const tools = normalizeSkillItems(data?.skills?.tools)

  return {
    pageContent: normalizeAboutContent(data?.pageContent),
    headline: data?.headline || '',
    summary: data?.summary || DEFAULT_RESUME.summary,
    highlights: safeArray(data?.highlights).length
      ? safeArray(data?.highlights)
      : DEFAULT_RESUME.highlights,
    metrics: visibleProfileMetrics(Array.isArray(data?.metrics) ? data.metrics : DEFAULT_RESUME.metrics),
    experience: safeArray(data?.experience),
    education: Array.isArray(data?.education)
      ? data.education.filter(item => item.visible !== false)
      : DEFAULT_RESUME.education,
    personalItems: safeArray(data?.personalItems).filter(item => item.visible !== false),
    gallery: safeArray(data?.gallery).filter(item => item.visible !== false),
    certifications: safeArray(data?.certifications),
    resumeFileUrl: data?.resumeFileUrl || DEFAULT_RESUME.resumeFileUrl,
    resumeFileName: data?.resumeFileName || DEFAULT_RESUME.resumeFileName,
    resumeFileUpdatedAt: data?.resumeFileUpdatedAt || DEFAULT_RESUME.resumeFileUpdatedAt,
    skills: {
      primary: primarySkills.length
        ? primarySkills
        : DEFAULT_RESUME.skills.primary,
      secondary: secondarySkills.length
        ? secondarySkills
        : DEFAULT_RESUME.skills.secondary,
      tools: tools.length
        ? tools
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

export default function About() {
  const [resume, setResume] = useState(DEFAULT_RESUME)
  const [loading, setLoading] = useState(true)

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

  return <AboutContent resume={resume} loading={loading} />
}

export function AboutContent({ resume, loading = false, preview = false }) {
  const content = normalizeAboutContent(resume.pageContent)
  const resumeUrl = getResumeDownloadUrl(resume)
  const resumeFilename = getResumeDownloadFilename(resume)
  const skillGroups = [
    { key: 'primary', label: content.primarySkillsLabel },
    { key: 'secondary', label: content.secondarySkillsLabel },
    { key: 'tools', label: content.toolsSkillsLabel },
  ].filter(group => resume.skills[group.key].length)
  return (
    <Box bg={'bg.canvas'} color={'fg.default'} fontFamily={'body'}>
      {!preview ? <Helmet>
        <title>{content.pageTitle}</title>
        <meta
          name="description"
          content={content.metaDescription}
        />
        <link rel="canonical" href={absoluteUrl('/about')} />
      </Helmet> : null}

      <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 14, md: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: resume.education.length ? 2 : 1 }} gap={{ base: 12, lg: 20 }} alignItems="start">
          <Stack gap={7}>
            <SectionLabel color={'accent.default'}>{content.introductionLabel}</SectionLabel>
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
              {content.heroTitle}
            </Heading>
            <Stack gap={3} maxW="680px">
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="600" color={'fg.default'}>
                {resume.headline}
              </Text>
              <FormattedParagraphs
                value={resume.summary}
                role="group"
                aria-label={preview ? 'About summary preview' : 'About summary'}
                gap={4}
                textProps={{ fontSize: { base: 'md', md: 'lg' }, color: 'fg.muted', lineHeight: '1.8' }}
              />
            </Stack>
            <HighlightTags items={resume.highlights} label="About highlights" />
            <ButtonGroup gap={3} flexWrap="wrap">
              <Button asChild size="lg" colorPalette="brand" fontWeight="700">
                <a href={resumeUrl} download={resumeFilename}>
                  <Icon as={FaDownload} aria-hidden="true" />
                  {content.resumeButtonLabel}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" colorPalette="brand" fontWeight="700">
                <Link to="/contact">{content.contactButtonLabel}</Link>
              </Button>
            </ButtonGroup>
          </Stack>

          {resume.education.length ? <Box>
            <SectionLabel color={'fg.muted'}>{content.educationLabel}</SectionLabel>
            <Stack mt={4} borderTop="1px solid" borderColor={'border.subtle'}>
              {resume.education.map((item, index) => (
                <Box key={`${item.school}-${index}`} py={6} borderBottom="1px solid" borderColor={'border.subtle'}>
                  <Stack gap={3}>
                    <Box>
                      <EducationDetails item={item} />
                    </Box>
                    <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textAlign="left">
                      {formatStudyPeriod(item)}
                    </Text>
                  </Stack>
                  {item.bullets?.length ? <Box mt={4}><HighlightTags items={item.bullets} label="Education highlights" /></Box> : null}
                </Box>
              ))}
            </Stack>
          </Box> : null}
        </SimpleGrid>
      </Box>

      {resume.experience.length || resume.certifications.length ? <Box as="section" bg={'bg.raised'} borderY="1px solid" borderColor={'border.subtle'}>
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
          <Stack gap={{ base: 10, md: 14 }}>
            <Stack gap={4} maxW="760px">
              <SectionLabel color={'accent.default'}>{content.experienceLabel}</SectionLabel>
              <Heading
                as="h2"
                fontFamily={'heading'}
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight="500"
                letterSpacing="-0.025em"
                lineHeight={{ base: '1.25', md: '1.16' }}
                {...headingWrapProps}
              >
                {content.experienceTitle}
              </Heading>
            </Stack>

            <SimpleGrid columns={{ base: 1, lg: resume.certifications.length ? 2 : 1 }} gap={{ base: 12, lg: 20 }}>
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
                        <HighlightTags items={item.bullets || []} label="Experience highlights" />
                      </Stack>
                    </SimpleGrid>
                  </Box>
                ))}
              </Stack>

              <Stack gap={10}>
                {resume.certifications.length ? (
                  <Box>
                    <SectionLabel color={'fg.muted'}>{content.credentialsLabel}</SectionLabel>
                    <Stack mt={4} borderTop="1px solid" borderColor={'border.subtle'}>
                      {resume.certifications.map((item, index) => (
                        <HStack key={`${item.name}-${index}`} justify="space-between" align="start" gap={5} py={5} borderBottom="1px solid" borderColor={'border.subtle'}>
                          <Box>
                             <Text fontWeight="700">{item.name}</Text>
                             <Text color={'fg.muted'}>{item.issuer}</Text>
                             {item.credentialId ? (
                               <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} mt={2}>
                                 Credential ID: {item.credentialId}
                               </Text>
                             ) : null}
                             {item.showCredentialLink && item.credentialUrl ? (
                               <Button asChild size="sm" variant="outline" colorPalette="brand" mt={3}>
                                 <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer">
                                   {content.credentialButtonLabel} <Icon as={FaExternalLinkAlt} aria-hidden="true" />
                                 </a>
                               </Button>
                             ) : null}
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
      </Box> : null}

      {loading || resume.metrics.length ? <Box bg={'bg.surface'} borderY="1px solid" borderColor={'border.subtle'}>
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }}>
          {loading ? (
            <HStack minH="144px" justify="center" role="status" aria-label="Loading profile details">
              <Spinner color={'accent.default'} />
            </HStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: Math.min(resume.metrics.length, 3) }}>
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
      </Box> : null}

      {content.principles.length ? <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
        <Stack gap={{ base: 10, md: 14 }}>
          <Stack gap={4} maxW="720px">
            <SectionLabel color={'accent.default'}>{content.processLabel}</SectionLabel>
            <Heading
              as="h2"
              fontFamily={'heading'}
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="500"
              letterSpacing="-0.025em"
              lineHeight={{ base: '1.25', md: '1.16' }}
              {...headingWrapProps}
            >
              {content.processTitle}
            </Heading>
            <Text fontSize="lg" color={'fg.muted'} lineHeight="1.75">
              {content.processDescription}
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 8, md: 10 }}>
            {content.principles.map((principle, index) => (
              <Box key={`${principle.title}-${index}`} borderTop="2px solid" borderColor={'accent.default'} pt={5}>
                <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'}>{String(index + 1).padStart(2, '0')}</Text>
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
      </Box> : null}

      {skillGroups.length ? <Box as="section" maxW="7xl" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 12, lg: 20 }}>
          <Stack gap={6}>
            <SectionLabel color={'accent.default'}>{content.capabilitiesLabel}</SectionLabel>
            <Heading
              as="h2"
              fontFamily={'heading'}
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="500"
              letterSpacing="-0.025em"
              lineHeight={{ base: '1.25', md: '1.16' }}
              {...headingWrapProps}
            >
              {content.capabilitiesTitle}
            </Heading>
            <Text fontSize="lg" color={'fg.muted'} lineHeight="1.75">
              {content.capabilitiesDescription}
            </Text>
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
      </Box> : null}

      <AboutExtras personalItems={resume.personalItems} gallery={resume.gallery} content={content} />
    </Box>
  )
}
