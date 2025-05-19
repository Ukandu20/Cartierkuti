// src/components/Navbar/index.jsx
'use client'

import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Flex,
  HStack,
  Link as ChakraLink,
  Image,
  Button,
  Icon,
  Spacer,
} from '@chakra-ui/react'
import { FaDownload } from 'react-icons/fa'
import ThemeToggle      from '../Theme/ThemeToggle'
import { useColorMode } from '../Theme/color-mode'
import logo from './CARTIERKUTI.svg'

const navLinks = [
  { href: '/',          label: 'Home'      },
  { href: '/about',     label: 'About'     },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog',      label: 'Blog'      },
  { href: '/contact',   label: 'Contact'   },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { colorMode } = useColorMode()

  const linkColor   = colorMode === 'light' ? '#1D242D' : '#FFFFFF'
  const activeStyle = { fontWeight: 'bold', color: 'brand.600' }

  return (
    <Flex
      as="header"
      h="90px"
      px={{ base: 4, md: 8 }}
      align="center"
      /* 💡 let the main flex decide spacing automatically */
      gap={6}
      position="sticky"
      top="0"
      bg={colorMode === 'light' ? 'white' : '#1D242D'}
      zIndex="banner"
    >
      {/* logo ====================================================== */}
      <ChakraLink
        as={RouterLink}
        to="/"
        aria-label="Go to home page"
        _hover={{ textDecor: 'none' }}
      >
        <Image src={logo} alt="Preston logo" h={{ base: '50px', md: '70px' }} />
      </ChakraLink>

      {/* centre links ============================================= */}
      {/* Spacer pushes this group away from the logo */}
      <Spacer />

      <HStack
        as="nav"
        /* this now **must** fill the available width */
        flex="1"
        justify="space-evenly"
        /* visually obvious gap so you’ll notice the change */
        spacing={{ base: 8, md: 14 }}
        fontSize={{ base: 'sm', md: 'md' }}
      >
        {navLinks.map(({ href, label }) => (
          <ChakraLink
            key={href}
            as={RouterLink}
            to={href}
            aria-label={`Navigate to ${label}`}
            {...(pathname === href ? activeStyle : { color: linkColor })}
            _hover={{ color: 'brand.500' }}
          >
            {label}
          </ChakraLink>
        ))}
      </HStack>

      {/* right-hand tools ========================================= */}
      <Button
        as="a"
        href="/resume.pdf"
        download
        px={2}
        variant="solid"
        colorScheme="teal"
        aria-label="Download résumé (PDF)"
      >
        <Icon as={FaDownload} boxSize={4} mr={2} aria-hidden="true" />
        Resume
      </Button>

      <ThemeToggle aria-label="Toggle light or dark mode" />
    </Flex>
  )
}
