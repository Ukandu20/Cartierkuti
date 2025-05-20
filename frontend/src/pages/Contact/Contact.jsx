// src/pages/Contact/ContactPage.jsx
'use client'

import React, { useRef, useState } from 'react'
import {
  Box,
  SimpleGrid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Input,
  Textarea,
  Button,
  Field,
  NativeSelect,
  chakra,
  useBreakpointValue,
  Link,
  Flex,
} from '@chakra-ui/react'
import { useColorMode as useThemeColorMode } from '@/components/Theme/color-mode'
import { toaster } from '@/components/ui/toaster'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import emailjs from 'emailjs-com'

const MotionBox = motion(Box)

export default function ContactPage() {
  const { colorMode } = useThemeColorMode()

  // EmailJS ids via env vars
  const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  const [loading, setLoading] = useState(false)
  const formRef = useRef(null)

  /* theme tokens */
  const accent   = 'brand.500'
  const bgPage   = colorMode === 'light' ? 'gray.50'   : 'gray.900'
  const bgCard   = colorMode === 'light' ? 'white'     : 'gray.800'
  const bgField  = colorMode === 'light' ? 'gray.100'  : 'gray.700'
  const border   = colorMode === 'light' ? 'gray.300'  : 'gray.600'
  const txtSec   = colorMode === 'light' ? 'gray.600'  : 'gray.300'

  const cols = useBreakpointValue({ base: 1, md: 2 })

  const fieldSharedProps = {
    bg: bgField,
    borderColor: border,
    _focusVisible: {
      borderColor: accent,
      boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
    },
  }

  /* -------------------- Handlers -------------------- */
  async function handleSubmit(e) {
    e.preventDefault()
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      toaster.create({ title: 'Email service not configured', status: 'error' })
      return
    }
    setLoading(true)

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      toaster.create({ title: 'Message sent!', status: 'success' })
      formRef.current.reset()
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'Failed to send. Please try again later.', status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box as="main"  py={{ base: 16, md: 24 }} px={4}>
      <Helmet>
        <title>Contact | Your Name</title>
        <meta name="description" content="Contact Your Name for freelance work, collaborations, or general inquiries." />
        <link rel="canonical" href="https://your-domain.com/contact" />
      </Helmet>

      <SimpleGrid columns={cols} spacing={{ base: 10, md: 16 }} maxW="6xl" mx="auto">
        {/* Left – Info */}
        <GridItem>
          <VStack
            p={{ base: 6, md: 10 }}
            spacing={8}
            align="stretch"
          >
            <Box>
              <Heading size="lg" mb={2}>Let’s get in touch</Heading>
              <Text color={txtSec}>
                Have a project, feedback or idea? Fill out the form or reach me through the channels below.
              </Text>
            </Box>
            <VStack align="start" spacing={4} fontSize="sm">
              <HStack spacing={3}>
                <Icon as={FaMapMarkerAlt} color={accent} />
                <Text>Windsor, ON</Text>
              </HStack>
              <HStack spacing={3}>
                <Icon as={FaPhoneAlt} color={accent} />
                <Link href="tel:+12261234567">+1 226 123 4567</Link>
              </HStack>
              <HStack spacing={3}>
                <Icon as={FaEnvelope} color={accent} />
                <Link href="mailto:okechiukandu@gmail.com">okechiukandu@gmail.com</Link>
              </HStack>
            </VStack>
          </VStack>
        </GridItem>

        {/* Right – Form */}
        <GridItem>
          <MotionBox
            bg={bgCard}
            p={{ base: 6, md: 10 }}
            rounded="2xl"
            shadow="lg"
            borderWidth="1px"
            borderColor={border}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Heading size="lg" mb={6}>Contact Form</Heading>
            <chakra.form
              ref={formRef}
              onSubmit={handleSubmit}
              display="grid"
              gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={6}
            >
              {/* Name */}
              <Field.Root>
                <Field.Label htmlFor="user_name">Name</Field.Label>
                <Input
                  id="user_name"
                  name="user_name"
                  placeholder="Your Name"
                  size="md"
                  paddingX={2}
                  required
                  {...fieldSharedProps}
                />
              </Field.Root>

              {/* Email */}
              <Field.Root>
                <Field.Label htmlFor="user_email">Email</Field.Label>
                <Input
                  id="user_email"
                  name="user_email"
                  type="email"
                  placeholder="you@example.com"
                  size="md"
                  paddingX={2}
                  required
                  {...fieldSharedProps}
                />
              </Field.Root>

              {/* Subject */}
              <Field.Root gridColumn={{ md: '1 / -1' }}>
                <Field.Label htmlFor="subject" >Subject</Field.Label>
                <NativeSelect.Root id="subject" name="subject" size="md" width="full">
                  <NativeSelect.Field
                    placeholder="Choose subject"
                    bg={bgField}
                    borderColor={border}
                    paddingX={2}
                    _focusVisible={{ borderColor: accent }}
                  >
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="General Question">General Question</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator color={accent} />
                </NativeSelect.Root>
              </Field.Root>

              {/* Message */}
              <Field.Root gridColumn={{ md: '1 / -1' }}>
                <Field.Label htmlFor="message">Message</Field.Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell me about your project..."
                  padding={2}
                  required
                  {...fieldSharedProps}
                />
              </Field.Root>

              {/* Submit */}
              <Flex gridColumn={{ md: '1 / -1' }}>
                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  ml="auto"
                  isLoading={loading}
                  loadingText="Sending"
                >
                  Send Message
                </Button>
              </Flex>
            </chakra.form>
          </MotionBox>
        </GridItem>
      </SimpleGrid>
    </Box>
  )
}
