import React from 'react'
import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'

export function SectionLabel({ number, children, ...props }) {
  return (
    <Text
      fontFamily="mono"
      fontSize="xs"
      fontWeight="500"
      letterSpacing="0.18em"
      textTransform="uppercase"
      color="accent.default"
      {...props}
    >
      {number ? `${number} / ` : ''}{children}
    </Text>
  )
}

export function SurfaceCard({ interactive = false, children, ...props }) {
  return (
    <Box
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="lg"
      boxShadow="sm"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      {...(interactive ? {
        _hover: { transform: 'translateY(-2px)', boxShadow: 'md', borderColor: 'brand.border' },
        _focusWithin: { borderColor: 'brand.focusRing' },
      } : {})}
      _motionReduce={{ transition: 'none', transform: 'none' }}
      {...props}
    >
      {children}
    </Box>
  )
}

export function PageCta({ eyebrow, title, description, headingId, children }) {
  return (
    <Box as="section" aria-labelledby={headingId} px={{ base: 5, md: 10 }} pb={{ base: 16, md: 24 }}>
      <Flex
        maxW="7xl"
        mx="auto"
        bg="accent.subtle"
        color="fg.default"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="lg"
        px={{ base: 6, md: 12 }}
        py={{ base: 10, md: 14 }}
        align={{ base: 'flex-start', lg: 'center' }}
        justify="space-between"
        direction={{ base: 'column', lg: 'row' }}
        gap={8}
      >
        <Stack gap={4} maxW="760px">
          <SectionLabel>{eyebrow}</SectionLabel>
          <Heading
            as="h2"
            id={headingId}
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="500"
            letterSpacing="-0.025em"
            lineHeight={{ base: '1.25', md: '1.16' }}
            overflowWrap="break-word"
          >
            {title}
          </Heading>
          <Text color="fg.muted" fontSize="lg">{description}</Text>
        </Stack>
        <Button asChild size="lg" colorPalette="brand" flexShrink={0} w={{ base: 'full', sm: 'auto' }}>
          {children}
        </Button>
      </Flex>
    </Box>
  )
}

export const surfaceStyles = {
  bg: 'bg.surface',
  border: '1px solid',
  borderColor: 'border.subtle',
  borderRadius: 'lg',
  boxShadow: 'sm',
}

export const interactiveSurfaceStyles = {
  ...surfaceStyles,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  _hover: { transform: 'translateY(-2px)', boxShadow: 'md', borderColor: 'brand.border' },
  _focusWithin: { borderColor: 'brand.focusRing' },
  _motionReduce: { transition: 'none', transform: 'none' },
}

export const fieldStyles = {
  bg: 'bg.surface',
  borderColor: 'border.subtle',
  borderRadius: 'md',
  _focusVisible: {
    borderColor: 'brand.focusRing',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-focus-ring)',
  },
}

export const dialogContentStyles = {
  bg: 'bg.surface',
  border: '1px solid',
  borderColor: 'border.subtle',
  borderRadius: 'lg',
  boxShadow: 'xl',
}

export const dialogHeaderStyles = {
  borderBottom: '1px solid',
  borderColor: 'border.subtle',
  px: { base: 4, md: 6 },
  py: 4,
}

export const dialogFooterStyles = {
  borderTop: '1px solid',
  borderColor: 'border.subtle',
  px: { base: 4, md: 6 },
  py: 4,
  display: 'flex',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: 3,
}
