'use client'

import React, { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link as ChakraLink,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaBars, FaDownload } from 'react-icons/fa'
import ThemeToggle from '../Theme/ThemeToggle'
import logo from './CARTIERKUTI.svg'
import { useResumeDownload } from '@/hooks/useResumeDownload'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
]

const isCurrentRoute = (pathname, href) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

export default function Navbar() {
  const { pathname } = useLocation()
  const resumeDownload = useResumeDownload()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <ChakraLink
        href="#main-content"
        position="fixed"
        top="-60px"
        left={4}
        zIndex="tooltip"
        bg={'accent.default'}
        color="brand.contrast"
        px={4}
        py={2}
        fontWeight="700"
        _focus={{ top: 3 }}
      >
        Skip to content
      </ChakraLink>

      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="banner"
        bg="bg.navigation"
        backdropFilter="blur(14px)"
        borderBottom="1px solid"
        borderColor={'border.subtle'}
      >
        <Flex maxW="7xl" h={{ base: '64px', md: '72px' }} mx="auto" px={{ base: 4, md: 10 }} align="center" gap={6}>
          <ChakraLink
            asChild
            aria-label="Preston Ukandu home"
            flexShrink="0"
            _hover={{ textDecoration: 'none' }}
            _focusVisible={{ outline: 'none' }}
          >
            <RouterLink to="/">
              <Box
                position="relative"
                w={{ base: '132px', md: '160px' }}
                h={{ base: '52px', md: '62px' }}
                overflow="hidden"
                aria-hidden="true"
              >
                <Image
                  src={logo}
                  alt=""
                  position="absolute"
                  top="50%"
                  left="0"
                  w={{ base: '132px', md: '160px' }}
                  h={{ base: '132px', md: '160px' }}
                  objectFit="contain"
                  transform="translateY(-50%)"
                  aria-hidden="true"
                />
              </Box>
            </RouterLink>
          </ChakraLink>

          <HStack as="nav" aria-label="Primary navigation" display={{ base: 'none', md: 'flex' }} ml="auto" gap={{ md: 5, lg: 8 }}>
            {navLinks.map(({ href, label }) => {
              const current = isCurrentRoute(pathname, href)
              return (
                <ChakraLink
                  key={href}
                  asChild
                  position="relative"
                  py={2}
                  color={current ? 'fg.default' : 'fg.muted'}
                  fontFamily={'body'}
                  fontWeight={current ? '700' : '600'}
                  aria-current={current ? 'page' : undefined}
                  css={{
                    '&:focus, &:focus-visible': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                    },
                  }}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    right: current ? 0 : '100%',
                    bottom: 0,
                    h: '2px',
                    bg: 'accent.default',
                    transition: 'right 0.2s ease',
                  }}
                  _hover={{ color: 'fg.default', textDecoration: 'none', _after: { right: 0 } }}
                  _focusVisible={{
                    outline: 'none',
                    color: 'fg.default',
                    _after: { right: 0 },
                  }}
                >
                  <RouterLink to={href}>{label}</RouterLink>
                </ChakraLink>
              )
            })}
          </HStack>

          <HStack display={{ base: 'none', md: 'flex' }} gap={1}>
            <Button asChild size="sm" colorPalette="brand" fontWeight="700">
              <a href={resumeDownload.url} download={resumeDownload.filename}>
                <Icon as={FaDownload} aria-hidden="true" />
                Résumé
              </a>
            </Button>
            <ThemeToggle aria-label="Toggle light or dark mode" color={'fg.muted'} />
          </HStack>

          <HStack display={{ base: 'flex', md: 'none' }} ml="auto" gap={1}>
            <ThemeToggle aria-label="Toggle light or dark mode" color={'fg.muted'} />
            <Drawer.Root open={menuOpen} onOpenChange={(details) => setMenuOpen(details.open)} placement="end" size="xs">
              <Drawer.Trigger asChild>
                <IconButton aria-label="Open navigation menu" variant="ghost" color={'fg.default'}>
                  <FaBars />
                </IconButton>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <Drawer.Content bg={'bg.surface'} color={'fg.default'} borderLeft="1px solid" borderColor={'border.subtle'}>
                    <Drawer.Header borderBottom="1px solid" borderColor={'border.subtle'} py={5}>
                      <Stack gap={1}>
                        <Drawer.Title fontFamily={'heading'} fontSize="2xl">Navigation</Drawer.Title>
                        <Text color={'fg.muted'} fontSize="sm">Explore the work and get in touch.</Text>
                      </Stack>
                      <Drawer.CloseTrigger asChild>
                        <CloseButton aria-label="Close navigation menu" position="absolute" top={5} right={5} />
                      </Drawer.CloseTrigger>
                    </Drawer.Header>
                    <Drawer.Body py={6}>
                      <Stack as="nav" aria-label="Mobile navigation" gap={0}>
                        {navLinks.map(({ href, label }, index) => {
                          const current = isCurrentRoute(pathname, href)
                          return (
                            <ChakraLink
                              key={href}
                              asChild
                              py={4}
                              borderTop={index ? '0' : '1px solid'}
                              borderBottom="1px solid"
                              borderColor={'border.subtle'}
                              color={current ? 'accent.default' : 'fg.default'}
                              fontFamily={'heading'}
                              fontSize="2xl"
                              fontWeight="600"
                              aria-current={current ? 'page' : undefined}
                              _hover={{ color: 'accent.default', textDecoration: 'none' }}
                            >
                              <RouterLink to={href} onClick={() => setMenuOpen(false)}>{label}</RouterLink>
                            </ChakraLink>
                          )
                        })}
                      </Stack>
                    </Drawer.Body>
                    <Drawer.Footer borderTop="1px solid" borderColor={'border.subtle'}>
                      <Button asChild w="full" colorPalette="brand">
                        <a href={resumeDownload.url} download={resumeDownload.filename}>
                          <FaDownload /> Download résumé
                        </a>
                      </Button>
                    </Drawer.Footer>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </HStack>
        </Flex>
      </Box>
    </>
  )
}
