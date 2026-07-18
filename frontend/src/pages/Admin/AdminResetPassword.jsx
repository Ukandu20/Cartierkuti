import React, { useEffect, useState } from 'react'
import { Box, Button, Field, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import apiClient from '@/utils/axiosConfig'
import { SurfaceCard } from '@/components/ui/DesignSystem'

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams()
  const [token] = useState(() => searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (token) window.history.replaceState({}, '', '/admin/reset-password')
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (password !== confirmPassword) {
      setResult({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    setSubmitting(true)
    try {
      const { data } = await apiClient.post('/api/admin/recovery/password/reset', { token, password, confirmPassword })
      setResult({ type: 'success', message: data.message })
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setResult({ type: 'error', message: error?.response?.data?.error || error?.response?.data?.message || 'Unable to reset the password.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box data-admin-shell maxW="680px" mx="auto" px={4} py={{ base: 10, md: 16 }}>
      <Helmet><meta name="referrer" content="no-referrer" /></Helmet>
      <SurfaceCard p={{ base: 6, md: 9 }}>
        <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">Secure recovery</Text>
        <Heading mt={2} fontFamily="body">Choose a new password</Heading>
        <Text color="fg.muted" mt={3}>Use at least 12 characters. After the reset, every existing admin session will be signed out.</Text>

        {!token ? (
          <Box role="alert" mt={6} p={4} bg="bg.error" borderRadius="md">This reset link is missing its security token.</Box>
        ) : result?.type === 'success' ? (
          <Stack mt={6} gap={4}>
            <Box role="status" p={4} bg="bg.success" borderRadius="md">{result.message}</Box>
            <Button asChild colorPalette="brand"><Link to="/admin">Sign in</Link></Button>
          </Stack>
        ) : (
          <Stack as="form" onSubmit={submit} mt={7} gap={5}>
            <Field.Root required>
              <Field.Label>New password</Field.Label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={128} autoComplete="new-password" />
            </Field.Root>
            <Field.Root required invalid={Boolean(result?.type === 'error')}>
              <Field.Label>Confirm new password</Field.Label>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={12} maxLength={128} autoComplete="new-password" />
              <Field.ErrorText>{result?.type === 'error' ? result.message : ''}</Field.ErrorText>
            </Field.Root>
            <Button type="submit" colorPalette="brand" loading={submitting}>Reset password</Button>
          </Stack>
        )}
      </SurfaceCard>
    </Box>
  )
}
