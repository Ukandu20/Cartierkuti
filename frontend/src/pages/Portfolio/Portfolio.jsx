import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Pagination,
  Portal,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  createListCollection,
} from '@chakra-ui/react'
import { FaArrowRight, FaSearch } from 'react-icons/fa'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/ui/StateFeedback'
import { PageCta, SectionLabel } from '@/components/ui/DesignSystem'
import { getPopulatedProjectCategories, isProjectInCategory } from '@/utils/projectCategories'
import { sortProjects } from '@/utils/projectSorting'
import { absoluteUrl } from '@/utils/siteConfig'

import ProjectList from './ProjectList'
import ProjectCard from './ProjectCard'

const PAGE_SIZE = 9

const searchProject = (project, query) => {
  const haystack = [
    project.title,
    project.description,
    project.category,
    project.status,
    ...(project.tags || []),
    ...(project.methods || []),
    ...(project.tools || []),
    ...(project.languages || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query.trim().toLowerCase())
}

export default function Portfolio() {
  const sortOptions = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Newest first', value: 'date' },
          { label: 'Title A–Z', value: 'title' },
          { label: 'Most viewed', value: 'views' },
        ],
      }),
    []
  )

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date')
  const [page, setPage] = useState(1)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/projects')
      setProjects(normalizeProjects(data))
      setError('')
    } catch {
      setError('Projects could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => setPage(1), [search, sort, activeCategory])

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    )
  }

  const hitAndOpen = (id, url, event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()
    if (!url) return
    apiClient.patch(`/api/projects/${id}/hit`).catch(() => {})
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const visibleCategories = useMemo(() => getPopulatedProjectCategories(projects), [projects])
  const currentCategory = visibleCategories.find((category) => category.value === activeCategory) || visibleCategories[0]
  const filtered = useMemo(
    () =>
      projects.filter(
        (project) =>
          isProjectInCategory(project, currentCategory.value) && searchProject(project, search)
      ),
    [projects, currentCategory, search]
  )
  const sorted = useMemo(() => sortProjects(filtered, sort), [filtered, sort])
  const featuredProject = useMemo(
    () =>
      [...projects].sort(
        (a, b) => Number(b.featured) - Number(a.featured) || (b.views || 0) - (a.views || 0)
      )[0],
    [projects]
  )
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Box bg={'bg.canvas'} color={'fg.default'} fontFamily={'body'}>
      <Helmet>
        <title>Portfolio | Preston Ukandu</title>
        <meta
          name="description"
          content="Explore data science, sports analytics, dashboards, models, and software projects by Preston Ukandu."
        />
        <link rel="canonical" href={absoluteUrl('/portfolio')} />
      </Helmet>

      <Box as="section" px={{ base: 6, md: 10 }} py={{ base: 14, md: 24 }}>
        <SimpleGrid maxW="7xl" mx="auto" columns={{ base: 1, lg: 12 }} gap={{ base: 10, lg: 16 }} alignItems="end">
          <Stack gridColumn={{ lg: 'span 8' }} gap={6}>
            <SectionLabel color={'accent.default'}>Portfolio / Selected analytical work</SectionLabel>
            <Heading
              as="h1"
              fontFamily={'heading'}
              fontSize={{ base: '4xl', sm: '5xl', md: '6xl' }}
              fontWeight="500"
              letterSpacing="-0.035em"
              lineHeight={{ base: '1.2', md: '1.12' }}
              maxW="900px"
            >
              Work built to move from{' '}
              <Box as="span" color={'accent.default'}>evidence to action.</Box>
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color={'fg.muted'} lineHeight="1.75" maxW="760px">
              Case studies across data science, sports analytics, decision intelligence, and software delivery—focused on the question, the method, and the result.
            </Text>
          </Stack>

          <Stack gridColumn={{ lg: 'span 4' }} borderTop="1px solid" borderColor={'border.subtle'} gap={0}>
            {[
              ['01', 'Frame the decision'],
              ['02', 'Build the evidence'],
              ['03', 'Communicate the result'],
            ].map(([number, label]) => (
              <HStack key={number} py={4} borderBottom="1px solid" borderColor={'border.subtle'} gap={4}>
                <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'}>{number}</Text>
                <Text fontWeight="600">{label}</Text>
              </HStack>
            ))}
          </Stack>
        </SimpleGrid>
      </Box>

      {!loading && featuredProject ? (
        <Box as="section" aria-labelledby="featured-project-heading" bg={'bg.raised'} borderY="1px solid" borderColor={'border.subtle'} px={{ base: 6, md: 10 }} py={{ base: 14, md: 20 }}>
          <Box maxW="7xl" mx="auto">
            <Stack gap={3} mb={8} maxW="760px">
              <SectionLabel color={'accent.default'}>01 / Featured case study</SectionLabel>
              <Heading id="featured-project-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '4xl' }} fontWeight="500" lineHeight="1.2">
                A closer look at the work.
              </Heading>
            </Stack>
            <ProjectCard
              project={featuredProject}
              favorites={favorites}
              handleFavorite={toggleFavorite}
              hitAndOpen={hitAndOpen}
              featured
            />
          </Box>
        </Box>
      ) : null}

      <Box as="section" aria-labelledby="project-archive-heading" px={{ base: 6, md: 10 }} py={{ base: 16, md: 24 }}>
        <Box maxW="7xl" mx="auto">
          <Flex justify="space-between" align="end" gap={6} wrap="wrap" mb={10}>
            <Stack gap={3} maxW="720px">
              <SectionLabel color={'accent.default'}>02 / Project archive</SectionLabel>
              <Heading id="project-archive-heading" fontFamily={'heading'} fontSize={{ base: '3xl', md: '5xl' }} fontWeight="500" lineHeight={{ base: '1.25', md: '1.16' }}>
                Explore the full body of work.
              </Heading>
            </Stack>
            {!loading && !error ? (
              <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.12em">
                {sorted.length} of {projects.length} projects
              </Text>
            ) : null}
          </Flex>

          <Tabs.Root
            value={currentCategory.value}
            onValueChange={(details) => setActiveCategory(details.value)}
            variant="unstyled"
          >
            <Tabs.List
              aria-label="Filter projects by category"
              display="flex"
              gap={2}
              overflowX="auto"
              pb={2}
              mb={6}
              css={{ scrollbarWidth: 'thin' }}
            >
              {visibleCategories.map((category) => (
                <Tabs.Trigger
                  key={category.value}
                  value={category.value}
                  flexShrink="0"
                  px={4}
                  py={2}
                  border="1px solid"
                  borderColor={currentCategory.value === category.value ? 'accent.default' : 'border.subtle'}
                  borderRadius="full"
                  color={currentCategory.value === category.value ? 'fg.default' : 'fg.muted'}
                  bg={currentCategory.value === category.value ? 'accent.subtle' : 'transparent'}
                  fontFamily={'body'}
                  fontWeight="600"
                  _hover={{ borderColor: 'accent.default', color: 'fg.default' }}
                  _focusVisible={{ outline: '2px solid', outlineColor: 'accent.default', outlineOffset: '2px' }}
                >
                  {category.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Flex
              bg={'bg.surface'}
              border="1px solid"
              borderColor={'border.subtle'}
              borderRadius="lg"
              p={{ base: 4, md: 5 }}
              mb={10}
              gap={4}
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              justify="space-between"
            >
              <HStack flex="1" maxW={{ md: '520px' }} gap={3}>
                <Icon as={FaSearch} color={'fg.muted'} aria-hidden="true" />
                <Input
                  aria-label="Search projects"
                  variant="flushed"
                  placeholder="Search titles, categories, tools, or status"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  color={'fg.default'}
                  borderColor={'border.subtle'}
                  _placeholder={{ color: 'fg.muted' }}
                  _focusVisible={{ borderColor: 'accent.default', boxShadow: 'none' }}
                />
              </HStack>

              <Select.Root
                collection={sortOptions}
                value={[sort]}
                onValueChange={({ value }) => setSort(value[0] || 'date')}
                size="sm"
                width={{ base: '100%', md: '210px' }}
              >
                <Select.HiddenSelect />
                <Select.Label srOnly>Sort projects</Select.Label>
                <Select.Control bg={'bg.raised'} color={'fg.default'} borderColor={'border.subtle'}>
                  <Select.Trigger><Select.ValueText /></Select.Trigger>
                  <Select.IndicatorGroup><Select.Indicator /></Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {sortOptions.items.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          {option.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Flex>

            <Tabs.Content value={currentCategory.value}>
              {loading ? (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 6, md: 8 }} role="status" aria-label="Loading projects">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Stack key={index} bg={'bg.surface'} border="1px solid" borderColor={'border.subtle'} borderRadius="lg" overflow="hidden" minH="480px" gap={0}>
                      <Skeleton aspectRatio="16 / 10" />
                      <Stack p={6} gap={4}><Skeleton h="4" w="32" /><Skeleton h="8" /><Skeleton h="16" /><Skeleton h="10" /></Stack>
                    </Stack>
                  ))}
                </SimpleGrid>
              ) : error ? (
                <ErrorState title={error} description="Check the API connection and try again." onRetry={fetchProjects} />
              ) : paginated.length === 0 ? (
                <Box borderY="1px solid" borderColor={'border.subtle'} py={8}>
                  <EmptyState title="No projects match those filters." description="Try another category or clear the search term." />
                </Box>
              ) : (
                <ProjectList
                  searchedProjects={paginated}
                  favorites={favorites}
                  handleFavorite={toggleFavorite}
                  hitAndOpen={hitAndOpen}
                />
              )}

              {pageCount > 1 ? (
                <Flex justify="center" mt={12}>
                  <Pagination.Root count={sorted.length} pageSize={PAGE_SIZE} page={page} onPageChange={(event) => setPage(event.page)}>
                    <ButtonGroup variant="outline" size="sm" gap={2}>
                      <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous page" colorPalette="brand"><HiChevronLeft /></IconButton>
                      </Pagination.PrevTrigger>
                      <Pagination.Items
                        render={(pageObject) => (
                          <IconButton key={pageObject.value} variant={{ base: 'outline', _selected: 'solid' }} colorPalette="brand" aria-label={`Page ${pageObject.value}`}>
                            {pageObject.value}
                          </IconButton>
                        )}
                      />
                      <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next page" colorPalette="brand"><HiChevronRight /></IconButton>
                      </Pagination.NextTrigger>
                    </ButtonGroup>
                  </Pagination.Root>
                </Flex>
              ) : null}
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>

      <PageCta
        headingId="portfolio-collaboration-heading"
        eyebrow="Have a question worth measuring?"
        title="Let's build the evidence around it."
        description="Open to data science, dashboards, and sports analytics collaborations."
      >
        <Link to="/contact">Start a conversation <FaArrowRight /></Link>
      </PageCta>
    </Box>
  )
}
