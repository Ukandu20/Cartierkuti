import React from 'react'
import { Badge, Box, Button, Flex, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import FormattedParagraphs from '@/components/ui/FormattedParagraphs'
import { splitLines, splitSkillItems } from '../adminDashboardUtils'
import EducationDetails from '@/pages/About/EducationDetails'
import HighlightTags from '@/pages/About/HighlightTags'
import { formatStudyPeriod } from '@/utils/educationDates'
import AboutExtras from '@/pages/About/AboutExtras'
import { visibleProfileMetrics } from '@/utils/profileMetrics'

const previewData = (form) => ({
  highlights: splitLines(form.highlightsText),
  skills: {
    primary: splitSkillItems(form.skillsPrimaryText),
    secondary: splitSkillItems(form.skillsSecondaryText),
    tools: splitSkillItems(form.skillsToolsText),
  },
})

export default function AboutPreview({ form }) {
  const data = previewData(form)
  const metrics = visibleProfileMetrics(form.metrics)
  return (
    <Box bg="bg.canvas" color="fg.default" border="1px solid" borderColor="border.subtle" borderRadius="lg" overflow="hidden">
      <SimpleGrid columns={{ base: 1, lg: form.education.some(item => item.visible !== false) ? 2 : 1 }} gap={10} p={{ base: 5, md: 10 }} alignItems="start">
        <Box>
          <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.16em">About / Preview</Text>
          <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="500" lineHeight="1.15" mt={4}>
            I make analytical work useful, explainable, and ready for decisions.
          </Heading>
          <Text fontSize="xl" fontWeight="700" mt={6}>{form.headline || 'Your headline will appear here.'}</Text>
          <FormattedParagraphs
            value={form.summary}
            fallback="Your About summary will appear here."
            role="group"
            aria-label="About summary preview"
            gap={4}
            mt={2}
            textProps={{ color: 'fg.muted', fontSize: 'lg', lineHeight: '1.75' }}
          />
          <HighlightTags items={data.highlights} label="About highlights" mt={4} />
        </Box>
        {form.education.some(item => item.visible !== false) ? <Box>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Education</Text>
            <Stack mt={3} borderTop="1px solid" borderColor="border.subtle">
              {form.education.filter(item => item.visible !== false).map((item, index) => (
                <Box key={`${item.school}-${index}`} py={5} borderBottom="1px solid" borderColor="border.subtle">
                  <EducationDetails item={item} />
                  <Text color="fg.muted" mt={2}>{formatStudyPeriod(item)}</Text>
                  <HighlightTags items={splitLines(item.bulletsText)} label="Education highlights" mt={3} />
                </Box>
              ))}
            </Stack>
          </Box> : null}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={10} p={{ base: 5, md: 10 }}>
        <Stack gap={8}>
          <Box>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Experience</Text>
            <Stack mt={3} borderTop="1px solid" borderColor="border.subtle">
              {form.experience.map((item, index) => (
                <Box key={`${item.role}-${index}`} py={5} borderBottom="1px solid" borderColor="border.subtle">
                  <Flex justify="space-between" gap={4} wrap="wrap">
                    <Box><Heading fontSize="xl">{item.role || 'Role'}</Heading><Text color="fg.muted">{item.company || 'Company'}{item.location ? ` · ${item.location}` : ''}</Text></Box>
                    <Text fontFamily="mono" fontSize="xs" color="fg.muted">{item.period}</Text>
                  </Flex>
                  <HighlightTags items={splitLines(item.bulletsText)} label="Experience highlights" mt={3} />
                </Box>
              ))}
            </Stack>
          </Box>

        </Stack>

        <Stack gap={8}>
          {form.certifications.length ? (
            <Box>
              <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Credentials</Text>
              <Stack mt={3} gap={4}>
                {form.certifications.map((item, index) => (
                  <Box key={`${item.name}-${index}`}>
                    <Text><strong>{item.name || 'Certification'}</strong> · {item.issuer} {item.year}</Text>
                    {item.credentialId ? <Text fontFamily="mono" fontSize="xs" color="fg.muted" mt={1}>Credential ID: {item.credentialId}</Text> : null}
                    {item.showCredentialLink && item.credentialUrl ? (
                      <Button asChild size="xs" variant="outline" colorPalette="brand" mt={2}>
                        <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer">View credential</a>
                      </Button>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </Box>
          ) : null}
          <Box>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Capabilities</Text>
            <Stack mt={3} gap={4}>
              {Object.entries(data.skills).map(([key, values]) => (
                <Box key={key}>
                  <Text fontSize="sm" color="fg.muted" textTransform="capitalize">{key}</Text>
                  <HStack mt={2} wrap="wrap">{values.map((value) => <Badge key={value} colorPalette="brand" variant="subtle">{value}</Badge>)}</HStack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </SimpleGrid>
      {metrics.length ? (
        <SimpleGrid columns={{ base: 1, md: Math.min(metrics.length, 3) }} bg="bg.surface" borderY="1px solid" borderColor="border.subtle">
          {metrics.map((metric, index) => (
            <Box key={`${metric.label}-${index}`} p={6} borderLeft={{ md: index ? '1px solid' : '0' }} borderColor="border.subtle">
              <Text fontFamily="mono" fontSize="xs" color="fg.muted" textTransform="uppercase">{metric.label || 'Metric'}</Text>
              <Heading fontSize="2xl" mt={1}>{metric.value || 'Value'}</Heading>
              <Text color="fg.muted" mt={1}>{metric.note}</Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : null}

      <AboutExtras personalItems={form.personalItems} gallery={form.gallery} />
    </Box>
  )
}
