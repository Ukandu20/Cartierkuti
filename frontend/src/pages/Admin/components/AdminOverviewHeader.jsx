import React from 'react'
import { Box, Button, ButtonGroup, Flex, Heading, Text } from '@chakra-ui/react'
import { HiChartBar, HiDocumentText, HiLogout, HiPlus } from 'react-icons/hi'
import { SurfaceCard } from '@/components/ui/DesignSystem'

export default function AdminOverviewHeader({ dialogBg, dialogBorder, onOpenCreate, onOpenAnalytics, onOpenAbout, onLogout }) {
  return (
    <SurfaceCard mb={6} p={{ base: 4, md: 5 }} bg={dialogBg} borderColor={dialogBorder}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Box>
          <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="fg.muted">Admin Overview</Text>
          <Heading size="lg">Portfolio workspace</Heading>
          <Text mt={1} color="fg.muted">Manage projects, content, and performance in one place.</Text>
        </Box>
        <ButtonGroup gap={3} flexWrap="wrap">
          <Button colorPalette="brand" onClick={onOpenCreate}>
            <HiPlus />
            New Project
          </Button>
          <Button variant="outline" colorPalette="brand" onClick={onOpenAnalytics}>
            <HiChartBar /> Analytics
          </Button>
          <Button variant="outline" onClick={onOpenAbout}>
            <HiDocumentText /> Edit About
          </Button>
          <Button variant="ghost" colorPalette="red" onClick={onLogout}>
            <HiLogout />
            Log out
          </Button>
        </ButtonGroup>
      </Flex>
    </SurfaceCard>
  )
}
