/* src/components/Theme/ThemeToggle.jsx */
'use client'

import { IconButton } from '@chakra-ui/react'
import { useColorMode } from './color-mode'           // ← local hook
import { FaMoon, FaSun } from 'react-icons/fa'

export default function ThemeToggle(props) {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <IconButton
      aria-label="Toggle colour mode"
      onClick={toggleColorMode}
      variant="ghost"
      rounded="full"
      {...props}
    >
      {colorMode === 'light' ? <FaSun /> : <FaMoon />}
    </IconButton>
  )
}
  