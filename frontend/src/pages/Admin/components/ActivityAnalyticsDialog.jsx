import React from 'react'
import { Box, Button, CloseButton, Dialog, Flex, Heading, Portal, SimpleGrid, Stack, Text } from '@chakra-ui/react'

export default function ActivityAnalyticsDialog({
  open,
  onOpenChange,
  projects,
  analytics,
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
            w={{ base: '90vw', md: '700px' }}
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
              <Dialog.Title fontSize="xl" fontWeight="bold">Project Analytics</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" borderWidth="1px" borderColor={dialogBorder} _hover={{ bg: closeHoverBg }} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={0}>
              {projects.length ? (
                <>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spaceX={4} spaceY={4} mb={6}>
                    <Box p={4} bg={bg} borderRadius="md">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Total Views</Text>
                      <Text fontSize="2xl" fontWeight="bold">{analytics.totalViews}</Text>
                    </Box>
                    <Box p={4} bg={bg} borderRadius="md">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Average Views</Text>
                      <Text fontSize="2xl" fontWeight="bold">{analytics.avgViews}</Text>
                    </Box>
                    <Box p={4} bg={bg} borderRadius="md">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Featured Projects</Text>
                      <Text fontSize="2xl" fontWeight="bold">{analytics.featured}</Text>
                    </Box>
                    <Box p={4} bg={bg} borderRadius="md">
                      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.08em">Total Projects</Text>
                      <Text fontSize="2xl" fontWeight="bold">{projects.length}</Text>
                    </Box>
                  </SimpleGrid>

                  <Heading size="sm" mb={3}>Top Viewed Projects</Heading>
                  <Stack spaceY={2}>
                    {analytics.topViewed.map((project) => (
                      <Flex key={project.id || project._id} p={3} bg={bg} borderRadius="md" justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="bold">{project.title}</Text>
                          <Text fontSize="sm" color="fg.muted">{project.category}</Text>
                        </Box>
                        <Text fontWeight="bold" color={accent}>{project.views || 0}</Text>
                      </Flex>
                    ))}
                  </Stack>
                </>
              ) : (
                <Text color="fg.muted">No projects available.</Text>
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
