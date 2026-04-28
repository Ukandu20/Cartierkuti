import React from 'react'
import { Box, Button, Field, Fieldset, Flex, Input, Stack } from '@chakra-ui/react'

export default function AdminLoginPanel({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
}) {
  return (
    <>
      <Flex height="100vh" align="center" justify="center">
        <Box p={6} bg="bg.subtle" borderRadius="md">
          <Fieldset.Root size="md" maxW="sm">
            <Stack mb={4} gap={2}>
              <Fieldset.Legend>Admin Login</Fieldset.Legend>
              <Fieldset.HelperText>Enter your admin username and password</Fieldset.HelperText>
            </Stack>
            <Fieldset.Content>
              <Field.Root required>
                <Field.Label>Username</Field.Label>
                <Input
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  px={2}
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>Password</Field.Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleLogin()
                  }}
                />
              </Field.Root>
            </Fieldset.Content>
            <Button mt={4} w="full" colorPalette="teal" onClick={handleLogin}>
              Login
            </Button>
          </Fieldset.Root>
        </Box>
      </Flex>
    </>
  )
}
