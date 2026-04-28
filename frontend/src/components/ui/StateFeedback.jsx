import React from 'react'
import { Button, Center, Spinner, Stack, Text } from '@chakra-ui/react'

export function LoadingState({ label = 'Loading...' }) {
  return (
    <Center py={8}>
      <Stack align="center" gap={3}>
        <Spinner />
        <Text color="fg.muted">{label}</Text>
      </Stack>
    </Center>
  )
}

export function EmptyState({ title = 'Nothing here yet.', description }) {
  return (
    <Stack py={6} gap={1}>
      <Text fontWeight="bold">{title}</Text>
      {description && <Text color="fg.muted">{description}</Text>}
    </Stack>
  )
}

export function ErrorState({ title = 'Something went wrong.', description, onRetry }) {
  return (
    <Stack py={6} gap={3}>
      <Stack gap={1}>
        <Text fontWeight="bold" color="status.error">{title}</Text>
        {description && <Text color="fg.muted">{description}</Text>}
      </Stack>
      {onRetry && (
        <Button alignSelf="flex-start" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Stack>
  )
}
