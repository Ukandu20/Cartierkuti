import React, { useState } from 'react'
import { Box, Button, Field, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { Link, useSearchParams } from 'react-router-dom'
import apiClient from '@/utils/axiosConfig'
import { SurfaceCard } from '@/components/ui/DesignSystem'

export default function AdminRecovery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'username' ? 'username' : 'password'
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setMessage('')
    try {
      const endpoint = mode === 'username'
        ? '/api/admin/recovery/username'
        : '/api/admin/recovery/password/request'
      const { data } = await apiClient.post(endpoint, { email: email.trim() })
      setMessage(data.message)
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Unable to submit the recovery request. Try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box data-admin-shell maxW="680px" mx="auto" px={4} py={{ base: 10, md: 16 }}>
      <SurfaceCard p={{ base: 6, md: 9 }}>
        <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">Account recovery</Text>
        <Heading mt={2} fontFamily="body">{mode === 'username' ? 'Recover your username' : 'Reset your password'}</Heading>
        <Text color="fg.muted" mt={3}>
          Enter the recovery email configured for the admin account. The response will not reveal whether an account exists.
        </Text>

        <Flex mt={6} gap={2}>
          <Button variant={mode === 'password' ? 'solid' : 'outline'} colorPalette="brand" onClick={() => { setSearchParams({ mode: 'password' }); setMessage('') }}>Password</Button>
          <Button variant={mode === 'username' ? 'solid' : 'outline'} colorPalette="brand" onClick={() => { setSearchParams({ mode: 'username' }); setMessage('') }}>Username</Button>
        </Flex>

        <Stack as="form" onSubmit={submit} mt={7} gap={5}>
          <Field.Root required>
            <Field.Label>Recovery email</Field.Label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </Field.Root>
          <Button type="submit" colorPalette="brand" loading={submitting}>
            {mode === 'username' ? 'Email username reminder' : 'Email password reset link'}
          </Button>
        </Stack>

        {message ? <Box role="status" mt={5} p={4} borderRadius="md" bg="bg.subtle"><Text>{message}</Text></Box> : null}
        <Button asChild mt={5} variant="ghost"><Link to="/admin">Back to admin login</Link></Button>
      </SurfaceCard>
    </Box>
  )
}
