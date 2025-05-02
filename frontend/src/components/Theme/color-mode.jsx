'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import { chakra, IconButton, Skeleton } from '@chakra-ui/react'
import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'
import { useState, useEffect } from 'react'

// 1) Client-only guard
function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? children : fallback
}

// 2) Chakra span primitive
const Span = chakra('span')

// 3) ThemeProvider wrapper
export function ColorModeProvider(props) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="system"
      {...props}
    />
  )
}

// 4) Hooks
export function useColorMode() {
  const { resolvedTheme = 'light', setTheme } = useTheme()
  const toggleColorMode = () =>
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue(light, dark) {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}

// 5) Icon + Button
export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />
}

export const ColorModeButton = React.forwardRef(function (props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        ref={ref}
        size="sm"
        variant="ghost"
        onClick={toggleColorMode}
        aria-label="Toggle color mode"
        icon={<ColorModeIcon size="1.25rem" />}
        {...props}
      />
    </ClientOnly>
  )
})

// 6) Light/Dark wrappers
export const LightMode = React.forwardRef((props, ref) => (
  <Span ref={ref} className="light" display="contents" {...props} />
))
export const DarkMode = React.forwardRef((props, ref) => (
  <Span ref={ref} className="dark" display="contents" {...props} />
))
