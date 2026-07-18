import React from 'react'
import { Badge, Box, Flex, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import FormattedParagraphs from '@/components/ui/FormattedParagraphs'
import { splitLines } from '../adminDashboardUtils'

const previewData = (form) => ({
  highlights: splitLines(form.highlightsText),
  skills: {
    primary: splitLines(form.skillsPrimaryText),
    secondary: splitLines(form.skillsSecondaryText),
    tools: splitLines(form.skillsToolsText),
  },
})

export default function AboutPreview({ form }) {
  const data = previewData(form)
  return (
    <Box bg="bg.canvas" color="fg.default" border="1px solid" borderColor="border.subtle" borderRadius="lg" overflow="hidden">
      <Box p={{ base: 5, md: 10 }}>
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
      </Box>

      {form.metrics.length ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} bg="bg.surface" borderY="1px solid" borderColor="border.subtle">
          {form.metrics.map((metric, index) => (
            <Box key={`${metric.label}-${index}`} p={6} borderLeft={{ md: index ? '1px solid' : '0' }} borderColor="border.subtle">
              <Text fontFamily="mono" fontSize="xs" color="fg.muted" textTransform="uppercase">{metric.label || 'Metric'}</Text>
              <Heading fontSize="2xl" mt={1}>{metric.value || 'Value'}</Heading>
              <Text color="fg.muted" mt={1}>{metric.note}</Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : null}

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
                  {splitLines(item.bulletsText).map((bullet) => <Text key={bullet} color="fg.muted" mt={2}>• {bullet}</Text>)}
                </Box>
              ))}
            </Stack>
          </Box>
          <Box>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Highlights</Text>
            <Stack mt={3} gap={2}>{data.highlights.map((item) => <Text key={item} color="fg.muted">• {item}</Text>)}</Stack>
          </Box>
        </Stack>

        <Stack gap={8}>
          <Box>
            <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Education</Text>
            <Stack mt={3} borderTop="1px solid" borderColor="border.subtle">
              {form.education.map((item, index) => (
                <Box key={`${item.school}-${index}`} py={5} borderBottom="1px solid" borderColor="border.subtle">
                  <Heading fontSize="lg">{item.degree || 'Degree'}</Heading>
                  <Text color="fg.muted">{item.school || 'School'} · {item.period}</Text>
                </Box>
              ))}
            </Stack>
          </Box>
          {form.certifications.length ? (
            <Box>
              <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase">Credentials</Text>
              <Stack mt={3}>{form.certifications.map((item, index) => <Text key={`${item.name}-${index}`}><strong>{item.name || 'Certification'}</strong> · {item.issuer} {item.year}</Text>)}</Stack>
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
    </Box>
  )
}
