import React from 'react'
import { Box, Button, ButtonGroup, Flex, Heading, Text } from '@chakra-ui/react'
import { HiChartBar, HiCog, HiDocumentText, HiFolder, HiLogout, HiPlus } from 'react-icons/hi'
import { SurfaceCard } from '@/components/ui/DesignSystem'

export default function AdminOverviewHeader({ dialogBg, dialogBorder, onOpenCreate, onOpenCategories, onOpenAnalytics, onOpenAbout, onOpenSecurity, onLogout }) {
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
          <Button variant="outline" onClick={onOpenCategories}>
            <HiFolder /> Categories
          </Button>
          <Button variant="outline" onClick={onOpenAbout}>
            <HiDocumentText /> Edit About
          </Button>
          <Button variant="outline" onClick={onOpenSecurity}>
            <HiCog /> Security
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
