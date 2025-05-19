'use client'

import React from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Link,
  HStack,
  Icon,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useColorMode as useThemeColorMode } from '@/components/Theme/color-mode'
import { FaLinkedin, FaGithub, FaBehance } from 'react-icons/fa'

/**
 * Contact section – Chakra UI v3
 * Uses design tokens + responsive props instead of inline styles.
 */
export default function Contact() {
  const { colorMode } = useThemeColorMode()

  // Responsive tweak: larger button on desktop, smaller on mobile
  const btnSize = useBreakpointValue({ base: 'md', md: 'lg' })

  /* design tokens */
  const accent = 'brand.500'
  const accentHover = colorMode === 'light' ? 'brand.600' : 'brand.300'

  return (
    <Box
      as="section"
      id="contact"
      py={{ base: 14, md: 20 }}
      px={4}
      textAlign="center"
    >
      <Heading size="2xl" mb={4}>
        Interested in Working Together?
      </Heading>

      <Text
        maxW="2xl"
        mx="auto"
        fontSize="lg"
        color="gray.600"
        _dark={{ color: 'gray.300' }}
        mb={8}
      >
        I&#39;m always open to discussing exciting ideas, collaborations, or new
        opportunities.
      </Text>

      <Button
        as={Link}
        href="mailto:cartierkuti@gmail.com"
        size={btnSize}
        bg={accent}
        _hover={{ bg: accentHover }}
        color="white"
        px={8}
        rounded="full"
        boxShadow="md"
        fontWeight="semibold"
      >
        Say Hello
      </Button>

      <Text
        mt={6}
        fontSize="sm"
        color="gray.600"
        _dark={{ color: 'gray.400' }}
      >
        or email me directly at{' '}
        <Link href="mailto:cartierkuti@gmail.com" color={accent} fontWeight="medium">
          cartierkuti@gmail.com
        </Link>
      </Text>

      <HStack mt={10} spacing={8} justify="center">
        <Link
          href="https://linkedin.com/in/YOUR-HANDLE"
          isExternal
          aria-label="LinkedIn"
        >
          <Icon as={FaLinkedin} boxSize={6} color={accent} _hover={{ color: accentHover }} />
        </Link>
        <Link href="https://github.com/YOUR-HANDLE" isExternal aria-label="GitHub">
          <Icon as={FaGithub} boxSize={6} color={accent} _hover={{ color: accentHover }} />
        </Link>
        <Link href="https://behance.net/YOUR-HANDLE" isExternal aria-label="Behance">
          <Icon as={FaBehance} boxSize={6} color={accent} _hover={{ color: accentHover }} />
        </Link>
      </HStack>
    </Box>
  )
}
