'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Heading,
  Text,
  Stack,
  Tabs,
  List,
  Select,
  Portal,
  VisuallyHidden,
  useBreakpointValue,
  createListCollection,
} from '@chakra-ui/react'
import { useColorMode as useThemeColorMode } from '@/components/Theme/color-mode'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

/* — tab labels — */
const TABS = ['Education', 'Skills', 'Experience']

/* — data — */
const EDUCATION = [
  { school: 'University of Windsor', degree: 'B.Sc. Computer Science', years: '2019 – 2023' },
  { school: 'Coursera / edX', degree: 'Data‑Science Specialisation',   years: '2023 – Present' },
]
const SKILLS = [
  'JavaScript / TypeScript · React · Node.js / Express',
  'Python · pandas · NumPy · scikit‑learn · TensorFlow',
  'MongoDB · SQL · Git & GitHub · Docker · Linux',
]
const EXPERIENCE = [
  { title: 'Volunteer Python Instructor', org: 'Black Boys Code', period: '2023 – Present' },
  { title: 'Freelance Full‑Stack Developer', org: 'Remote',        period: '2022 – Present' },
]

const MotionBox = motion(Box)

export default function About() {
  const { colorMode } = useThemeColorMode()
  const [tabIdx, setTabIdx] = useState(0)

  /* responsive: tabs on ≥md, select on <md */
  const isMobile = useBreakpointValue({ base: true, md: false })

  /* memoized collection for Select */
  const selectCollection = useMemo(
    () =>
      createListCollection({
        items: TABS.map((label, i) => ({ label, value: String(i) })),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      }),
    [],
  )

  /* theme-aware tokens */
  const headingClr = colorMode === 'light' ? 'gray.800' : 'gray.100'
  const textClr    = colorMode === 'light' ? 'gray.600' : 'gray.300'
  const cardBg     = colorMode === 'light' ? 'whiteAlpha.200' : 'blackAlpha.400'
  const accent     = 'brand.500'

  /** ----------------------------------------------------------------
   *  Render helpers
   * ---------------------------------------------------------------- */
  const renderEducation = () => (
    <Stack spacing={6} as="ul" listStyleType="none">
      {EDUCATION.map(({ school, degree, years }) => (
        <Box as="li" key={school} bg={cardBg} p={6} rounded="lg" boxShadow="md">
          <Heading size="md" color={headingClr}>{school}</Heading>
          <Text>{degree}</Text>
          <Text fontSize="sm" color={textClr}>{years}</Text>
        </Box>
      ))}
    </Stack>
  )

  const renderSkills = () => (
    <Box bg={cardBg} p={6} rounded="lg" boxShadow="md">
      <List.Root spacing={2} ps={4} color={textClr} styleType="disc">
        {SKILLS.map((skill) => (
          <List.Item key={skill}>{skill}</List.Item>
        ))}
      </List.Root>
    </Box>
  )

  const renderExperience = () => (
    <Stack spacing={6} as="ul" listStyleType="none">
      {EXPERIENCE.map(({ title, org, period }) => (
        <Box as="li" key={title} bg={cardBg} p={6} rounded="lg" boxShadow="md">
          <Heading size="md" color={headingClr}>{title}</Heading>
          {org && <Text fontWeight="medium">{org}</Text>}
          <Text fontSize="sm" color={textClr}>{period}</Text>
        </Box>
      ))}
    </Stack>
  )

  const tabContent = [renderEducation(), renderSkills(), renderExperience()]

  return (
    <Box as="section" id="about" maxW="5xl" mx="auto" pt={{ base: 10, md: 16 }} px={4}>
      {/* SEO meta */}
      <Helmet>
        <title>About Me | Preston Ukandu — Full‑Stack &amp; Data‑Science Developer</title>
        <meta
          name="description"
          content="Learn more about Preston Ukandu, a full‑stack and data‑science developer who loves solving complex problems, mentoring others, and analysing football data."
        />
        <link rel="canonical" href="https://your‑domain.com/about" />
      </Helmet>

      <Heading size="2xl" mb={6} textAlign="center" color={headingClr}>About&nbsp;Me</Heading>

      <Text fontSize="lg" mb={10} maxW="3xl" mx="auto" textAlign="center" color={textClr}>
        I’m Preston — a full‑stack &amp; data‑science developer who loves turning complex problems into elegant solutions. When I’m not coding, I’m analysing football data or mentoring the next generation of programmers.
      </Text>

      {/* ───────────────────  Controls  ─────────────────── */}
      {isMobile ? (
        <Select.Root
          collection={selectCollection}
          value={[String(tabIdx)]}
          onValueChange={({ value }) => {
            const next = Array.isArray(value) ? value[0] : value
            setTabIdx(Number(next))
          }}
          width="xs"
          size="sm"
          mb={4}
          mx="auto"
          aria-label="About section selector"
        >
          <Select.HiddenSelect />
          {/* Label visually hidden for screen‑readers */}
          <VisuallyHidden asChild>
            <Select.Label>About section</Select.Label>
          </VisuallyHidden>

          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Choose section" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
              <Select.ClearTrigger />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {selectCollection.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      ) : (
        <Tabs.Root
          aria-label="About sections"
          value={String(tabIdx)}
          onValueChange={(d) => setTabIdx(Number(d.value))}
          variant="enclosed"
          fitted
        >
          <Tabs.List mb={4} justify="center" gap={4}>
            {TABS.map((label, i) => (
              <Tabs.Trigger
                key={label}
                value={String(i)}
                px={4}
                py={2}
                fontWeight="semibold"
                rounded="md"
                _selected={{ bg: accent, color: 'white' }}
              >
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      )}

      {/* ────────────────  Animated content  ──────────────── */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={tabIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {tabContent[tabIdx]}
        </MotionBox>
      </AnimatePresence>
    </Box>
  )
}
