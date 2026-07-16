import React from 'react'
import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'

const handleActionKey = (event, action, disabled) => {
  if (disabled || !action || !['Enter', ' '].includes(event.key)) return
  event.preventDefault()
  action()
}

const StatCard = ({ label, value, desc, icon: IconComp, onClick, disabled, extra }) => {
  const accent = 'brand.600'
  const border = 'border.subtle'
  const idleTxt = 'fg.muted'

  return (
    <Box
      p={5}
      h="full"
      minH="172px"
      display="flex"
      flexDirection="column"
      bg="bg.surface"
      boxShadow="sm"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={border}
      _hover={{
        boxShadow: !disabled ? 'md' : undefined,
        cursor: !disabled ? 'pointer' : undefined,
      }}
      _focusVisible={{ outline: '2px solid', outlineColor: accent, outlineOffset: '3px' }}
      role={onClick ? 'button' : undefined}
      tabIndex={!disabled && onClick ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={(event) => handleActionKey(event, onClick, disabled)}
      opacity={disabled ? 0.6 : 1}
    >
      <Flex align="flex-start" justify="space-between" mb={3} gap={4}>
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={1}>{label}</Text>
          <Text fontSize="xs" color={idleTxt} opacity={0.7}>{desc}</Text>
        </Box>
        <Box
          display="grid"
          placeItems="center"
          boxSize="40px"
          borderRadius="md"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor={border}
        >
          <IconComp size="1.2rem" color={accent} />
        </Box>
      </Flex>
      <Box mt="auto">
        <Text fontSize="3xl" fontWeight="bold" color={accent}>{value}</Text>
        <Text mt={1} minH="18px" fontSize="xs" color={idleTxt} opacity={0.75}>
          {extra || ''}
        </Text>
      </Box>
    </Box>
  )
}

export const ActionCard = ({ label, value, desc, icon: IconComp, onClick, disabled }) => {
  const accent = 'brand.600'
  const border = 'border.subtle'
  const idleTxt = 'fg.muted'

  return (
    <Box
      p={5}
      h="full"
      minH="124px"
      display="flex"
      flexDirection="column"
      bg="bg.surface"
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      boxShadow="sm"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      _hover={{
        borderColor: accent,
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.15s ease"
      _focusVisible={{ outline: '2px solid', outlineColor: accent, outlineOffset: '3px' }}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={(event) => handleActionKey(event, onClick, disabled)}
      opacity={disabled ? 0.6 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
    >
      <Flex align="flex-start" justify="space-between" gap={4}>
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={1}>{label}</Text>
          <Text fontSize="sm" color={idleTxt}>{desc}</Text>
        </Box>
        <Box
          display="grid"
          placeItems="center"
          boxSize="40px"
          borderRadius="md"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor={border}
        >
          <IconComp size="1.25rem" color={accent} />
        </Box>
      </Flex>
      <Text mt="auto" pt={3} minH="28px" fontSize="xs" color={idleTxt} letterSpacing="0.08em" textTransform="uppercase">
        {value !== '' && value != null ? `${value} total` : ''}
      </Text>
    </Box>
  )
}

export default function DashboardStats({ statCards }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </SimpleGrid>
  )
}
