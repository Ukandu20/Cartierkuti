import React from 'react'
import { Flex } from '@chakra-ui/react'
import Navbar from './components/Navbar/Navbar'
import AppRoutes from './AppRoutes'
import Footer from './components/Footer/Footer'
import { Toaster } from './components/ui/toaster'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'


export default function App() {
  return (
    <Flex direction="column" minH="100vh">
      <ScrollToTop />
      <Navbar />

      <Flex as="main" id="main-content" tabIndex="-1" direction="column" flex="1">
        <AppRoutes flex="1" />
      </Flex>

      <Footer />

      <Toaster />
    </Flex>
  )
}
