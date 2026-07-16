import React from 'react';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer/Footer';
import {  Flex } from '@chakra-ui/react';
import { Toaster } from './components/ui/toaster';
import ScrollToTop from './components/ScrollToTop/ScrollToTop'


export default function App() {
  return (
    <>
      <ScrollToTop />
      {/* Navbar fixed at the top */}
      <Navbar />

      <Flex as="main" direction="column" minH="calc(100vh - 90px)">
        <AppRoutes flex="1" />
        <Footer />
      </Flex>

      {/* Toast container (must be inside ChakraProvider but outside page flow) */}
      <Toaster />
    </>
  )
}
