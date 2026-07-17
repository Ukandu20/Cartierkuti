/* ────────────────────────────────────────────────────────────────
   Theme.jsx  —  Chakra UI v3 “System” theme
   Fully dark-mode–aware | no truncation
   ──────────────────────────────────────────────────────────────── */

import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from '@chakra-ui/react'

/* ------------------------------------------------------------------
 * 1 ·  Static design-tokens  (never swap automatically)
 * ----------------------------------------------------------------- */
const tokens = {
  colors: {
    brand: {
      50:  { value: '#F0FDFA' },
      100: { value: '#CCFBF1' },
      200: { value: '#99F6E4' },
      300: { value: '#5EEAD4' },
      400: { value: '#2DD4BF' },
      500: { value: '#0F766E' },
      600: { value: '#0D6861' },
      700: { value: '#115E59' },
      800: { value: '#134E4A' },
      900: { value: '#123A36' },
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
    heading: { value: "'Playfair Display', Georgia, serif" },
    body:    { value: "'Source Sans 3', system-ui, sans-serif" },
    mono:    { value: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  },
}

/* ------------------------------------------------------------------
 * 2 ·  Semantic-tokens  (auto-switch by colour-mode)
 * ----------------------------------------------------------------- */
const semanticTokens = {
  colors: {
    /* One accent contract for every Chakra color-palette component. */
    brand: {
      solid: { value: { _light: '#0F766E', _dark: '#5EEAD4' } },
      contrast: { value: { _light: '#FFFFFF', _dark: '#092B28' } },
      fg: { value: { _light: '#0F766E', _dark: '#5EEAD4' } },
      subtle: { value: { _light: '#DDF3EF', _dark: '#123A36' } },
      muted: { value: { _light: '#BDE8E1', _dark: '#164E48' } },
      emphasized: { value: { _light: '#99D8CF', _dark: '#1F625B' } },
      border: { value: { _light: '#78C6BB', _dark: '#2B7A72' } },
      focusRing: { value: { _light: '#0F766E', _dark: '#5EEAD4' } },
    },

    accent: {
      DEFAULT: { value: { _light: '#0F766E', _dark: '#5EEAD4' } },
      default: { value: { _light: '#0F766E', _dark: '#5EEAD4' } },
      subtle: { value: { _light: '#DDF3EF', _dark: '#123A36' } },
    },
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

    'bg.raised': {
      value: {
        base: '{colors.surface.light}',
        _dark: '#222222',
      },
    },

    'bg.navigation': {
      value: {
        base: 'rgba(246, 244, 241, 0.94)',
        _dark: 'rgba(20, 20, 20, 0.94)',
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

const buttonRecipe = defineRecipe({
  base: {
    borderRadius: 'md',
    fontFamily: 'body',
    fontWeight: '700',
    letterSpacing: '0.01em',
    transitionDuration: 'fast',
    _motionReduce: { transition: 'none' },
  },
})

const fieldRecipe = defineRecipe({
  base: {
    borderRadius: 'md',
    bg: 'bg.surface',
    borderColor: 'border.subtle',
    '--focus-color': 'colors.brand.focusRing',
  },
})

const headingRecipe = defineRecipe({
  base: {
    fontFamily: 'heading',
    fontWeight: '600',
    color: 'fg.default',
    letterSpacing: '-0.02em',
  },
})

const badgeRecipe = defineRecipe({
  base: {
    borderRadius: 'full',
    fontFamily: 'body',
    fontWeight: '600',
  },
})

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
    _hover: { color: 'accent.default' },
  },

  img: { maxWidth: '100%', height: 'auto', display: 'block' },

  '::selection': { bg: 'accent.subtle', color: 'fg.default' },

  ':focus-visible': {
    outlineColor: 'accent.default',
  },

  '[data-admin-shell] .chakra-heading': {
    fontFamily: 'body',
    letterSpacing: '-0.01em',
  },
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
    recipes: {
      button: buttonRecipe,
      input: fieldRecipe,
      textarea: fieldRecipe,
      heading: headingRecipe,
      badge: badgeRecipe,
    },
  },

  globalCss,
})

export const system = createSystem(defaultConfig, config)
