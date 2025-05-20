import React from 'react';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer/Footer';
import {  Flex } from '@chakra-ui/react';
import { Toaster } from './components/ui/toaster';


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
