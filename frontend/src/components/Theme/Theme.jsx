/* ────────────────────────────────────────────────────────────────
   Theme.jsx  —  Chakra UI v3 “System” theme
   Fully dark-mode–aware | no truncation
   ──────────────────────────────────────────────────────────────── */

import {
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react'

/* ------------------------------------------------------------------
 * 1 ·  Static design-tokens  (never swap automatically)
 * ----------------------------------------------------------------- */
const tokens = {
  colors: {
    brand: {
      50:  { value: '#e0fcfa' },
      100: { value: '#b2f4f0' },
      200: { value: '#80e9e6' },
      300: { value: '#4ededa' },
      400: { value: '#23d4d0' },
      500: { value: '#05e2d7' },
      600: { value: '#02c7be' },
      700: { value: '#029ca0' },
      800: { value: '#027274' },
      900: { value: '#014948' },
    },

    /* hard-coded surfaces */
    background: {
      light: { value: '#F6F4F1' },
      dark:  { value: '#141414' },
    },

    surface: {
      light: { value: '#FFFFFF' },
      dark:  { value: '#1B1B1B' },
      subtleLight: { value: '#FBFAF8' },
      subtleDark:  { value: '#1E1E1E' },
    },

    border: {
      light: { value: '#E2DED8' },
      dark:  { value: '#2A2A2A' },
    },

    status: {
      success: { value: '#15803D' },
      warning: { value: '#B45309' },
      error:   { value: '#B91C1C' },
      info:    { value: '#1D4ED8' },
    },

    /* hard-coded text tones */
    text: {
      light:  { value: '#1A1A1A' },
      dark:   { value: '#F6F4F1' },
      muted:  { value: '#4B4B4B' },
      mutedDark: { value: '#A7A39A' },
    },
  },

  fonts: {
    heading: { value: "'Poppins', sans-serif" },
    body:    { value: "'Poppins', sans-serif" },
  },
}

/* ------------------------------------------------------------------
 * 2 ·  Semantic-tokens  (auto-switch by colour-mode)
 * ----------------------------------------------------------------- */
const semanticTokens = {
  colors: {
    /* page background */
    'bg.canvas': {
      value: {
        base: '{colors.background.light}',
        _dark: '{colors.background.dark}',
      },
    },

    /* default text colour */
    'fg.default': {
      value: {
        base: '{colors.text.light}',
        _dark: '{colors.text.dark}',
      },
    },

    /* muted / secondary text */
    'fg.muted': {
      value: {
        base: '{colors.text.muted}',
        _dark: '{colors.text.mutedDark}',
      },
    },

    /* status text */
    'fg.success': {
      value: { base: '#166534', _dark: '#4ADE80' },
    },
    'fg.warning': {
      value: { base: '#92400E', _dark: '#FBBF24' },
    },
    'fg.error': {
      value: { base: '#991B1B', _dark: '#FCA5A5' },
    },
    'fg.info': {
      value: { base: '#1E40AF', _dark: '#93C5FD' },
    },

    /* status backgrounds */
    'bg.success': {
      value: { base: '#ECFDF3', _dark: '#0F1F14' },
    },
    'bg.warning': {
      value: { base: '#FFFBEB', _dark: '#1F170B' },
    },
    'bg.error': {
      value: { base: '#FEF2F2', _dark: '#210D0D' },
    },
    'bg.info': {
      value: { base: '#EFF6FF', _dark: '#0B1321' },
    },

    /* status borders */
    'border.success': {
      value: { base: '#BBF7D0', _dark: '#14532D' },
    },
    'border.warning': {
      value: { base: '#FDE68A', _dark: '#78350F' },
    },
    'border.error': {
      value: { base: '#FECACA', _dark: '#7F1D1D' },
    },
    'border.info': {
      value: { base: '#BFDBFE', _dark: '#1E3A8A' },
    },

    /* surfaces */
    'bg.surface': {
      value: {
        base: '{colors.surface.light}',
        _dark: '{colors.surface.dark}',
      },
    },

    'bg.subtle': {
      value: {
        base: '{colors.surface.subtleLight}',
        _dark: '{colors.surface.subtleDark}',
      },
    },

    /* borders */
    'border.subtle': {
      value: {
        base: '{colors.border.light}',
        _dark: '{colors.border.dark}',
      },
    },
  },
}

/* ------------------------------------------------------------------
 * 4 ·  Global styles (use semantic aliases)
 * ----------------------------------------------------------------- */
const globalCss = {
  '*': { boxSizing: 'border-box' },

  body: {
    fontFamily: 'body',
    bg: 'bg.canvas',
    color: 'fg.default',
    lineHeight: 1.6,
    minHeight: '100vh',
    transition: 'background-color .3s ease, color .3s ease',
  },

  a: {
    textDecoration: 'none',
    color: 'inherit',
    transition: 'color .2s ease',
    _hover: { color: 'brand.500' },
  },

  img: { maxWidth: '100%', height: 'auto', display: 'block' },

  h1: { fontWeight: '700', fontSize: '2.5rem', lineHeight: '1.2' },
  h2: { fontWeight: '700', fontSize: '2rem',   lineHeight: '1.2' },

  p: { color: 'fg.muted', mb: 4 },
}

/* ------------------------------------------------------------------
 * 5 ·  Assemble & export System object
 * ----------------------------------------------------------------- */
const baseTokens = defaultConfig.theme?.tokens ?? {}
const mergedTokens = {
  ...baseTokens,
  colors: { ...baseTokens.colors, ...tokens.colors },
  fonts: { ...baseTokens.fonts, ...tokens.fonts },
}

const config = defineConfig({
  /* colour-mode behaviour */
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },

  theme: {
    tokens: mergedTokens,
    semanticTokens,
  },

  globalCss,
})

export const system = createSystem(defaultConfig, config)
