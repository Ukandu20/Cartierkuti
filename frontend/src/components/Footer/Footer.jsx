'use client'

import React from 'react'
import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Link,
  Separator,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaArrowRight, FaBehance, FaGithub, FaLinkedinIn } from 'react-icons/fa'

/**
 * Footer - shared collaboration CTA and socials.
 */
export default function Footer() {
  const bg = 'bg.subtle'
  const txt = 'fg.muted'
  const accent = 'brand.500'
  const accentHover = 'brand.600'
  const btnSize = useBreakpointValue({ base: 'md', md: 'lg' })

  return (
    <Box as="footer" bg={bg} px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }}>
      <Stack
        gap={{ base: 8, md: 10 }}
        maxW="5xl"
        mx="auto"
        align="center"
        textAlign="center"
      >
        <Stack gap={4} align="center">
          <Text
            fontSize="xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color={txt}
          >
            Collaboration
          </Text>
          <Heading size={{ base: '2xl', md: '3xl' }}>
            Let&apos;s turn data into sharper decisions.
          </Heading>
          <Text maxW="2xl" mx="auto" fontSize={{ base: 'md', md: 'lg' }} color={txt}>
            Open to data analytics, dashboarding, data science, and sports analytics collaborations.
          </Text>
          <Button
            asChild
            size={btnSize}
            colorPalette="teal"
            fontWeight="semibold"
          >
            <RouterLink to="/contact">
              Say Hello
              <Icon as={FaArrowRight} aria-hidden="true" />
            </RouterLink>
          </Button>
        </Stack>

        <Stack gap={5} align="center">
          <Text fontSize="sm" color={txt}>
            or email me directly at{' '}
            <Link href="mailto:okechiukandu@gmail.com" color={accent} fontWeight="medium">
              okechiukandu@gmail.com
            </Link>
          </Text>

          <HStack gap={8} justify="center">
            <Link
              href="https://linkedin.com/in/okechiukandu"
              isExternal
              aria-label="LinkedIn"
              target="_blank"
            >
              <Icon as={FaLinkedinIn} boxSize={6} color={accent} _hover={{ color: accentHover }} />
            </Link>
            <Link href="https://github.com/okechiukandu" target="_blank" isExternal aria-label="GitHub">
              <Icon as={FaGithub} boxSize={6} color={accent} _hover={{ color: accentHover }} />
            </Link>
            <Link href="https://behance.net/okechiukandu" target="_blank" isExternal aria-label="Behance">
              <Icon as={FaBehance} boxSize={6} color={accent} _hover={{ color: accentHover }} />
            </Link>
          </HStack>
        </Stack>

        <Separator borderColor="border.muted" />
        <Text fontSize="xs" color={txt} textAlign="center" w="full">
          &copy; {new Date().getFullYear()} Okechi Ukandu. All rights reserved.
        </Text>
      </Stack>
    </Box>
  )
}
