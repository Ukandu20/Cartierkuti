'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Flex,
  HStack,
  Input,
  Select,
  Button,
  Text,
  Spinner,
  Tabs, 
  IconButton, 
  Stack, 
  Skeleton
} from '@chakra-ui/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import { useColorMode } from '../../components/Theme/color-mode'
import classes from './Portfolio.module.css'

const PAGE_SIZE = 6
const TABS = ["All", "Data Science", "Web Development", "Data Analysis"]

export default function Portfolio() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabIdx, setTabIdx] = useState(0)
  const [sort, setSort] = useState('date')
  const { colorMode } = useColorMode()
  const bg = colorMode === 'light' ? 'gray.50' : 'gray.800'

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/api/projects')
      setProjects(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const sorted = useMemo(() => {
    return projects
      .filter(p => 
        (TABS[tabIdx] === 'All' || p.category === TABS[tabIdx]) &&
        p.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === 'date') return new Date(b.date) - new Date(a.date)
        if (sort === 'views') return (b.views ?? 0) - (a.views ?? 0)
        return a.title.localeCompare(b.title)
      })
  }, [projects, search, tabIdx, sort])

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const SkeletonLoader = () => (
    <Stack borderRadius="md" bg={colorMode === 'light' ? 'white' : 'gray.800'} 
           w="100%" maxW="sm" boxShadow="sm" spacing={4} p={4}>
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

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex direction="column" align="center" mt={20}>
        <Text mb={4}>Oops—couldn’t load projects.</Text>
        <Button onClick={fetchProjects} colorScheme="teal">
          Retry
        </Button>
      </Flex>
    )
  }

  return (
    <div className={classes.container}>
      <Helmet>
        <title>Portfolio | Your Name</title>
      </Helmet>

      <h1 className={classes.title}>My Projects</h1>

      <Tabs.Root 
        value={String(tabIdx)}
        onValueChange={(val) => setTabIdx(Number(val))}
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
              color={colorMode === 'light' ? 'gray.700' : 'whiteAlpha.800'}
              _hover={{ color: '#05e2d7' }}
              _selected={{ 
                color: '#05e2d7', 
                borderBottom: '2px solid #05e2d7' 
              }}
            >
              {t}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Flex
          mt={8}
          mb={6}
          gap={4}
          direction={{ base: "column", md: "row" }}
          justify="center"
          align="center"
          flexWrap="wrap"
        >
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            maxW={{ base: '100%', md: '300px' }}
            aria-label="Search projects"
          />

          <Select
            placeholder="Sort By"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
          >
            <option value="date">Newest</option>
            <option value="title">Title A-Z</option>
            <option value="views">Most Viewed</option>
          </Select>
        </Flex>

        <AnimatePresence mode="wait">
          <Tabs.Content value={String(tabIdx)}>
            <Box
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {paged.length === 0 ? (
                <Text>No projects found.</Text>
              ) : (
                <Flex flexWrap="wrap" gap={6}>
                  {paged.map(proj => (
                    <Box key={proj.id} flex="1 1 calc(33% - 1rem)" minW="240px">
                      {/* <ProjectCard project={proj} /> */}
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>
          </Tabs.Content>
        </AnimatePresence>

        {totalPages > 1 && (
          <Flex justify="center" mt={8} gap={2}>
            <IconButton
              aria-label="Previous"
              icon={<HiChevronLeft />}
              isDisabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            />
            <Button size="sm" variant="ghost">
              {page} / {totalPages}
            </Button>
            <IconButton
              aria-label="Next"
              icon={<HiChevronRight />}
              isDisabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            />
          </Flex>
        )}
      </Tabs.Root>
    </div>
  )
}