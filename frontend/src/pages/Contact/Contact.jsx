import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  chakra,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import emailjs from '@emailjs/browser'
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { SectionLabel, SurfaceCard, fieldStyles } from '@/components/ui/DesignSystem'
import { absoluteUrl, siteName } from '@/utils/siteConfig'
import { useFooterContent } from '@/hooks/useFooterContent'

export default function ContactPage() {
  const { email } = useFooterContent()
  const contactMethods = [
    { icon: FaMapMarkerAlt, label: 'Location', value: 'Windsor, ON' },
    { icon: FaEnvelope, label: 'Email', value: email, href: `mailto:${email}` },
  ]
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const formRef = useRef(null)
  const sending = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (sending.current) return
    const form = formRef.current
    if (!form.reportValidity()) return
    const nextErrors = {}
    for (const [name, label] of [['user_name', 'name'], ['message', 'message']]) {
      const input = form.elements.namedItem(name)
      input.value = input.value.trim()
      if (!input.value) nextErrors[name] = `Enter your ${label}.`
    }
    setErrors(nextErrors)
    setFeedback(null)
    if (Object.keys(nextErrors).length) {
      form.elements.namedItem(Object.keys(nextErrors)[0]).focus()
      return
    }
    if (!serviceId || !templateId || !publicKey) {
      setFeedback({ type: 'error', message: 'The contact form is currently unavailable. Please email me directly.' })
      return
    }

    sending.current = true
    setLoading(true)
    try {
      await emailjs.sendForm(serviceId, templateId, form, publicKey)
      setFeedback({ type: 'success', message: 'Message sent. Thanks — I will get back to you shortly.' })
      form.reset()
    } catch (error) {
      if (import.meta.env.DEV) console.error(error)
      setFeedback({ type: 'error', message: 'Message could not be sent. Your message is still here. Please try again or email me directly.' })
    } finally {
      sending.current = false
      setLoading(false)
    }
  }

  return (
    <Box as="main" bg="bg.canvas" px={{ base: 5, md: 10 }} py={{ base: 14, md: 20 }}>
      <Helmet>
        <title>Contact | {siteName}</title>
        <meta name="description" content={`Contact ${siteName} for analytics, security-minded data work, collaborations, or general inquiries.`} />
        <link rel="canonical" href={absoluteUrl('/contact')} />
      </Helmet>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 10, lg: 16 }} maxW="7xl" mx="auto" alignItems="start">
        <Stack gap={8} pt={{ lg: 6 }}>
          <Stack gap={5} maxW="2xl">
            <SectionLabel number="01">Start a conversation</SectionLabel>
            <Heading as="h1" fontSize={{ base: '4xl', md: '6xl' }} lineHeight="1.05">
              Let&apos;s make the next decision clearer.
            </Heading>
            <Text color="fg.muted" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.7">
              Have a project, collaboration, or question in mind? Share the context and the outcome you are working toward.
            </Text>
          </Stack>

          <Stack gap={0} borderTop="1px solid" borderColor="border.subtle">
            {contactMethods.map(({ icon, label, value, href }) => (
              <HStack key={label} gap={4} py={5} borderBottom="1px solid" borderColor="border.subtle" align="flex-start">
                <Flex boxSize="10" borderRadius="md" bg="accent.subtle" color="accent.default" align="center" justify="center" flexShrink={0}>
                  <Icon as={icon} />
                </Flex>
                <Box>
                  <Text fontFamily="mono" fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="fg.muted">{label}</Text>
                  {href ? <Link href={href} fontWeight="700" _hover={{ color: 'accent.default' }}>{value}</Link> : <Text fontWeight="700">{value}</Text>}
                </Box>
              </HStack>
            ))}
          </Stack>
        </Stack>

        <SurfaceCard as="section" aria-labelledby="contact-form-heading" p={{ base: 5, sm: 7, md: 9 }}>
          <SectionLabel number="02">Project brief</SectionLabel>
          <Heading id="contact-form-heading" as="h2" fontSize={{ base: '3xl', md: '4xl' }} mt={3} mb={2}>Tell me what you are exploring</Heading>
          <Text color="fg.muted" mb={7}>A few useful details are enough to begin.</Text>

          <chakra.form ref={formRef} onSubmit={handleSubmit} aria-busy={loading} display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
            <Field.Root required invalid={Boolean(errors.user_name)}>
              <Field.Label htmlFor="user_name">Name <Field.RequiredIndicator /></Field.Label>
              <Input id="user_name" name="user_name" placeholder="Your name" autoComplete="name" maxLength={120} required disabled={loading} onChange={() => setErrors(current => ({ ...current, user_name: undefined }))} {...fieldStyles} />
              <Field.ErrorText>{errors.user_name}</Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label htmlFor="user_email">Email <Field.RequiredIndicator /></Field.Label>
              <Input id="user_email" name="user_email" type="email" placeholder="you@example.com" autoComplete="email" maxLength={254} required disabled={loading} {...fieldStyles} />
            </Field.Root>

            <Field.Root gridColumn={{ md: '1 / -1' }}>
              <Field.Label htmlFor="subject">Subject</Field.Label>
              <NativeSelect.Root width="full">
                <NativeSelect.Field id="subject" name="subject" placeholder="Choose a subject" disabled={loading} {...fieldStyles}>
                  <option value="Project Inquiry">Project inquiry</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="General Question">General question</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator color="accent.default" />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root required invalid={Boolean(errors.message)} gridColumn={{ md: '1 / -1' }}>
              <Field.Label htmlFor="message">Message <Field.RequiredIndicator /></Field.Label>
              <Textarea id="message" name="message" rows={7} placeholder="What problem are you trying to solve?" maxLength={5000} required disabled={loading} onChange={() => setErrors(current => ({ ...current, message: undefined }))} {...fieldStyles} />
              <Field.ErrorText>{errors.message}</Field.ErrorText>
            </Field.Root>

            <Button type="submit" colorPalette="brand" size="lg" gridColumn={{ md: '1 / -1' }} justifySelf={{ base: 'stretch', sm: 'end' }} w={{ base: 'full', sm: 'auto' }} loading={loading} disabled={loading} loadingText="Sending">
              Send message
            </Button>
          </chakra.form>
          {feedback ? <Box role={feedback.type === 'error' ? 'alert' : 'status'} mt={5} p={4} borderRadius="md" bg={feedback.type === 'error' ? 'bg.error' : 'bg.subtle'}>
            <Text>{feedback.message}</Text>
            {feedback.type === 'error' ? <Link href={`mailto:${email}`} fontWeight="700" mt={2}>Email me directly</Link> : null}
          </Box> : null}
        </SurfaceCard>
      </SimpleGrid>
    </Box>
  )
}
