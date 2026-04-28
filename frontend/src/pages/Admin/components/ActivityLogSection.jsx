import React from 'react'
import { Box, Button, ButtonGroup, Flex, Heading, Input, NativeSelect, SimpleGrid, Text } from '@chakra-ui/react'
import PaginationControls from '@/components/pagination/pagination'
import { EmptyState } from '@/components/ui/StateFeedback'
import { niceDate } from '@/utils/formatDate'
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
  return (
    <Box p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm" h="full">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Activity Log</Heading>
        <Text fontSize="xs" color="fg.muted">{totalActivities} events</Text>
      </Flex>
      <Flex mb={4} py={2} gap={3} align="center" wrap="wrap">
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="All"
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            bg={bg}
            px={2}
            borderRadius={4}
            height={10}
            minW={{ base: '100%', md: '160px' }}
          >
            {['Created', 'Updated', 'Deleted'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Input type="date" value={filterStart} onChange={(event) => setFilterStart(event.target.value)} bg={bg} px={3} borderRadius={4} height={10} minW={{ base: '100%', md: '170px' }} />
        <Input type="date" value={filterEnd} onChange={(event) => setFilterEnd(event.target.value)} bg={bg} px={3} borderRadius={4} height={10} minW={{ base: '100%', md: '170px' }} />
        <ButtonGroup size="sm" gap={3} w={{ base: '100%', md: 'auto' }}>
          <Button size="sm" colorPalette="teal" onClick={() => { setPage(1); fetchActivities() }}>Apply</Button>
          <Button size="sm" variant="outline" colorPalette="teal" onClick={clearFilters}>Clear</Button>
        </ButtonGroup>
      </Flex>
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
          <EmptyState title="No activity yet." />
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
    </Box>
  )
}
