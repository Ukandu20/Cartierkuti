import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'
import {
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Pagination,
  Portal,
  Select,
  Skeleton,
  Stack,
  Tabs,
  createListCollection,
} from '@chakra-ui/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { Helmet } from 'react-helmet-async'
import { EmptyState, ErrorState } from '@/components/ui/StateFeedback'
import { PROJECT_CATEGORIES, isProjectInCategory } from '@/utils/projectCategories'

import ProjectList from './ProjectList'
import classes from './Portfolio.module.css'

const TABS = PROJECT_CATEGORIES
const PAGE_SIZE = 9

export default function Portfolio() {
  const accent = 'brand.500'

  const idleTxt = 'fg.muted'
  const fieldBg = 'bg.subtle'
  const fieldBd = 'border.subtle'
  const fieldTx = 'fg.default'
  const phColor = 'fg.muted'
  const skeletonBg = 'bg.surface'

  const sortOptions = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Newest', value: 'date' },
          { label: 'Title A-Z', value: 'title' },
          { label: 'Most Viewed', value: 'views' },
        ],
      }),
    []
  )

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fav, setFav] = useState([])
  const [tabIdx, setTabIdx] = useState(0)
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
      setError('Error fetching projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => setPage(1), [search, sort, tabIdx])

  const toggleFav = id =>
    setFav(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const hitAndOpen = (id, url, e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (!url) return
    apiClient.patch(`/api/projects/${id}/hit`)
    window.open(url, '_blank')
  }

  const SkeletonLoader = () => (
    <Stack
      borderRadius="md"
      bg={skeletonBg}
      w="100%"
      maxW="sm"
      boxShadow="sm"
      gap={4}
      p={4}
    >
      <Skeleton height="200px" borderRadius="md" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="14px" width="60%" />
      <Skeleton height="14px" width="90%" />
      <HStack gap={3} mt={2}>
        <Skeleton height="36px" width="80px" borderRadius="md" />
        <Skeleton height="36px" width="80px" borderRadius="md" />
        <Skeleton height="36px" width="36px" borderRadius="full" />
      </HStack>
    </Stack>
  )

  const currentCategory = TABS[tabIdx]
  const filtered = useMemo(() => {
    return projects.filter(
      p =>
        isProjectInCategory(p, currentCategory.value) &&
        p.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, currentCategory, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === 'date') return new Date(b.createdDate || 0) - new Date(a.createdDate || 0)
      if (sort === 'views') return (b.views ?? 0) - (a.views ?? 0)
      return a.title.localeCompare(b.title)
    })
  }, [filtered, sort])

  const pagesCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={classes.container}>
      <Helmet>
        <title>Portfolio | Preston</title>
      </Helmet>

      <h1 className={classes.title}>My Projects</h1>

      <Tabs.Root
        value={String(tabIdx)}
        onValueChange={(details) => setTabIdx(Number(details.value))}
        variant="unstyled"
      >
        <Tabs.List justifyContent="center" className={classes.tabs}>
          {TABS.map((t, i) => (
            <Tabs.Trigger
              key={t.value}
              value={String(i)}
              fontSize="md"
              px={5}
              py={2}
              color={idleTxt}
              fontWeight={tabIdx === i ? 'bold' : 'normal'}
              bg="transparent"
              border="none"
              _hover={{ color: accent, fontWeight: 'bold' }}
              _selected={{ color: accent, borderBottom: `2px solid ${accent}` }}
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Flex
          mt={8}
          mb={6}
          gap={4}
          direction={{ base: 'column', md: 'row' }}
          justify="center"
          align="center"
          wrap="wrap"
        >
          <Input
            w={{ base: '100%', md: '260px' }}
            px={2}
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            bg={fieldBg}
            color={fieldTx}
            borderColor={fieldBd}
            _placeholder={{ color: phColor }}
            _focusVisible={{
              borderColor: accent,
              boxShadow: `0 0 0 1px ${accent}`,
            }}
          />

          <Select.Root
            collection={sortOptions}
            value={sort}
            onValueChange={item => setSort(item.value)}
            size="sm"
            width={{ base: '100%', md: '220px' }}
          >
            <Select.HiddenSelect />
            <Select.Label srOnly>Sort projects</Select.Label>

            <Select.Control
              bg={fieldBg}
              color={fieldTx}
              borderColor={fieldBd}
              _focusVisible={{
                borderColor: accent,
                boxShadow: `0 0 0 1px ${accent}`,
              }}
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Sort By" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>

            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {sortOptions.items.map(opt => (
                    <Select.Item key={opt.value} item={opt}>
                      {opt.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Flex>

        <Tabs.Content value={String(tabIdx)}>
          {loading ? (
            <Flex wrap="wrap" gap={8} justify="center">
              {[...Array(PAGE_SIZE)].map((_, idx) => (
                <SkeletonLoader key={idx} />
              ))}
            </Flex>
          ) : error ? (
            <ErrorState
              title={error}
              description="Check the API connection and try again."
              onRetry={fetchProjects}
            />
          ) : paginated.length === 0 ? (
            <EmptyState
              title="No projects found."
              description="Try a different category, search, or sort option."
            />
          ) : (
            <ProjectList
              searchedProjects={paginated}
              favorites={fav}
              handleFavorite={toggleFav}
              hitAndOpen={hitAndOpen}
            />
          )}

          {pagesCount > 1 && (
            <Flex justify="center" mt={8} gap={2} wrap="wrap">
              <Pagination.Root
                count={sorted.length}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={(e) => setPage(e.page)}
              >
                <ButtonGroup variant="ghost" size="sm" mt={8} gap={2}>
                  <Pagination.PrevTrigger asChild>
                    <IconButton aria-label="Previous">
                      <HiChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(pageObj) => (
                      <IconButton
                        key={pageObj.value}
                        variant={{ base: 'outline', _selected: 'solid' }}
                      >
                        {pageObj.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger asChild>
                    <IconButton aria-label="Next">
                      <HiChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
