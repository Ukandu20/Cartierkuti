import React from 'react'
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { SectionLabel, SurfaceCard } from '@/components/ui/DesignSystem'

export default function Error404() {
  return (
    <Box as="main" bg="bg.canvas" px={{ base: 5, md: 10 }} py={{ base: 16, md: 24 }}>
      <SurfaceCard maxW="3xl" mx="auto" p={{ base: 7, md: 12 }} textAlign="center">
        <Stack align="center" gap={5}>
          <SectionLabel number="404">Page not found</SectionLabel>
          <Heading as="h1" fontSize={{ base: '4xl', md: '6xl' }} lineHeight="1.08">This page has left the dataset.</Heading>
          <Text color="fg.muted" fontSize="lg" maxW="xl">
            The address may have changed, or the page may no longer exist. Return home or continue browsing the portfolio.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} gap={3} pt={2} w={{ base: 'full', sm: 'auto' }}>
            <Button asChild colorPalette="brand" size="lg"><Link to="/">Return home</Link></Button>
            <Button asChild colorPalette="brand" variant="outline" size="lg"><Link to="/portfolio">View portfolio</Link></Button>
          </Stack>
        </Stack>
      </SurfaceCard>
    </Box>
  )
}
