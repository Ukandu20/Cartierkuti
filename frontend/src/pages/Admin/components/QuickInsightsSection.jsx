import React from 'react'
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'

export default function QuickInsightsSection({ counts, dialogBg, dialogBorder }) {
  return (
    <Box p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
      <Heading size="md" mb={4}>Quick Insights</Heading>
      <Stack gap={3}>
        <Flex justify="space-between"><Text>Started</Text><Text fontWeight="bold">{counts.started}</Text></Flex>
        <Flex justify="space-between"><Text>Finished</Text><Text fontWeight="bold">{counts.finished}</Text></Flex>
        <Flex justify="space-between"><Text>Total</Text><Text fontWeight="bold">{counts.total}</Text></Flex>
      </Stack>
    </Box>
  )
}
