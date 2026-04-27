import React from 'react'
import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'

const StatCard = ({ label, value, desc, icon: IconComp, onClick, disabled, extra }) => {
  const accent = 'brand.600'
  const border = 'border.subtle'
  const idleTxt = 'fg.muted'

  return (
    <Box
      p={5}
      bg="bg.surface"
      boxShadow="sm"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={border}
      _hover={{
        boxShadow: !disabled ? 'md' : undefined,
        cursor: !disabled ? 'pointer' : undefined,
      }}
      onClick={!disabled ? onClick : undefined}
      opacity={disabled ? 0.6 : 1}
    >
      <Flex align="center" justify="space-between" mb={3}>
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
      <Text fontSize="3xl" fontWeight="bold" color={accent}>{value}</Text>
      {extra && (
        <Text mt={1} fontSize="xs" color={idleTxt} opacity={0.75}>
          {extra}
        </Text>
      )}
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
      bg="bg.surface"
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      boxShadow="sm"
      role="button"
      _hover={{
        borderColor: accent,
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.15s ease"
      onClick={!disabled ? onClick : undefined}
      opacity={disabled ? 0.6 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
    >
      <Flex align="center" justify="space-between">
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
      {value !== '' && value != null && (
        <Text mt={3} fontSize="xs" color={idleTxt} letterSpacing="0.08em" textTransform="uppercase">
          {value} total
        </Text>
      )}
    </Box>
  )
}

export default function DashboardStats({ statCards }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spaceX={4} spaceY={4}>
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </SimpleGrid>
  )
}
