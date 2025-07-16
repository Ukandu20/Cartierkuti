{/* Create dialog to add, edit and delete projects */}
<Dialog.Root placement="center" scrollBehavior="inside" px={2}>
  <Dialog.Trigger asChild>
    <Button variant="solid" size="lg" onClick={onOpen}>
      Open Dialog
    </Button>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop bg="blackAlpha.600" />
    <Dialog.Positioner>
      <Dialog.Content
        // sizing & scroll
        w={{ base: "90vw", md: "600px" }}
        maxH="85vh"
        overflowY="auto"
        // theming
        bg={colorMode === "light" ? "white" : "gray.700"}
        color={colorMode === "light" ? "gray.800" : "whiteAlpha.900"}
        // decoration
        p={{ base: 4, md: 6 }}
        rounded="lg"
        shadow="lg"
        borderWidth="1px"
        borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.300"}
      >
        <Dialog.Header display="flex" justifyContent="space-between" mb={4}>
          <Dialog.Title fontSize="2xl" fontWeight="bold">
            {editMode ? "Edit Project" : "New Project"}
          </Dialog.Title>
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>
        </Dialog.Header>

        <Dialog.Body px={0}>
          <Fieldset.Root size="lg" maxW="2xl">
            <Stack spaceX={2} spaceY={2} mb={4}>
              <Fieldset.Legend>
                {editMode ? "Edit Project" : "New Project"}
              </Fieldset.Legend>
            </Stack>
            <Fieldset.Content>
              {/* …all your Field.Root blocks here… */}
            </Fieldset.Content>
          </Fieldset.Root>
        </Dialog.Body>

        <Dialog.Footer display="flex" justifyContent="flex-end" mt={6} gap={3}>
          <Dialog.ActionTrigger asChild>
            <Button>Cancel</Button>
          </Dialog.ActionTrigger>
          <Button colorScheme="teal" onClick={onSubmit}>
            {editMode ? "Update" : "Create"}
          </Button>
        </Dialog.Footer>

        <Dialog.CloseTrigger asChild>
          <CloseButton size="sm" position="absolute" top="4" right="4" />
        </Dialog.CloseTrigger>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
