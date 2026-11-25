import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { useProjectFavorites } from './useProjectFavorites'

beforeEach(() => {
  const values = new Map()
  vi.stubGlobal('localStorage', {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  })
})

it('shares favorites between mounted views and restores them after navigation', () => {
  const home = renderHook(() => useProjectFavorites())
  const portfolio = renderHook(() => useProjectFavorites())
  act(() => home.result.current.toggleFavorite('project-1'))
  expect(portfolio.result.current.favorites).toEqual(['project-1'])
  home.unmount()
  portfolio.unmount()
  const reopened = renderHook(() => useProjectFavorites())
  expect(reopened.result.current.favorites).toEqual(['project-1'])
  act(() => reopened.result.current.toggleFavorite('project-1'))
  expect(reopened.result.current.favorites).toEqual([])
})
