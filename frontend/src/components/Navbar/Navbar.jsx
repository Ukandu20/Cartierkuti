'use client'

import React from 'react'
import { FaDownload } from "react-icons/fa";
import { Icon } from "@chakra-ui/react";
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
import { useColorMode } from '../Theme/color-mode'  
import logo from './CARTIERKUTI.svg'

const links = [
  { href: '/',          label: 'Home'      },
  { href: '/about',     label: 'About'     },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog',      label: 'Blog'      },
  { href: '/contact',   label: 'Contact'   },
]

const Navbar = () => {
  const { pathname } = useLocation()
  const { colorMode } = useColorMode()

  const linkColor  = colorMode === 'light' ? '#1D242D' : '#FFFFFF'
  const activeLink = { fontWeight: 'bold', color: 'brand.600' }

  //—Your previous “downloadResume” helper can now be pure HTML—
  const resumeHref = '/resume.pdf'   // keep the file in /public

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
      {/* logo */}
      <ChakraLink as={RouterLink} to="/" _hover={{ textDecor: 'none' }}>
        <Image src={logo} alt="logo" h={{ base: '60px', md: '80px' }} />
      </ChakraLink>

      {/* theme switch */}
      <Box mx={{ base: 2, md: 6 }}>
        <ThemeToggle />
      </Box>

      {/* nav links + resume button */}
      <HStack as="nav" spacing={{ base: 4, md: 8 }}>
        {links.map(({ href, label }) => (
          <ChakraLink
            key={href}
            as={RouterLink}
            to={href}
            {...(pathname === href ? activeLink : { color: linkColor })}
            _hover={{ color: 'brand.500' }}
          >
            {label}
          </ChakraLink>
        ))}

        {/* —―― NEW recipe-driven button ――― */}
          <Button
            as="a"
            href={resumeHref}
            download
            px={1.5}
          >
            <Icon
              as={FaDownload}
              boxSize={3.5}          // ≈14 px; tweak to taste
              mr={1}                 // small gap before the text
              aria-label="Download résumé"
            />
            Resume
          </Button>
      </HStack>
    </Flex>
  )
}

export default Navbar
