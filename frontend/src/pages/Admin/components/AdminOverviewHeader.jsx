import React from 'react'
import { Box, Button, ButtonGroup, Flex, Heading, Text } from '@chakra-ui/react'
import { HiLogout, HiPlus } from 'react-icons/hi'

export default function AdminOverviewHeader({ dialogBg, dialogBorder, onOpenCreate, onOpenAnalytics, onLogout }) {
  return (
    <Box mb={6} p={{ base: 4, md: 5 }} bg={dialogBg} borderWidth="1px" borderColor={dialogBorder} borderRadius="lg" shadow="sm">
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Box>
          <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="fg.muted">Admin Overview</Text>
          <Heading size="lg">Welcome Back!</Heading>
          <Text mt={1} color="fg.muted">Here's what's happening with your projects</Text>
        </Box>
        <ButtonGroup gap={3} flexWrap="wrap">
          <Button colorPalette="teal" onClick={onOpenCreate}>
            <HiPlus />
            New Project
          </Button>
          <Button variant="outline" colorPalette="teal" onClick={onOpenAnalytics}>View Analytics</Button>
          <Button variant="ghost" colorPalette="red" onClick={onLogout}>
            <HiLogout />
            Log out
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  )
}
