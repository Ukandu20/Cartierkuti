import React, { useState } from 'react'
import { Badge, Box, Button, ButtonGroup, Flex, Heading, Input, NativeSelect, SimpleGrid, Text } from '@chakra-ui/react'
import { HiFilter } from 'react-icons/hi'
import PaginationControls from '@/components/pagination/pagination'
import { EmptyState } from '@/components/ui/StateFeedback'
import { niceDate } from '@/utils/formatDate'
import { fieldStyles, SurfaceCard } from '@/components/ui/DesignSystem'
import ActivityCard from '../activity'

export default function ActivityLogSection({
  activities,
  totalActivities,
  page,
  pageCount,
  pageSize,
  filterType,
  setFilterType,
  filterStart,
  setFilterStart,
  filterEnd,
  setFilterEnd,
  setPage,
  fetchActivities,
  clearFilters,
  bg,
  dialogBg,
  dialogBorder,
}) {
  const hasFilters = Boolean(filterType || filterStart || filterEnd)
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <SurfaceCard p={{ base: 4, md: 5 }} bg={dialogBg} borderColor={dialogBorder} h="full">
      <Flex justify="space-between" align="center" mb={hasFilters ? 3 : 4} gap={3} wrap="wrap">
        <Box>
          <Heading size="md">Recent activity</Heading>
          <Text fontSize="xs" color="fg.muted">{totalActivities} events</Text>
        </Box>
        <Button size="sm" variant={filtersOpen ? 'subtle' : 'outline'} onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen}>
          <HiFilter /> Filters {hasFilters ? '(active)' : ''}
        </Button>
      </Flex>
      {hasFilters && !filtersOpen && (
        <Flex mb={4} gap={2} wrap="wrap" align="center">
          {filterType && <Badge variant="subtle">Type: {filterType}</Badge>}
          {filterStart && <Badge variant="subtle">From: {filterStart}</Badge>}
          {filterEnd && <Badge variant="subtle">To: {filterEnd}</Badge>}
          <Button size="xs" variant="ghost" onClick={clearFilters}>Clear</Button>
        </Flex>
      )}
      {filtersOpen && (
        <Flex mb={4} p={4} gap={3} align="center" wrap="wrap" bg={bg} borderRadius="lg">
          <NativeSelect.Root maxW={{ base: '100%', md: '180px' }}>
            <NativeSelect.Field value={filterType} onChange={(event) => setFilterType(event.target.value)} {...fieldStyles} aria-label="Filter activity type">
              <option value="">All activity</option>
              {['Created', 'Updated', 'Deleted'].map((item) => <option key={item} value={item}>{item}</option>)}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Input aria-label="Activity start date" type="date" value={filterStart} onChange={(event) => setFilterStart(event.target.value)} {...fieldStyles} maxW={{ base: '100%', md: '180px' }} />
          <Input aria-label="Activity end date" type="date" value={filterEnd} onChange={(event) => setFilterEnd(event.target.value)} {...fieldStyles} maxW={{ base: '100%', md: '180px' }} />
          <ButtonGroup size="sm" gap={2}>
            <Button colorPalette="brand" onClick={() => { setPage(1); fetchActivities(); setFiltersOpen(false) }}>Apply</Button>
            <Button variant="outline" onClick={clearFilters}>Clear</Button>
          </ButtonGroup>
        </Flex>
      )}
      <SimpleGrid columns={1} gap={2}>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard
              key={activity._id || activity.id}
              type={activity.type}
              title={activity.title}
              timestamp={niceDate(activity.timestamp || activity.createdAt)}
              detail={activity.detail}
            />
          ))
        ) : (
          <EmptyState title="No activity yet." compact />
        )}
      </SimpleGrid>

      {pageCount > 1 && (
        <Flex justify="center" mt={4}>
          <PaginationControls
            count={totalActivities}
            pageSize={pageSize}
            page={page}
            onPageChange={setPage}
          />
        </Flex>
      )}
    </SurfaceCard>
  )
}
