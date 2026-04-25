'use client'

import React from 'react'
import {
  Box,
  VStack,
  Button,
  Heading,
  HStack,
  Link,
  Icon,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FaGithub, FaBehance, FaLinkedinIn } from 'react-icons/fa'

/**
 * Footer — contact & socials (Chakra v3)
 * -------------------------------------
 *  • Uses `divideY` style‑prop instead of <Divider/>
 *  • Email link + social icons share brand accent
 */
export default function Footer() {
  const bg       = 'bg.subtle'
  const txt      = 'fg.muted'
  const accent   = 'brand.500'
  const accentHover = 'brand.600'

    // Responsive tweak: larger button on desktop, smaller on mobile
    const btnSize = useBreakpointValue({ base: 'md', md: 'lg' })

  return (
    <Box as="footer" bg={bg} py={{ base: 10, md: 14 }} px={4}>
      <VStack
        spacing={6}
        maxW="container.lg"
        mx="auto"
        textAlign="center"
        >

        <Heading size="2xl" mb={4}>
                Interested in Working Together?
              </Heading>
        
              <Text
                maxW="2xl"
                mx="auto"
                fontSize="lg"
                color="fg.muted"
                mb={8}
              >
                I&#39;m always open to discussing exciting ideas, collaborations, or new
                opportunities.
              </Text>
        
      <Button
        as={Link}
        href="mailto:cartierkuti@gmail.com"
        size={btnSize}
        bg={accent}
        _hover={{ bg: accentHover }}
        color="white"
        rounded="full"
        boxShadow="md"
        fontWeight="semibold"
      >
                Say Hello
              </Button>
        
              <Text
                mt={6}
                fontSize="sm"
                color="fg.muted"
              >
                or email me directly at{' '}
                <Link href="mailto:okechiukandu@gmail.com" color={accent} fontWeight="medium">
                  okechiukandu@gmail.com
                </Link>
              </Text>
        
              <HStack mt={10} spacing={8} justify="center">
                <Link
                  href="https://linkedin.com/in/okechiukandu"
                  isExternal
                  aria-label="LinkedIn"
                  target='_blank'
                >
                  <Icon as={FaLinkedinIn} boxSize={6} color={accent} _hover={{ color: accentHover }} />
                </Link>
                <Link href="https://github.com/okechiukandu" target='_blank' isExternal aria-label="GitHub">
                  <Icon as={FaGithub} boxSize={6} color={accent} _hover={{ color: accentHover }} />
                </Link>
                <Link href="https://behance.net/okechiukandu" target='_blank' isExternal aria-label="Behance">
                  <Icon as={FaBehance} boxSize={6} color={accent} _hover={{ color: accentHover }} />
                </Link>
              </HStack>
        {/* copyright */}
        <Text pt={4} fontSize="xs" color={txt} textAlign="center" w="full">
          © {new Date().getFullYear()} Okechi Ukandu. All rights reserved.
        </Text>
      </VStack>
    </Box>
  )
}
