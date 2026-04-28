import React from 'react'
import { Box, Button, CloseButton, Dialog, Flex, Portal, Stack, Text } from '@chakra-ui/react'
import { niceDate } from '@/utils/formatDate'

export default function ProjectAnalyticsDialog({
  open,
  onOpenChange,
  project,
  activities,
  loading,
  getAvgStars,
  onClose,
  bg,
  accent,
  dialogBg,
  dialogBorder,
  closeHoverBg,
}) {
  return (
    <Dialog.Root placement="center" open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <Dialog.Positioner>
          <Dialog.Content
            w={{ base: '90vw', md: '640px' }}
            maxH="80vh"
            overflowY="auto"
            bg={dialogBg}
            color="fg.default"
            p={{ base: 4, md: 6 }}
            rounded="lg"
            shadow="xl"
            borderWidth="1px"
            borderColor={dialogBorder}
          >
            <Dialog.Header
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              pb={3}
              borderBottomWidth="1px"
              borderColor={dialogBorder}
            >
              <Dialog.Title fontSize="xl" fontWeight="bold">
                {project?.title || 'Project Analytics'}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" borderWidth="1px" borderColor={dialogBorder} _hover={{ bg: closeHoverBg }} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={0}>
              {project ? (
                <Stack gap={4}>
                  <Flex gap={3} wrap="wrap">
                    <Box p={4} bg={bg} borderRadius="md" flex="1" minW="140px">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Views</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={accent}>{project.views || 0}</Text>
                    </Box>
                    <Box p={4} bg={bg} borderRadius="md" flex="1" minW="140px">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Rating</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={accent}>{getAvgStars(project)}</Text>
                    </Box>
                    <Box p={4} bg={bg} borderRadius="md" flex="1" minW="140px">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Featured</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={accent}>{project.featured ? 'Yes' : 'No'}</Text>
                    </Box>
                  </Flex>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Recent Activity</Text>
                    {loading ? (
                      <Text color="fg.muted">Loading activity...</Text>
                    ) : activities.length ? (
                      <Stack gap={2}>
                        {activities.map((activity) => (
                          <Box key={activity.id || activity._id} p={3} bg={bg} borderRadius="md">
                            <Flex justify="space-between" gap={3}>
                              <Text fontWeight="bold">{activity.type}</Text>
                              <Text fontSize="sm" color="fg.muted">{niceDate(activity.timestamp || activity.createdAt)}</Text>
                            </Flex>
                            <Text>{activity.title}</Text>
                            {activity.detail && <Text fontSize="sm" color="fg.muted">{activity.detail}</Text>}
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Text color="fg.muted">No recent activity for this project.</Text>
                    )}
                  </Box>
                </Stack>
              ) : (
                <Text color="fg.muted">No project selected.</Text>
              )}
            </Dialog.Body>

            <Dialog.Footer display="flex" justifyContent="flex-end" mt={4}>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
