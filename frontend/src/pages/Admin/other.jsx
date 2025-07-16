        
{/* Create / Edit Dialog */}
        <Dialog.Root open={isCreateOpen} onOpenChange={setCreateOpen} placement="center">
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>{editMode ? 'Edit Project' : 'New Project'}</Dialog.Title>
                  <Dialog.CloseTrigger asChild><CloseButton /></Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body>
                  <Fieldset.Root size="lg" maxW="xl">
                    <Stack spaceX={2} spaceY={4} mb={4}>
                      <Fieldset.Legend>{editMode ? 'Edit Project' : 'New Project'}</Fieldset.Legend>
                    </Stack>
                    <Fieldset.Content>
                      <Field.Root>
                        <Field.Label>Title</Field.Label>
                        <Input name="title" value={formData.title} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Description</Field.Label>
                        <Textarea name="description" value={formData.description} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Category</Field.Label>
                        <Input name="category" value={formData.category} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Languages (csv)</Field.Label>
                        <Input name="languages" value={formData.languages} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Tags (csv)</Field.Label>
                        <Input name="tags" value={formData.tags} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Status</Field.Label>
                        <Input name="status" value={formData.status} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Date</Field.Label>
                        <Input type="date" name="date" value={formData.date} onChange={onChange} />
                      </Field.Root>
                      <Field.Root>
                        <Checkbox name="featured" isChecked={formData.featured} onChange={onChange}>
                          Featured
                        </Checkbox>
                      </Field.Root>
                    </Fieldset.Content>
                  </Fieldset.Root>
                </Dialog.Body>

                <Dialog.Footer>
                  <Dialog.CloseTrigger asChild><Button>Cancel</Button></Dialog.CloseTrigger>
                  <Dialog.ActionTrigger asChild>
                    <Button colorScheme="teal" onClick={onSubmit}>
                      {editMode ? 'Update' : 'Create'}
                    </Button>
                  </Dialog.ActionTrigger>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Delete Confirmation Dialog */}
        <Dialog.Root
          open={isDeleteOpen}
          onOpenChange={setDeleteOpen}
          placement="center"
          role="alertdialog"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete Project?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  Are you sure you want to delete “{toDelete?.title}”?
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <Button ref={cancelRef}>Cancel</Button>
                  </Dialog.CloseTrigger>
                  <Dialog.ActionTrigger asChild>
                    <Button colorScheme="red" onClick={doDelete}>Delete</Button>
                  </Dialog.ActionTrigger>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>