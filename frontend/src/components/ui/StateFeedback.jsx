import React from 'react'
import { Button, Center, Icon, Spinner, Stack, Text } from '@chakra-ui/react'
import { HiExclamationTriangle, HiInbox } from 'react-icons/hi2'
import { SurfaceCard } from './DesignSystem'

function StatePanel({ icon, title, description, tone = 'neutral', action, compact = false }) {
  const isError = tone === 'error'
  return (
    <SurfaceCard p={compact ? 5 : { base: 6, md: 8 }} textAlign="center" boxShadow="none">
      <Stack align="center" gap={3}>
        <Center boxSize="11" borderRadius="full" bg={isError ? 'bg.error' : 'accent.subtle'} color={isError ? 'fg.error' : 'accent.default'}>
          <Icon as={icon} boxSize="5" />
        </Center>
        <Text fontWeight="700" fontSize={compact ? 'md' : 'lg'} color={isError ? 'fg.error' : 'fg.default'}>{title}</Text>
        {description && <Text color="fg.muted" maxW="xl">{description}</Text>}
        {action}
      </Stack>
    </SurfaceCard>
  )
}

export function LoadingState({ label = 'Loading...', compact = false }) {
  return (
    <Center py={compact ? 5 : 8} aria-live="polite" aria-busy="true">
      <Stack align="center" gap={3}>
        <Spinner color="accent.default" />
        <Text color="fg.muted">{label}</Text>
      </Stack>
    </Center>
  )
}

export function EmptyState({ title = 'Nothing here yet.', description, compact = false }) {
  return <StatePanel icon={HiInbox} title={title} description={description} compact={compact} />
}

export function ErrorState({ title = 'Something went wrong.', description, onRetry, compact = false }) {
  const action = onRetry ? <Button size="sm" variant="outline" colorPalette="brand" onClick={onRetry}>Try again</Button> : null
  return <StatePanel icon={HiExclamationTriangle} title={title} description={description} tone="error" action={action} compact={compact} />
}
