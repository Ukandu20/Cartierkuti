'use client'


import React from 'react'
import { ChakraProvider }   from '@chakra-ui/react'
import { HelmetProvider }   from 'react-helmet-async'

import { ColorModeProvider } from './color-mode'
import { system }            from './Theme'          // createSystem output

export function Provider({ children }) {
  return (
    <HelmetProvider>
      <ChakraProvider value={system}>
        <ColorModeProvider>
          {children}
        </ColorModeProvider>
      </ChakraProvider>
    </HelmetProvider>
  )
}
