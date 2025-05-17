'use client'

import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'
import { system } from './Theme'   // your createSystem output

export function Provider({ children }) {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </ColorModeProvider>
  )
}
