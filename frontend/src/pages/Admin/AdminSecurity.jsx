import React, { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiArrowLeft, HiCheckCircle, HiClipboard, HiKey, HiShieldCheck } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/utils/axiosConfig'
import { SurfaceCard } from '@/components/ui/DesignSystem'
import AdminLoginPanel from './components/AdminLoginPanel'
import { useAdminAuth } from './hooks/useAdminAuth'

const errorMessage = (error, fallback) => error?.response?.data?.error
  || error?.response?.data?.message
  || fallback

export default function AdminSecurity() {
  const navigate = useNavigate()
  const noop = useCallback(() => {}, [])
  const auth = useAdminAuth({ onAuthenticated: noop })
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const [setupPassword, setSetupPassword] = useState('')
  const [mfaSetup, setMfaSetup] = useState(null)
  const [setupCode, setSetupCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [credentials, setCredentials] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    mfaCode: '',
  })
  const [disable, setDisable] = useState({ currentPassword: '', code: '' })

  useEffect(() => {
    if (!auth.isAuth) return
    let active = true
    setLoading(true)
    apiClient.get('/api/admin/account')
      .then(({ data }) => {
        if (!active) return
        setAccount(data)
        setCredentials((current) => ({ ...current, newUsername: data.username }))
      })
      .catch((error) => {
        if (error?.response?.status === 401) auth.logout()
        else setNotice({ type: 'error', message: errorMessage(error, 'Unable to load account security.') })
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [auth.isAuth, auth.logout])

  const startMfaSetup = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const { data } = await apiClient.post('/api/admin/account/mfa/setup', { currentPassword: setupPassword })
      setMfaSetup(data)
      setSetupPassword('')
    } catch (error) {
      setNotice({ type: 'error', message: errorMessage(error, 'Unable to start two-factor setup.') })
    } finally {
      setLoading(false)
    }
  }

  const confirmMfa = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const { data } = await apiClient.post('/api/admin/account/mfa/confirm', { code: setupCode })
      setRecoveryCodes(data.recoveryCodes || [])
      setSetupCode('')
      setNotice({ type: 'success', message: data.message })
    } catch (error) {
      setNotice({ type: 'error', message: errorMessage(error, 'Unable to confirm the verification code.') })
    } finally {
      setLoading(false)
    }
  }

  const changeCredentials = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const payload = {
        currentPassword: credentials.currentPassword,
        mfaCode: credentials.mfaCode,
      }
      if (credentials.newUsername && credentials.newUsername !== account.username) payload.newUsername = credentials.newUsername
      if (credentials.newPassword) {
        payload.newPassword = credentials.newPassword
        payload.confirmPassword = credentials.confirmPassword
      }
      const { data } = await apiClient.post('/api/admin/account/credentials', payload)
      setNotice({ type: 'success', message: data.message })
      auth.logout()
      navigate('/admin', { replace: true })
    } catch (error) {
      setNotice({ type: 'error', message: errorMessage(error, 'Unable to update credentials.') })
    } finally {
      setLoading(false)
    }
  }

  const disableMfa = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const { data } = await apiClient.delete('/api/admin/account/mfa', { data: disable })
      setNotice({ type: 'success', message: data.message })
      auth.logout()
      navigate('/admin', { replace: true })
    } catch (error) {
      setNotice({ type: 'error', message: errorMessage(error, 'Unable to disable two-factor authentication.') })
    } finally {
      setLoading(false)
    }
  }

  const copyRecoveryCodes = async () => {
    await navigator.clipboard?.writeText(recoveryCodes.join('\n'))
    setNotice({ type: 'success', message: 'Recovery codes copied. Store them in a password manager.' })
  }

  if (!auth.isAuth) {
    return (
      <AdminLoginPanel
        username={auth.username}
        setUsername={auth.setUsername}
        password={auth.password}
        setPassword={auth.setPassword}
        isLoggingIn={auth.isLoggingIn}
        handleLogin={auth.handleLogin}
        mfaRequired={auth.mfaRequired}
        mfaCode={auth.mfaCode}
        setMfaCode={auth.setMfaCode}
        handleMfaLogin={auth.handleMfaLogin}
        cancelMfaLogin={auth.cancelMfaLogin}
      />
    )
  }

  return (
    <Box data-admin-shell maxW="1100px" mx="auto" p={{ base: 4, md: 8 }}>
      <Button variant="ghost" mb={4} onClick={() => navigate('/admin')}><HiArrowLeft /> Back to dashboard</Button>
      <Flex justify="space-between" align="flex-start" gap={5} wrap="wrap" mb={7}>
        <Box>
          <Text fontFamily="mono" fontSize="xs" color="accent.default" textTransform="uppercase" letterSpacing="0.14em">Account security</Text>
          <Heading fontFamily="body" mt={1}>Protect admin access</Heading>
          <Text color="fg.muted" mt={2}>Manage the login identity, password, and second factor.</Text>
        </Box>
        {account ? <Badge colorPalette={account.mfaEnabled ? 'green' : 'orange'} size="lg">{account.mfaEnabled ? '2FA enabled' : '2FA required'}</Badge> : null}
      </Flex>

      {notice ? (
        <Box role={notice.type === 'error' ? 'alert' : 'status'} mb={6} p={4} borderRadius="md" bg={notice.type === 'error' ? 'bg.error' : 'bg.success'}>
          <Text>{notice.message}</Text>
        </Box>
      ) : null}

      {recoveryCodes.length ? (
        <SurfaceCard p={{ base: 5, md: 7 }} mb={6} borderColor="border.warning">
          <Flex align="center" gap={3}><HiKey /><Heading size="lg">Save your recovery codes now</Heading></Flex>
          <Text mt={3} color="fg.muted">Each code works once. They will not be shown again.</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2} mt={5} fontFamily="mono">
            {recoveryCodes.map((code) => <Box key={code} p={3} bg="bg.subtle" borderRadius="md">{code}</Box>)}
          </SimpleGrid>
          <Flex mt={5} gap={3} wrap="wrap">
            <Button variant="outline" onClick={copyRecoveryCodes}><HiClipboard /> Copy codes</Button>
            <Button colorPalette="brand" onClick={() => { auth.logout(); navigate('/admin', { replace: true }) }}><HiCheckCircle /> I saved them—sign me out</Button>
          </Flex>
        </SurfaceCard>
      ) : null}

      {!recoveryCodes.length ? (
        <SimpleGrid columns={{ base: 1, lg: account?.mfaEnabled ? 2 : 1 }} gap={6}>
          <SurfaceCard p={{ base: 5, md: 7 }}>
            <Flex align="center" gap={3} mb={3}><HiShieldCheck /><Heading size="lg">Two-factor authentication</Heading></Flex>
            {!account?.mfaEnabled ? (
              !mfaSetup ? (
                <Stack as="form" onSubmit={startMfaSetup} gap={4} mt={5}>
                  <Text color="fg.muted">Before credentials can be changed, connect an authenticator app. Confirm your current password to begin.</Text>
                  <Field.Root required><Field.Label>Current password</Field.Label><Input type="password" value={setupPassword} onChange={(event) => setSetupPassword(event.target.value)} autoComplete="current-password" /></Field.Root>
                  <Button type="submit" colorPalette="brand" loading={loading}>Start authenticator setup</Button>
                </Stack>
              ) : (
                <Stack as="form" onSubmit={confirmMfa} gap={4} mt={5}>
                  <Text color="fg.muted">In your authenticator app, add an account manually with this setup key:</Text>
                  <Box p={4} bg="bg.subtle" borderRadius="md" fontFamily="mono" overflowWrap="anywhere" userSelect="all">{mfaSetup.secret}</Box>
                  <Field.Root required><Field.Label>6-digit verification code</Field.Label><Input value={setupCode} onChange={(event) => setSetupCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" /></Field.Root>
                  <Button type="submit" colorPalette="brand" loading={loading}>Verify and enable 2FA</Button>
                </Stack>
              )
            ) : (
              <Stack as="form" onSubmit={disableMfa} gap={4} mt={5}>
                <Text color="fg.muted">Disabling 2FA weakens the account and signs out every session.</Text>
                <Field.Root required><Field.Label>Current password</Field.Label><Input type="password" value={disable.currentPassword} onChange={(event) => setDisable((current) => ({ ...current, currentPassword: event.target.value }))} /></Field.Root>
                <Field.Root required><Field.Label>Authenticator or recovery code</Field.Label><Input value={disable.code} onChange={(event) => setDisable((current) => ({ ...current, code: event.target.value }))} autoComplete="one-time-code" /></Field.Root>
                <Button type="submit" variant="outline" colorPalette="red" loading={loading}>Disable 2FA</Button>
              </Stack>
            )}
          </SurfaceCard>

          {account?.mfaEnabled ? (
            <SurfaceCard p={{ base: 5, md: 7 }}>
              <Heading size="lg">Change login credentials</Heading>
              <Text color="fg.muted" mt={2}>Changing either value signs out every active session.</Text>
              <Stack as="form" onSubmit={changeCredentials} gap={4} mt={5}>
                <Field.Root><Field.Label>New username</Field.Label><Input value={credentials.newUsername} onChange={(event) => setCredentials((current) => ({ ...current, newUsername: event.target.value }))} autoComplete="username" /></Field.Root>
                <Field.Root><Field.Label>New password</Field.Label><Input type="password" minLength={12} maxLength={128} value={credentials.newPassword} onChange={(event) => setCredentials((current) => ({ ...current, newPassword: event.target.value }))} autoComplete="new-password" /><Field.HelperText>Leave blank to keep the existing password.</Field.HelperText></Field.Root>
                <Field.Root invalid={Boolean(credentials.newPassword && credentials.newPassword !== credentials.confirmPassword)}><Field.Label>Confirm new password</Field.Label><Input type="password" value={credentials.confirmPassword} onChange={(event) => setCredentials((current) => ({ ...current, confirmPassword: event.target.value }))} autoComplete="new-password" /></Field.Root>
                <Field.Root required><Field.Label>Current password</Field.Label><Input type="password" value={credentials.currentPassword} onChange={(event) => setCredentials((current) => ({ ...current, currentPassword: event.target.value }))} autoComplete="current-password" /></Field.Root>
                <Field.Root required><Field.Label>Authenticator or recovery code</Field.Label><Input value={credentials.mfaCode} onChange={(event) => setCredentials((current) => ({ ...current, mfaCode: event.target.value }))} autoComplete="one-time-code" /></Field.Root>
                <Button type="submit" colorPalette="brand" loading={loading}>Update credentials and sign out</Button>
              </Stack>
            </SurfaceCard>
          ) : null}
        </SimpleGrid>
      ) : null}
    </Box>
  )
}
