import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Field,
  Fieldset,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  HiEye,
  HiEyeOff,
  HiLockClosed,
  HiShieldCheck,
  HiSparkles,
  HiUser,
} from 'react-icons/hi'

export default function AdminLoginPanel({
  username,
  setUsername,
  password,
  setPassword,
  isLoggingIn = false,
  handleLogin,
  mfaRequired = false,
  mfaCode = '',
  setMfaCode,
  handleMfaLogin,
  cancelMfaLogin,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const border = 'border.subtle'
  const muted = 'fg.muted'

  const onSubmit = (event) => {
    event.preventDefault()
    if (mfaRequired) handleMfaLogin()
    else handleLogin()
  }

  return (
    <Flex
      as="main"
      data-admin-shell
      fontFamily="body"
      minH={{ base: 'calc(100vh - 96px)', md: 'calc(100vh - 112px)' }}
      align="center"
      justify="center"
      px={{ base: 4, md: 8 }}
      py={{ base: 10, md: 14 }}
    >
      <Grid
        w="full"
        maxW="920px"
        templateColumns={{ base: '1fr', lg: '0.95fr 1.05fr' }}
        bg="bg.surface"
        borderWidth="1px"
        borderColor={border}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
      >
        <Stack
          display={{ base: 'none', lg: 'flex' }}
          gap={8}
          justify="space-between"
          p={8}
          bg="bg.subtle"
          borderRightWidth="1px"
          borderColor={border}
        >
          <Stack gap={4}>
            <Box
              display="grid"
              placeItems="center"
              boxSize="48px"
              borderRadius="md"
              bg="accent.default"
              color="brand.contrast"
            >
              <Icon as={HiShieldCheck} boxSize={6} />
            </Box>
            <Box>
              <Text
                mb={2}
                fontSize="xs"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color={muted}
              >
                Admin Workspace
              </Text>
              <Heading size="xl" lineHeight="1.1">
                Portfolio control center
              </Heading>
            </Box>
          </Stack>

          <Stack gap={3}>
            <Flex align="center" gap={3}>
              <Box
                display="grid"
                placeItems="center"
                boxSize="36px"
                borderRadius="md"
                bg="bg.surface"
                borderWidth="1px"
                borderColor={border}
              >
                <Icon as={HiLockClosed} color="accent.default" />
              </Box>
              <Box>
                <Text mb={0} fontWeight="semibold" color="fg.default">
                  Protected access
                </Text>
                <Text mb={0} fontSize="sm" color={muted}>
                  Sign in to manage project data and resume content.
                </Text>
              </Box>
            </Flex>
            <Flex align="center" gap={3}>
              <Box
                display="grid"
                placeItems="center"
                boxSize="36px"
                borderRadius="md"
                bg="bg.surface"
                borderWidth="1px"
                borderColor={border}
              >
                <Icon as={HiSparkles} color="accent.default" />
              </Box>
              <Box>
                <Text mb={0} fontWeight="semibold" color="fg.default">
                  Live portfolio tools
                </Text>
                <Text mb={0} fontSize="sm" color={muted}>
                  Updates here affect the public portfolio experience.
                </Text>
              </Box>
            </Flex>
          </Stack>
        </Stack>

        <Box p={{ base: 6, sm: 8, md: 10 }}>
          <Box as="form" onSubmit={onSubmit} noValidate>
            <Fieldset.Root size="lg" maxW="md" mx="auto" disabled={isLoggingIn}>
              <Stack mb={8} gap={3}>
                <Text
                  mb={0}
                  fontSize="xs"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  color={muted}
                >
                  Secure Sign In
                </Text>
                <Fieldset.Legend asChild>
                  <Heading size="xl">Admin Login</Heading>
                </Fieldset.Legend>
                <Fieldset.HelperText color={muted}>
                  {mfaRequired ? 'Enter a code from your authenticator app or a recovery code.' : 'Use your admin credentials to continue.'}
                </Fieldset.HelperText>
              </Stack>

              <Fieldset.Content>
                <Stack gap={5}>
                  {!mfaRequired ? <Field.Root required>
                    <Field.Label>Username</Field.Label>
                    <Box position="relative">
                      <Box
                        position="absolute"
                        left="3"
                        top="50%"
                        transform="translateY(-50%)"
                        color={muted}
                        pointerEvents="none"
                      >
                        <Icon as={HiUser} />
                      </Box>
                      <Input
                        name="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username"
                        ps={10}
                        h="11"
                      />
                    </Box>
                  </Field.Root> : null}

                  {!mfaRequired ? <Field.Root required>
                    <Field.Label>Password</Field.Label>
                    <Box position="relative">
                      <Box
                        position="absolute"
                        left="3"
                        top="50%"
                        transform="translateY(-50%)"
                        color={muted}
                        pointerEvents="none"
                      >
                        <Icon as={HiLockClosed} />
                      </Box>
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        ps={10}
                        pe={12}
                        h="11"
                      />
                      <IconButton
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        right="1"
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        <Icon as={showPassword ? HiEyeOff : HiEye} />
                      </IconButton>
                    </Box>
                  </Field.Root> : null}

                  {mfaRequired ? (
                    <Field.Root required>
                      <Field.Label>Verification code</Field.Label>
                      <Input
                        name="mfaCode"
                        value={mfaCode}
                        onChange={(event) => setMfaCode(event.target.value)}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        placeholder="123456 or recovery code"
                        h="11"
                        autoFocus
                      />
                    </Field.Root>
                  ) : null}
                </Stack>
              </Fieldset.Content>

              <Button
                type="submit"
                mt={7}
                w="full"
                h="11"
                colorPalette="brand"
                loading={isLoggingIn}
              >
                {mfaRequired ? 'Verify and sign in' : 'Login'}
              </Button>
              {mfaRequired ? (
                <Button type="button" mt={3} w="full" variant="ghost" onClick={cancelMfaLogin}>Back to credentials</Button>
              ) : (
                <Flex mt={4} justify="center" gap={4} wrap="wrap" fontSize="sm">
                  <Button asChild variant="plain" size="sm"><Link to="/admin/recover?mode=password">Forgot password?</Link></Button>
                  <Button asChild variant="plain" size="sm"><Link to="/admin/recover?mode=username">Forgot username?</Link></Button>
                </Flex>
              )}
            </Fieldset.Root>
          </Box>
        </Box>
      </Grid>
    </Flex>
  )
}
