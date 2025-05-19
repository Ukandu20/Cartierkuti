// src/pages/Home/Home.jsx
'use client'

import React, { Suspense } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet'
import { FaExpandAlt } from 'react-icons/fa'
import {
  SiJavascript, SiReact, SiNodedotjs, SiExpress, SiMongodb,
  SiPython, SiPandas, SiNumpy, SiScikitlearn, SiTensorflow, SiMysql,
} from 'react-icons/si'
import { Link, useLocation } from 'react-router-dom'
import { useColorMode } from '@/components/Theme/color-mode'

/* ─── helper to underline active nav link ─── */
const useActiveLink = (pathname) => {
  const { pathname: current } = useLocation()
  return current === pathname ? { textDecoration: 'underline' } : undefined
}

/* ───────────────────────── HERO ───────────────────────── */
const Hero = () => {
  const { colorMode } = useColorMode()

  const main = colorMode === 'light' ? 'gray.100' : 'white'
  const sub  = colorMode === 'light' ? 'gray.300' : 'gray.400'
  const body = colorMode === 'light' ? 'gray.400' : 'gray.300'

  return (
    <Flex
      as="section"
      role="region"
      aria-labelledby="hero-heading"
      direction="column"
      align="center"
      justify="center"
      minH="calc(100vh - 90px)"
      px={4}
      bgGradient={
        colorMode === 'light'
          ? 'linear(to-b, whiteAlpha.900, whiteAlpha.700)'
          : 'linear(to-b, gray.900, gray.800)'
      }
      textAlign="center"
    >
      <Stack spacing={6} maxW="800px" align="center">
        <Heading
          id="hero-heading"
          fontSize={{ base: '5xl', md: '7xl' }}
          fontWeight="700"
          color={main}
          lineHeight="1.1"
        >
          Hey, I’m&nbsp;
          <Box as="span" color="brand.500" whiteSpace="nowrap">
            Preston
          </Box>
        </Heading>

        <Heading
          as="h2"
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="500"
          color={sub}
        >
          Full-stack&nbsp;&amp;&nbsp;Data&nbsp;Science&nbsp;Developer
        </Heading>

        <Text fontSize="lg" color={body} maxW="75%">
          Computer Science grad with a passion for building robust web apps
          and extracting insights from data.
        </Text>

        <Button
          as={Link}
          to="/about"
          variant="link"
          size="lg"
          gap={2}
          colorScheme="brand"
          rightIcon={
            <Icon
              as={FaExpandAlt}
              transform="rotate(45deg)"
              mt="-2px"
              aria-hidden="true"
            />
          }
          aria-label="Learn more about me"
          sx={useActiveLink('/about')}
        >
          Learn&nbsp;More
        </Button>
      </Stack>
    </Flex>
  )
}

/* ─────────────────────── PROJECTS ─────────────────────── */
const Projects = React.lazy(() =>
  import(
    /* webpackChunkName: "ProjectsCarousel" */
    '../../components/Carousel/Carousel'
  )
)

const FeaturedProjects = () => {
  const { colorMode } = useColorMode()
  const heading = colorMode === 'light' ? 'gray.800' : 'white'

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="featured-heading"
      py={16}
      px={4}
      maxW="7xl"
      mx="auto"
      textAlign="center"
    >
      <Heading id="featured-heading" size="xl" mb={10} color={heading}>
        Featured&nbsp;Projects
      </Heading>

      <Suspense fallback={<Spinner size="xl" />}>
        <Projects />
      </Suspense>
    </Box>
  )
}

/* ─────────────────────── SKILLS ───────────────────────── */
const webSkills = [
  { label: 'JavaScript',    Icon: SiJavascript },
  { label: 'React',         Icon: SiReact      },
  { label: 'Node.js',       Icon: SiNodedotjs  },
  { label: 'Express',       Icon: SiExpress    },
  { label: 'MongoDB',       Icon: SiMongodb    },
]
const dataSkills = [
  { label: 'Python',        Icon: SiPython      },
  { label: 'pandas',        Icon: SiPandas      },
  { label: 'NumPy',         Icon: SiNumpy       },
  { label: 'scikit-learn',  Icon: SiScikitlearn },
  { label: 'TensorFlow',    Icon: SiTensorflow  },
  { label: 'SQL',           Icon: SiMysql       },
]

const SkillGrid = ({ items }) => (
  <SimpleGrid
    columns={{ base: 3, sm: 4, md: 6 }}
    spacing={8}
    justifyItems="center"
    mt={6}
  >
    {items.map(({ label, Icon: I }) => (
      <Box key={label} textAlign="center" aria-label={label}>
        <Icon as={I} fontSize="3xl" mb={2} aria-hidden="true" />
        <Text fontSize="sm">{label}</Text>
      </Box>
    ))}
  </SimpleGrid>
)

const Skills = () => {
  const { colorMode } = useColorMode()
  const h   = colorMode === 'light' ? 'gray.800' : 'white'
  const sub = colorMode === 'light' ? 'gray.600' : 'gray.300'
  const subSize = useBreakpointValue({ base: 'lg', md: 'xl' })

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="skills-heading"
      py={16}
      px={4}
    >
      <Heading
        id="skills-heading"
        size="xl"
        textAlign="center"
        mb={10}
        color={h}
      >
        Technical&nbsp;Skills
      </Heading>

      <Heading size={subSize} textAlign="center" color={sub}>
        Web&nbsp;Development
      </Heading>
      <SkillGrid items={webSkills} />

      <Heading size={subSize} textAlign="center" mt={14} color={sub}>
        Data&nbsp;Science&nbsp;&amp;&nbsp;Analytics
      </Heading>
      <SkillGrid items={dataSkills} />
    </Box>
  )
}

/* ─────────────────────── MAIN PAGE ────────────────────── */
export default function Home() {
  return (
    <>
      {/* SEO/meta */}
      <Helmet>
        <title>Preston | Full-stack & Data Science Developer</title>
        <meta
          name="description"
          content="Portfolio of Preston – full-stack & data-science developer building robust web apps and extracting insights from data."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Preston | Full-stack & Data Science Developer" />
        <meta
          property="og:description"
          content="Explore featured projects, technical skills, and career highlights of Preston."
        />
        <meta property="og:url" content="https://your-domain.com/" />
        <meta property="og:image" content="https://your-domain.com/og-cover.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main>
        <Hero />
        <FeaturedProjects />
        <Skills />
      </main>
    </>
  )
}
