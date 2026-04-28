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
import { FaLinkedin, FaGithub, FaBehance } from 'react-icons/fa'

/**
 * Contact section – Chakra UI v3
 * Uses design tokens + responsive props instead of inline styles.
 */
export default function Contact() {
  // Responsive tweak: larger button on desktop, smaller on mobile
  const btnSize = useBreakpointValue({ base: 'md', md: 'lg' })

  /* design tokens */
  const accent = 'brand.500'
  const accentHover = 'brand.600'

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
        color="fg.muted"
        mb={8}
      >
        I&#39;m always open to discussing exciting ideas, collaborations, or new
        opportunities.
      </Text>

      <Button
        asChild
        size={btnSize}
        colorPalette="teal"
        fontWeight="semibold"
      >
        <a href="mailto:cartierkuti@gmail.com">Say Hello</a>
      </Button>

      <Text
        mt={6}
        fontSize="sm"
        color="fg.muted"
      >
        or email me directly at{' '}
        <Link href="mailto:cartierkuti@gmail.com" color={accent} fontWeight="medium">
          cartierkuti@gmail.com
        </Link>
      </Text>

      <HStack mt={10} gap={8} justify="center">
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
