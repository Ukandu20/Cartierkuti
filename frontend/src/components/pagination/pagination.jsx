// src/components/PaginationControls.jsx
import React from 'react'
import {
  Pagination as ChakraPagination,
  ButtonGroup,
  IconButton,
} from '@chakra-ui/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export default function PaginationControls({
  count,
  pageSize,
  page,
  onPageChange,
  variant = 'outline',
  size = 'sm',
}) {
  return (
    <ChakraPagination.Root
      count={count}
      pageSize={pageSize}
      page={page}
      onPageChange={e => onPageChange(e.page)}
    >
      <ButtonGroup variant={variant} size={size} gap={2}>
        <ChakraPagination.PrevTrigger asChild>
          <IconButton aria-label="Previous">
            <HiChevronLeft />
          </IconButton>
        </ChakraPagination.PrevTrigger>

        <ChakraPagination.Items
          render={pageObj => (
            <IconButton
              key={pageObj.value}
              variant={pageObj.isCurrent ? 'solid' : 'outline'}
              onClick={() => onPageChange(pageObj.value)}
            >
              {pageObj.value}
            </IconButton>
          )}
        />

        <ChakraPagination.NextTrigger asChild>
          <IconButton aria-label="Next">
            <HiChevronRight />
          </IconButton>
        </ChakraPagination.NextTrigger>
      </ButtonGroup>
    </ChakraPagination.Root>
  )
}
