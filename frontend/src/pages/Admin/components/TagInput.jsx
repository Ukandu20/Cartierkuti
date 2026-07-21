import React, { useEffect, useId, useState } from 'react'
import { Badge, Box, CloseButton, Flex, Input, Text } from '@chakra-ui/react'

const parseItems = (value, commitOnComma) => String(value || '')
  .split(commitOnComma ? /[,\n]/ : /\n/)
  .map((item) => item.trim())
  .filter(Boolean)

export default function TagInput({ value, onChange, name, placeholder, ariaLabel, emptyText = 'No items added yet.', delimiter = ', ', commitOnComma = true, suggestions = [], maxItems }) {
  const [draft, setDraft] = useState('')
  const items = parseItems(value, commitOnComma)
  const suggestionsId = useId()

  useEffect(() => {
    if (!value) setDraft('')
  }, [value])

  const commit = (candidate = draft) => {
    const additions = parseItems(candidate, commitOnComma)
    if (!additions.length) return
    const canonicalAdditions = additions.map((addition) => (
      suggestions.find((suggestion) => suggestion.toLowerCase() === addition.toLowerCase()) || addition
    ))
    const next = [...items]
    canonicalAdditions.forEach((addition) => {
      if (!next.some((item) => item.toLowerCase() === addition.toLowerCase()) && (!maxItems || next.length < maxItems)) {
        next.push(addition)
      }
    })
    onChange(next.join(delimiter))
    setDraft('')
  }

  const remove = (item) => {
    onChange(items.filter((candidate) => candidate !== item).join(delimiter))
  }

  return (
    <Box>
      <Flex
        minH="44px"
        gap={2}
        wrap="wrap"
        align="center"
        bg="bg.surface"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="md"
        px={3}
        py={2}
        _focusWithin={{ borderColor: 'brand.focusRing', boxShadow: '0 0 0 1px var(--chakra-colors-brand-focus-ring)' }}
      >
        {items.map((item) => (
          <Badge key={item} variant="subtle" colorPalette="brand" display="inline-flex" alignItems="center" gap={1} pl={3} pr={1} py={1}>
            {item}
            <CloseButton size="2xs" aria-label={`Remove ${item}`} onClick={() => remove(item)} />
          </Badge>
        ))}
        <Input
          name={name}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || (commitOnComma && event.key === ',')) {
              event.preventDefault()
              commit()
            }
            if (event.key === 'Backspace' && !draft && items.length) remove(items.at(-1))
          }}
          onBlur={() => commit()}
          placeholder={items.length ? 'Add another…' : placeholder}
          aria-label={ariaLabel || placeholder}
          list={suggestions.length ? suggestionsId : undefined}
          flex="1 1 150px"
          minW="120px"
          h="28px"
          p={0}
          border="0"
          bg="transparent"
          _focusVisible={{ outline: 'none', boxShadow: 'none' }}
        />
        {suggestions.length ? (
          <datalist id={suggestionsId}>
            {suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}
          </datalist>
        ) : null}
      </Flex>
      {!items.length && !draft ? <Text mt={1.5} fontSize="xs" color="fg.muted">{emptyText}</Text> : null}
    </Box>
  )
}
