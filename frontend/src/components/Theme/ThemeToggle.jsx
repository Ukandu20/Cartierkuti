'use client'

import React from 'react'
import { IconButton } from '@chakra-ui/react'
import { useColorMode } from './color-mode'   // ← pull from your file
import { FaMoon, FaSun } from 'react-icons/fa'

export default function ThemeToggle(props) {
  const { colorMode, toggleColorMode } = useColorMode()
  // show the sun icon when in dark mode, moon when in light
  const icon = colorMode === 'dark' ? <FaSun /> : <FaMoon />

  return (
    <IconButton
      aria-label="Toggle dark mode"
      icon={icon}
      onClick={toggleColorMode}
      variant="ghost"
      {...props}
    />
  )
}
