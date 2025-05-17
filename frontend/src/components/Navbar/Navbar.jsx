// src/components/Navbar/Navbar.jsx
'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Flex,
  HStack,
  Box,
  Link as ChakraLink,
  Image,
  Button,
} from '@chakra-ui/react'
import ThemeToggle from '../Theme/ThemeToggle'
import { useColorMode } from '..//Theme/color-mode'
import logo from './CARTIERKUTI.svg'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const Navbar = () => {
  const { pathname } = useLocation()
  const { colorMode } = useColorMode()
  // pick colors from your design tokens or hard-code
  const linkColor = colorMode === 'light' ? '#1D242D' : '#FFFFFF'

  const downloadResume = () => {
    const a = document.createElement('a')
    a.href = 'resume.pdf'
    a.target = '_blank'
    a.download = 'resume.pdf'
    a.click()
  }

  return (
    <Flex
      as="header"
      h="90px"
      px={{ base: 4, md: 8 }}
      align="center"
      justify="space-between"
      position="relative"
      zIndex="banner"
    >
      <ChakraLink
        as={RouterLink}
        to="/"
        _hover={{ textDecor: 'none' }}
      >
        <Image
          src={logo}
          alt="logo"
          h={{ base: '60px', md: '80px' }}
        />
      </ChakraLink>

      <Box mx={{ base: 2, md: 6 }}>
        <ThemeToggle />
      </Box>

      <HStack as="nav" spacing={{ base: 4, md: 8 }}>
        {links.map(({ href, label }) => (
          <ChakraLink
            key={href}
            as={RouterLink}
            to={href}
            fontWeight={pathname === href ? 'bold' : 'medium'}
            color={pathname === href ? 'brand.500' : linkColor}
            _hover={{ color: 'brand.500' }}
          >
            {label}
          </ChakraLink>
        ))}

        <Button
          size="sm"
          leftIcon={<FontAwesomeIcon icon={faDownload} />}
          bg="brand.500"
          px={3}
          _hover={{ bg: 'brand.600' }}
          color="black"
          onClick={downloadResume}
        >
          Resume
        </Button>
      </HStack>
    </Flex>
  )
}

export default Navbar
