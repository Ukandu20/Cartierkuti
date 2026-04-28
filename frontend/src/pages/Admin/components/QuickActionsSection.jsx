import React from 'react'
import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import { ActionCard } from './DashboardStats'

export default function QuickActionsSection({ quickActions, projectsCount, dialogBg, dialogBorder }) {
  return (
    <Box p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
      <Heading size="md" mb={4}>Quick Actions</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} alignItems="stretch">
        {quickActions.map((action, index) => (
          <Box
            key={action.label}
            gridColumn={{
              base: 'auto',
              sm: quickActions.length % 2 === 1 && index === quickActions.length - 1 ? '1 / -1' : 'auto',
            }}
          >
            <ActionCard
              {...action}
              disabled={!projectsCount && !['Add Project', 'Edit Resume'].includes(action.label)}
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}
