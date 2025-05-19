// src/App.jsx
'use client'

import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Navbar from '@/components/Navbar/Navbar'
import AppRoutes from '@/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer/Footer'

export default function App() {
  return (
    <>
      {/* Navbar fixed at the top */}
      <Navbar />

      {/* Main content pushes below fixed navbar (assumes navbar height = 64px) */}
      <Flex as="main" direction="column" pt="64px" minH="100vh">
        <AppRoutes flex="1" />
        <Footer />
      </Flex>

      {/* Toast container (must be inside ChakraProvider but outside page flow) */}
      <Toaster />
    </>
  )
}
