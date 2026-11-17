import React, { useState } from 'react'
import { Badge, Box, Button, ButtonGroup, Flex, Heading, Input, NativeSelect, SimpleGrid, Text } from '@chakra-ui/react'
import { HiFilter } from 'react-icons/hi'
import PaginationControls from '@/components/pagination/pagination'
import { EmptyState, LoadingState } from '@/components/ui/StateFeedback'
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
  filterStart,
  filterEnd,
  setPage,
  fetchActivities,
  clearFilters,
  applyFilters,
  loading,
  error,
  bg,
  dialogBg,
  dialogBorder,
}) {
  const hasFilters = Boolean(filterType || filterStart || filterEnd)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draft, setDraft] = useState({ type: '', startDate: '', endDate: '' })
  const [dateError, setDateError] = useState('')
  const updateDraft = (key, value) => { setDraft(current => ({ ...current, [key]: value })); setDateError('') }
  const toggleFilters = () => {
    if (!filtersOpen) setDraft({ type: filterType, startDate: filterStart, endDate: filterEnd })
    setDateError('')
    setFiltersOpen(current => !current)
  }
  const clear = () => { setDraft({ type: '', startDate: '', endDate: '' }); setDateError(''); clearFilters() }
  const apply = () => {
    if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
      setDateError('The end date must be on or after the start date.')
      return
    }
    applyFilters(draft)
    setFiltersOpen(false)
  }

  return (
    <SurfaceCard as="section" aria-label="Recent activity" aria-busy={loading} p={{ base: 4, md: 5 }} bg={dialogBg} borderColor={dialogBorder} h="full">
      <Flex justify="space-between" align="center" mb={hasFilters ? 3 : 4} gap={3} wrap="wrap">
        <Box>
          <Heading size="md">Recent activity</Heading>
          <Text fontSize="xs" color="fg.muted">{totalActivities} events</Text>
        </Box>
        <Button size="sm" variant={filtersOpen ? 'subtle' : 'outline'} onClick={toggleFilters} aria-expanded={filtersOpen}>
          <HiFilter /> Filters {hasFilters ? '(active)' : ''}
        </Button>
      </Flex>
      {hasFilters && !filtersOpen && (
        <Flex mb={4} gap={2} wrap="wrap" align="center">
          {filterType && <Badge variant="subtle">Type: {filterType}</Badge>}
          {filterStart && <Badge variant="subtle">From: {filterStart}</Badge>}
          {filterEnd && <Badge variant="subtle">To: {filterEnd}</Badge>}
          <Button size="xs" variant="ghost" onClick={clear}>Clear</Button>
        </Flex>
      )}
      {filtersOpen && (
        <Flex mb={4} p={4} gap={3} align="center" wrap="wrap" bg={bg} borderRadius="lg">
          <NativeSelect.Root maxW={{ base: '100%', md: '180px' }}>
            <NativeSelect.Field value={draft.type} onChange={(event) => updateDraft('type', event.target.value)} {...fieldStyles} aria-label="Filter activity type">
              <option value="">All activity</option>
              {['Created', 'Updated', 'Deleted'].map((item) => <option key={item} value={item}>{item}</option>)}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Input aria-label="Activity start date" type="date" value={draft.startDate} onChange={(event) => updateDraft('startDate', event.target.value)} {...fieldStyles} maxW={{ base: '100%', md: '180px' }} />
          <Input aria-label="Activity end date" type="date" value={draft.endDate} onChange={(event) => updateDraft('endDate', event.target.value)} aria-invalid={Boolean(dateError)} {...fieldStyles} maxW={{ base: '100%', md: '180px' }} />
          <ButtonGroup size="sm" gap={2}>
            <Button colorPalette="brand" onClick={apply}>Apply</Button>
            <Button variant="outline" onClick={clear}>Clear</Button>
          </ButtonGroup>
        </Flex>
      )}
      {dateError ? <Text role="alert" color="fg.error" mb={4}>{dateError}</Text> : null}
      {loading ? <LoadingState label="Loading activity..." compact /> : null}
      {error ? <Box role="alert" mb={4}>
        <Text color="fg.error">{error}</Text>
        {activities.length ? <Text color="fg.muted" fontSize="sm">Previously loaded events are shown below.</Text> : null}
        <Button size="sm" variant="outline" mt={3} onClick={() => fetchActivities()} disabled={loading}>Retry activity</Button>
      </Box> : null}
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
        ) : !loading && !error ? (
          <EmptyState title={hasFilters ? 'No activity matches these filters.' : 'No activity yet.'} compact />
        ) : null}
      </SimpleGrid>

      {!loading && !error && pageCount > 1 && (
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
