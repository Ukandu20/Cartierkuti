// src/pages/Portfolio/Portfolio.jsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
  Input,
  Portal,
  Flex,
  Text,
  IconButton,
  Stack,
  HStack,
  Skeleton,
  Box,
  Button,
  Tabs,
  Select,
  createListCollection,
} from '@chakra-ui/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { Helmet, HelmetProvider } from 'react-helmet-async'

import ProjectList from './ProjectList'
import classes from './Portfolio.module.css'
import { useColorMode } from '../../components/Theme/color-mode'

/* ───────────────── constants ───────────────── */
const TABS      = ['All', 'Data Science', 'Web Development', 'Data Analysis']
const PAGE_SIZE = 6

/* ───────────────── component ───────────────── */
export default function Portfolio() {
  const { colorMode } = useColorMode()
  const accent = '#05e2d7'

  /* palette */
  const idleTxt    = colorMode === 'light' ? 'gray.700'    : 'whiteAlpha.800'
  const fieldBg    = colorMode === 'light' ? 'gray.100'    : 'whiteAlpha.100'
  const fieldBd    = colorMode === 'light' ? 'gray.300'    : 'whiteAlpha.300'
  const fieldTx    = colorMode === 'light' ? 'gray.800'    : 'whiteAlpha.900'
  const phColor    = colorMode === 'light' ? 'gray.500'    : 'gray.400'
  const skeletonBg = colorMode === 'light' ? 'white'       : 'gray.800'

  /* sort-list collection (for headless Select) */
  const sortOptions = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Newest',      value: 'date'  },
          { label: 'Title A-Z',   value: 'title' },
          { label: 'Most Viewed', value: 'views' },
        ],
      }),
    []
  )

  /* ───────────── state ───────────── */
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [fav,      setFav]      = useState([])
  const [tabIdx,   setTabIdx]   = useState(0)
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState('date')
  const [page,     setPage]     = useState(1)

  /* ───────────── fetch once ───────────── */
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const { data } = await axios.get('/api/projects')
        setProjects(Array.isArray(data) ? data : [])
      } catch {
        setError('Error fetching projects.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* reset page whenever filter changes */
  useEffect(() => setPage(1), [search, sort, tabIdx])

  /* ───────────── helpers ───────────── */
  const toggleFav = id =>
    setFav(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const hitAndOpen = (id, url, e) => {
    e?.preventDefault?.()
    axios.patch(`/api/projects/${id}/hit`)
    window.open(url, '_blank')
  }

  /* skeleton card */
  const SkeletonLoader = () => (
    <Stack
      borderRadius="md"
      bg={skeletonBg}
      w="100%"
      maxW="sm"
      boxShadow="sm"
      spacing={4}
      p={4}
    >
      <Skeleton height="200px" borderRadius="md" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="14px" width="60%" />
      <Skeleton height="14px" width="90%" />
      <HStack spacing={3} mt={2}>
        <Skeleton height="36px" width="80px" borderRadius="md" />
        <Skeleton height="36px" width="80px" borderRadius="md" />
        <Skeleton height="36px" width="36px" borderRadius="full" />
      </HStack>
    </Stack>
  )

  /* ───────────── derive list ───────────── */
  const currentCategory = TABS[tabIdx]
  const filtered = useMemo(() => {
    return projects.filter(
      p =>
        (currentCategory === 'All' || p.category === currentCategory) &&
        p.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, currentCategory, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === 'date')  return new Date(b.date) - new Date(a.date)
      if (sort === 'views') return (b.views ?? 0)  - (a.views ?? 0)
      return a.title.localeCompare(b.title)
    })
  }, [filtered, sort])

  const pagesCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  /* ───────────── UI ───────────── */
  return (
    <HelmetProvider>
      <div className={classes.container}>
        <Helmet>
          <title>Portfolio | Preston</title>
        </Helmet>

        <h1 className={classes.title}>My Projects</h1>

        {/* ——— tabs ——— */}
        <Tabs.Root
          value={String(tabIdx)}
          onValueChange={(details) => setTabIdx(Number(details.value))}

          variant="unstyled"
        >
          <Tabs.List justifyContent="center" className={classes.tabs}>
            {TABS.map((t, i) => (
              <Tabs.Trigger
                key={i}
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
                {t}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* ——— search & sort ——— */}
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
              placeholder="Search projects…"
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

            {/* headless Select */}
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

          {/* ——— tab panel (no animation) ——— */}
          <Tabs.Content value={String(tabIdx)}>
            {loading ? (
              <Flex wrap="wrap" gap={8} justify="center">
                {[...Array(PAGE_SIZE)].map((_, idx) => (
                  <SkeletonLoader key={idx} />
                ))}
              </Flex>
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <ProjectList
                searchedProjects={paginated}
                favorites={fav}
                handleFavorite={toggleFav}
                hitAndOpen={hitAndOpen}
              />
            )}

            {pagesCount > 1 && (
              <Flex justify="center" mt={8} gap={2}>
                <IconButton
                  aria-label="Previous"
                  icon={<HiChevronLeft />}
                  isDisabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                />
                <Button size="sm" variant="ghost">
                  {page} / {pagesCount}
                </Button>
                <IconButton
                  aria-label="Next"
                  icon={<HiChevronRight />}
                  isDisabled={page === pagesCount}
                  onClick={() => setPage(p => p + 1)}
                />
              </Flex>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </HelmetProvider>
  )
}
