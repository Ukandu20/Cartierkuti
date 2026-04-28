import React from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi'
import { useColorMode } from '../../components/Theme/color-mode'


// Map activity types to icons
const iconMap = {
  Created: HiPlus,
  Updated: HiPencil,
  Deleted: HiTrash,
}

export default function ActivityCard({ type, title, timestamp, detail }) {
  const { colorMode } = useColorMode()
  const bgColor = colorMode === 'light' ? 'white' : 'gray.700'
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.600'
  const IconComp = iconMap[type] || HiEye

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
    >
      {/* Header: icon, type, timestamp */}
      <Flex justify="space-between" align="center" mb={2}>
        <Flex align="center">
          <IconComp style={{ marginRight: 8 }} />
          <Text fontWeight="bold">{type}</Text>
        </Flex>
        <Text fontSize="sm" color="gray.500">{timestamp}</Text>
      </Flex>

      {/* Title and optional detail */}
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" fontWeight="semibold" mb={detail ? 2 : 0} align="center">{title}</Text>
        {detail && (
            <Text fontSize="sm" color="gray.600" align="center">
            {detail}
            </Text>
        )}
      </Flex>
    </Box>
  )
}
