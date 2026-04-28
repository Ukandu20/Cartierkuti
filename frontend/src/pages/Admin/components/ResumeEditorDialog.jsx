import React from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Fieldset,
  Flex,
  Input,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'

export default function ResumeEditorDialog({
  open,
  onOpenChange,
  resumeForm,
  setResumeForm,
  resumeLoading,
  saveResume,
  onCancel,
  addMetric,
  updateMetric,
  removeMetric,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addCertification,
  updateCertification,
  removeCertification,
  bg,
  dialogBg,
  dialogBorder,
  closeHoverBg,
}) {
  return (
    <Dialog.Root placement="center" open={open} onOpenChange={onOpenChange} scrollBehavior="inside">
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <Dialog.Positioner>
          <Dialog.Content
            w={{ base: '98vw', md: '1100px', lg: '1200px' }}
            maxW="none"
            minW={{ md: '900px' }}
            maxH="88vh"
            overflowY="auto"
            bg={dialogBg}
            color="fg.default"
            p={{ base: 5, md: 8 }}
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
              <Dialog.Title fontSize="2xl" fontWeight="bold">Resume Editor</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" borderWidth="1px" borderColor={dialogBorder} _hover={{ bg: closeHoverBg }} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={0}>
              {resumeLoading ? (
                <Text color="fg.muted">Loading resume...</Text>
              ) : (
                <Fieldset.Root size="lg">
                  <Fieldset.Content gap={4}>
                    <Field.Root>
                      <Field.Label>Headline</Field.Label>
                      <Input
                        value={resumeForm.headline}
                        onChange={(event) => setResumeForm((current) => ({ ...current, headline: event.target.value }))}
                        px={3}
                        py={2}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Summary</Field.Label>
                      <Textarea
                        value={resumeForm.summary}
                        onChange={(event) => setResumeForm((current) => ({ ...current, summary: event.target.value }))}
                        px={3}
                        py={2}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Highlights (one per line)</Field.Label>
                      <Textarea
                        value={resumeForm.highlightsText}
                        onChange={(event) => setResumeForm((current) => ({ ...current, highlightsText: event.target.value }))}
                        px={3}
                        py={2}
                      />
                    </Field.Root>

                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="bold">Metrics</Text>
                        <Button size="xs" onClick={addMetric}>Add</Button>
                      </Flex>
                      <Stack gap={4}>
                        {resumeForm.metrics.map((metric, index) => (
                          <Box key={`metric-${index}`} p={4} bg={bg} borderRadius="md">
                            <SimpleGrid columns={{ base: 1, md: 4 }} gap={5} alignItems="center">
                              <Input placeholder="Label" value={metric.label} onChange={(event) => updateMetric(index, 'label', event.target.value)} px={3} py={2} />
                              <Input placeholder="Value" value={metric.value} onChange={(event) => updateMetric(index, 'value', event.target.value)} px={3} py={2} />
                              <Input placeholder="Note" value={metric.note} onChange={(event) => updateMetric(index, 'note', event.target.value)} px={3} py={2} />
                              <Button size="xs" variant="outline" onClick={() => removeMetric(index)}>Remove</Button>
                            </SimpleGrid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="bold">Experience</Text>
                        <Button size="xs" onClick={addExperience}>Add</Button>
                      </Flex>
                      <Stack gap={5}>
                        {resumeForm.experience.map((item, index) => (
                          <Box key={`exp-${index}`} p={5} bg={bg} borderRadius="md">
                            <Flex justify="space-between" align="center" mb={3}>
                              <Text fontWeight="bold">Entry {index + 1}</Text>
                              <Button size="xs" variant="ghost" onClick={() => removeExperience(index)}>Remove</Button>
                            </Flex>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                              <Field.Root><Field.Label>Role</Field.Label><Input value={item.role} onChange={(event) => updateExperience(index, 'role', event.target.value)} px={3} py={2} /></Field.Root>
                              <Field.Root><Field.Label>Company</Field.Label><Input value={item.company} onChange={(event) => updateExperience(index, 'company', event.target.value)} px={3} py={2} /></Field.Root>
                              <Field.Root><Field.Label>Location</Field.Label><Input value={item.location} onChange={(event) => updateExperience(index, 'location', event.target.value)} px={3} py={2} /></Field.Root>
                              <Field.Root><Field.Label>Period</Field.Label><Input value={item.period} onChange={(event) => updateExperience(index, 'period', event.target.value)} px={3} py={2} /></Field.Root>
                            </SimpleGrid>
                            <Field.Root mt={3}>
                              <Field.Label>Highlights (one per line)</Field.Label>
                              <Textarea value={item.bulletsText} onChange={(event) => updateExperience(index, 'bulletsText', event.target.value)} px={3} py={2} />
                            </Field.Root>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="bold">Education</Text>
                        <Button size="xs" onClick={addEducation}>Add</Button>
                      </Flex>
                      <Stack gap={5}>
                        {resumeForm.education.map((item, index) => (
                          <Box key={`edu-${index}`} p={5} bg={bg} borderRadius="md">
                            <Flex justify="space-between" align="center" mb={3}>
                              <Text fontWeight="bold">Entry {index + 1}</Text>
                              <Button size="xs" variant="ghost" onClick={() => removeEducation(index)}>Remove</Button>
                            </Flex>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                              <Field.Root><Field.Label>School</Field.Label><Input value={item.school} onChange={(event) => updateEducation(index, 'school', event.target.value)} px={3} py={2} /></Field.Root>
                              <Field.Root><Field.Label>Degree</Field.Label><Input value={item.degree} onChange={(event) => updateEducation(index, 'degree', event.target.value)} px={3} py={2} /></Field.Root>
                              <Field.Root><Field.Label>Period</Field.Label><Input value={item.period} onChange={(event) => updateEducation(index, 'period', event.target.value)} px={3} py={2} /></Field.Root>
                            </SimpleGrid>
                            <Field.Root mt={3}>
                              <Field.Label>Highlights (one per line)</Field.Label>
                              <Textarea value={item.bulletsText} onChange={(event) => updateEducation(index, 'bulletsText', event.target.value)} px={3} py={2} />
                            </Field.Root>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="bold">Certifications</Text>
                        <Button size="xs" onClick={addCertification}>Add</Button>
                      </Flex>
                      <Stack gap={4}>
                        {resumeForm.certifications.map((item, index) => (
                          <Box key={`cert-${index}`} p={4} bg={bg} borderRadius="md">
                            <SimpleGrid columns={{ base: 1, md: 4 }} gap={5} alignItems="center">
                              <Input placeholder="Name" value={item.name} onChange={(event) => updateCertification(index, 'name', event.target.value)} px={3} py={2} />
                              <Input placeholder="Issuer" value={item.issuer} onChange={(event) => updateCertification(index, 'issuer', event.target.value)} px={3} py={2} />
                              <Input placeholder="Year" value={item.year} onChange={(event) => updateCertification(index, 'year', event.target.value)} px={3} py={2} />
                              <Button size="xs" variant="outline" onClick={() => removeCertification(index)}>Remove</Button>
                            </SimpleGrid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Field.Root>
                      <Field.Label>Primary Skills (one per line)</Field.Label>
                      <Textarea value={resumeForm.skillsPrimaryText} onChange={(event) => setResumeForm((current) => ({ ...current, skillsPrimaryText: event.target.value }))} px={3} py={2} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Secondary Skills (one per line)</Field.Label>
                      <Textarea value={resumeForm.skillsSecondaryText} onChange={(event) => setResumeForm((current) => ({ ...current, skillsSecondaryText: event.target.value }))} px={3} py={2} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Tools (one per line)</Field.Label>
                      <Textarea value={resumeForm.skillsToolsText} onChange={(event) => setResumeForm((current) => ({ ...current, skillsToolsText: event.target.value }))} px={3} py={2} />
                    </Field.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
              )}
            </Dialog.Body>

            <Dialog.Footer display="flex" justifyContent="flex-end" mt={4}>
              <ButtonGroup gap={3}>
                <Button variant="solid" onClick={saveResume}>Save Resume</Button>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              </ButtonGroup>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
