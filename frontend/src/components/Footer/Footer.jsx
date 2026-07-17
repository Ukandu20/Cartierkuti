'use client'

import React from 'react'
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaDownload, FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { useResumeDownload } from '@/hooks/useResumeDownload'

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
]

const FooterLink = ({ children, ...props }) => (
  <ChakraLink
    color="fg.muted"
    fontFamily={'body'}
    fontWeight="600"
    width="fit-content"
    _hover={{ color: 'brand.500', textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
    {...props}
  >
    {children}
  </ChakraLink>
)

export default function Footer() {
  const resumeDownload = useResumeDownload()

  return (
    <Box as="footer" bg={'bg.raised'} color={'fg.default'} borderTop="1px solid" borderColor={'border.subtle'} px={{ base: 6, md: 10 }}>
      <Box maxW="7xl" mx="auto" py={{ base: 12, md: 16 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 12 }} gap={{ base: 10, lg: 12 }}>
          <Stack gridColumn={{ sm: 'span 2', lg: 'span 6' }} gap={4} maxW="560px">
            <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} textTransform="uppercase" letterSpacing="0.18em">
              Preston Ukandu
            </Text>
            <Heading as="h2" fontFamily={'heading'} fontSize={{ base: '3xl', md: '4xl' }} fontWeight="500" lineHeight="1.2">
              Data science that makes the next decision clearer.
            </Heading>
            <Text color={'fg.muted'} fontSize="lg" lineHeight="1.75">
              Building analytical models, dashboards, and sports-performance insights with an emphasis on useful evidence and clear communication.
            </Text>
          </Stack>

          <Stack gridColumn={{ lg: 'span 2' }} gap={4}>
            <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.14em">
              Explore
            </Text>
            <Stack as="nav" aria-label="Footer navigation" gap={3}>
              {footerLinks.map(({ href, label }) => (
                <FooterLink key={href} asChild>
                  <RouterLink to={href}>{label}</RouterLink>
                </FooterLink>
              ))}
              <FooterLink href={resumeDownload.url} download={resumeDownload.filename} display="inline-flex" alignItems="center" gap={2}>
                <Icon as={FaDownload} aria-hidden="true" /> Résumé
              </FooterLink>
            </Stack>
          </Stack>

          <Stack gridColumn={{ lg: 'span 4' }} gap={4}>
            <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.14em">
              Connect
            </Text>
            <FooterLink href="mailto:okechiukandu@gmail.com">okechiukandu@gmail.com</FooterLink>
            <Text color={'fg.muted'} maxW="320px">
              Open to thoughtful data science, dashboarding, and sports analytics collaborations.
            </Text>
            <HStack gap={3} pt={1}>
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com/in/okechiukandu', icon: FaLinkedinIn },
                { label: 'GitHub', href: 'https://github.com/okechiukandu', icon: FaGithub },
              ].map(({ label, href, icon }) => (
                <ChakraLink
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="42px"
                  border="1px solid"
                  borderColor={'border.subtle'}
                  borderRadius="full"
                  color={'fg.muted'}
                  _hover={{ color: 'accent.default', borderColor: 'accent.default' }}
                  _focusVisible={{ outline: '2px solid', outlineColor: 'accent.default', outlineOffset: '3px' }}
                >
                  <Icon as={icon} boxSize={5} aria-hidden="true" />
                </ChakraLink>
              ))}
            </HStack>
          </Stack>
        </SimpleGrid>

        <Separator borderColor={'border.subtle'} my={{ base: 10, md: 12 }} />

        <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" gap={3} color={'fg.muted'} fontFamily={'mono'} fontSize="xs">
          <Text>&copy; {new Date().getFullYear()} Preston Ukandu. All rights reserved.</Text>
          <Text>Data science · Sports analytics · Decision intelligence</Text>
        </Flex>
      </Box>
    </Box>
  )
}
