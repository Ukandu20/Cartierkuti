// src/components/Footer/Footer.jsx
'use client'

import React from 'react'
import {
  Box,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { useColorMode } from '../Theme/color-mode'  // ← your custom hook
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa'

export default function Footer() {
  const { colorMode } = useColorMode()

  const bgColor   = colorMode === 'light' ? '#F9FAFB' : '#1A202C'
  const textColor = colorMode === 'light' ? '#2D3748' : '#E2E8F0'
  const iconColor = colorMode === 'light' ? '#4A5568' : '#A0AEC0'
  const borderClr = colorMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'

  return (
    <Box
      as="footer"
      bg={bgColor}
      color={textColor}
      borderTop="1px solid"
      borderColor={borderClr}
      py={6}
    >
      <HStack justify="center" spacing={6} mb={4}>
        <IconButton
          as="a"
          href="https://twitter.com/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          icon={<FaTwitter />}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: 'transparent', color: iconColor }}
        />
        <IconButton
          as="a"
          href="https://github.com/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          icon={<FaGithub />}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: 'transparent', color: iconColor }}
        />
        <IconButton
          as="a"
          href="https://linkedin.com/in/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          icon={<FaLinkedin />}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: 'transparent', color: iconColor }}
        />
      </HStack>
      <Text textAlign="center" fontSize="sm">
        © {new Date().getFullYear()} Your Name. All rights reserved.
      </Text>
    </Box>
  )
}
