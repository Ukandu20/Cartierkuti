'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'

import { ColorModeProvider } from './color-mode'
import { system } from './theme'

export function Provider({ children }) {
  return (
    <HelmetProvider>
      <ColorModeProvider>
        <ChakraProvider value={system}>
          {children}
        </ChakraProvider>
      </ColorModeProvider>
    </HelmetProvider>
  )
}
