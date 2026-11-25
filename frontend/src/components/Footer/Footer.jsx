'use client'

import React from 'react'
import {
  Box,
  Button,
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
import { FaDownload, FaGithub, FaLinkedinIn, FaXTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaBehance, FaDribbble, FaPinterest, FaBluesky, FaThreads, FaDiscord, FaReddit, FaTwitch, FaMedium, FaLink } from 'react-icons/fa6'
import { useResumeDownload } from '@/hooks/useResumeDownload'
import { useFooterContent } from '@/hooks/useFooterContent'

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
]

const socialIcons = { linkedin: FaLinkedinIn, x: FaXTwitter, twitter: FaXTwitter, github: FaGithub, instagram: FaInstagram, youtube: FaYoutube, tiktok: FaTiktok, facebook: FaFacebook, behance: FaBehance, dribbble: FaDribbble, pinterest: FaPinterest, bluesky: FaBluesky, threads: FaThreads, discord: FaDiscord, reddit: FaReddit, twitch: FaTwitch, medium: FaMedium }
const isWebUrl = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }

const FooterLink = ({ children, ...props }) => (
  <ChakraLink
    color="fg.muted"
    fontFamily={'body'}
    fontWeight="600"
    width="fit-content"
    _hover={{ color: 'accent.default', textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'accent.default', outlineOffset: '3px' }}
    {...props}
  >
    {children}
  </ChakraLink>
)

export default function Footer() {
  const resumeDownload = useResumeDownload()
  const content = useFooterContent()

  return <FooterView content={content} resumeDownload={resumeDownload} />
}

export function FooterView({ content, resumeDownload }) {
  return (
    <Box as="footer" bg={'bg.raised'} color={'fg.default'} borderTop="1px solid" borderColor={'border.subtle'} px={{ base: 6, md: 10 }}>
      <Box maxW="7xl" mx="auto" py={{ base: 12, md: 16 }}>
        <SimpleGrid templateColumns={{ base: 'minmax(0, 2fr) minmax(0, 3fr)', lg: 'repeat(12, minmax(0, 1fr))' }} gap={{ base: 7, md: 10, lg: 12 }}>
          <Stack gridColumn={{ base: 'span 2', lg: 'span 6' }} gap={4} maxW="560px">
            <Text fontFamily={'mono'} fontSize="xs" color={'accent.default'} textTransform="uppercase" letterSpacing="0.18em">
              {content.eyebrow}
            </Text>
            <Heading as="h2" fontFamily={'heading'} fontSize={{ base: '3xl', md: '4xl' }} fontWeight="500" lineHeight="1.2">
              {content.title}
            </Heading>
            <Text color={'fg.muted'} fontSize="lg" lineHeight="1.75">
              {content.description}
            </Text>
            <Button asChild colorPalette="brand" alignSelf="flex-start">
              <RouterLink to="/contact">Start a conversation</RouterLink>
            </Button>
          </Stack>

          <Stack gridColumn={{ lg: 'span 2' }} gap={4} minW={0}>
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

          <Stack gridColumn={{ lg: 'span 4' }} gap={4} minW={0}>
            <Text fontFamily={'mono'} fontSize="xs" color={'fg.muted'} textTransform="uppercase" letterSpacing="0.14em">
              Connect
            </Text>
            <FooterLink href={`mailto:${content.email}`} overflowWrap="anywhere">{content.email}</FooterLink>
            <HStack gap={2} pt={1} flexWrap="wrap">
              {content.socialLinks.filter(({ label, url }) => label.trim() && isWebUrl(url)).map(({ label, url }, index) => (
                <ChakraLink
                  key={`${label}-${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="44px"
                  border="1px solid"
                  borderColor={'border.subtle'}
                  borderRadius="full"
                  color={'fg.muted'}
                  _hover={{ color: 'accent.default', borderColor: 'accent.default' }}
                  _focusVisible={{ outline: '2px solid', outlineColor: 'accent.default', outlineOffset: '3px' }}
                >
                  <Icon as={socialIcons[label.trim().toLowerCase()] || FaLink} boxSize={5} aria-hidden="true" />
                </ChakraLink>
              ))}
            </HStack>
          </Stack>
        </SimpleGrid>

        <Separator borderColor={'border.subtle'} my={{ base: 10, md: 12 }} />

        <Flex color={'fg.muted'} fontFamily={'mono'} fontSize="xs">
          <Text>&copy; {new Date().getFullYear()} Preston Ukandu. All rights reserved.</Text>
        </Flex>
      </Box>
    </Box>
  )
}
