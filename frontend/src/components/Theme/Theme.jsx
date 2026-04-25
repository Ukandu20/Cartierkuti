/* ────────────────────────────────────────────────────────────────
   Theme.jsx  —  Chakra UI v3 “System” theme (Button via recipe only)
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

    /* foreground inside solid brand buttons */
    'button.inverse': {
      value: {
        base: '{colors.background.light}',
        _dark: '{colors.background.dark}',
      },
    },
  },
}

/* ------------------------------------------------------------------
 * 3 ·  Button recipe (CVA utility class + drives <Button>)
 * ----------------------------------------------------------------- */
const buttonRecipe = defineRecipe({
  className: 'chakra-button',
  base: {
    display: 'inline-flex',
    appearance: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    position: 'relative',
    paddingInline: '1rem',
    paddingBlock: '0.5rem',
    borderRadius: 'lg',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    borderWidth: '1px',
    borderColor: 'transparent',
    cursor: 'button',
    flexShrink: '0',
    outline: '0',
    lineHeight: '1.2',
    isolation: 'isolate',
    fontWeight: 'bold',
    transitionProperty: 'common',
    transitionDuration: 'moderate',
    focusVisibleRing: 'outside',
    _disabled: { opacity: 0.6, cursor: 'not-allowed' },
    _icon: { flexShrink: '0' },
  },

  variants: {
    size: {
      '2xs': {
        h: '6',
        minW: '6',
        textStyle: 'xs',
        px: '2',
        gap: '1',
        _icon: { width: '3.5', height: '3.5' },
      },
      xs: {
        h: '8',
        minW: '8',
        textStyle: 'xs',
        px: '2.5',
        gap: '1',
        _icon: { width: '4', height: '4' },
      },
      sm: {
        h: '9',
        minW: '9',
        px: '3.5',
        textStyle: 'sm',
        gap: '2',
        _icon: { width: '4', height: '4' },
      },
      md: {
        h: '10',
        minW: '10',
        textStyle: 'sm',
        px: '4',
        gap: '2',
        _icon: { width: '5', height: '5' },
      },
      lg: {
        h: '11',
        minW: '11',
        textStyle: 'md',
        px: '5',
        gap: '3',
        _icon: { width: '5', height: '5' },
      },
      xl: {
        h: '12',
        minW: '12',
        textStyle: 'md',
        px: '5',
        gap: '2.5',
        _icon: { width: '5', height: '5' },
      },
      '2xl': {
        h: '16',
        minW: '16',
        textStyle: 'lg',
        px: '7',
        gap: '3',
        _icon: { width: '6', height: '6' },
      },
      icon: { h: '10', w: '10', minW: '10', p: '0', _icon: { width: '5', height: '5' } },
    },

    variant: {
      solid: {
        bg: 'brand.500',
        color: 'button.inverse',
        borderColor: 'transparent',
        _hover: { bg: 'brand.600' },
        _expanded: { bg: 'brand.600' },
        _active: { bg: 'brand.700' },
      },
      subtle: {
        bg: { base: 'brand.50', _dark: 'brand.900' },
        color: 'brand.600',
        borderColor: 'transparent',
        _hover: { bg: { base: 'brand.100', _dark: 'brand.800' } },
        _expanded: { bg: { base: 'brand.100', _dark: 'brand.800' } },
      },
      surface: {
        bg: { base: 'brand.50', _dark: 'brand.900' },
        color: 'brand.600',
        shadow: '0 0 0px 1px var(--shadow-color)',
        shadowColor: 'brand.200',
        _hover: { bg: { base: 'brand.100', _dark: 'brand.800' } },
        _expanded: { bg: { base: 'brand.100', _dark: 'brand.800' } },
      },
      outline: {
        borderWidth: '2px',
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: { bg: { base: 'brand.50', _dark: 'brand.900' } },
        _expanded: { bg: { base: 'brand.50', _dark: 'brand.900' } },
      },
      ghost: {
        bg: 'transparent',
        color: 'brand.500',
        _hover: { bg: { base: 'brand.50', _dark: 'brand.900' } },
        _expanded: { bg: { base: 'brand.50', _dark: 'brand.900' } },
      },
      plain: {
        color: 'brand.500',
      },
      link: {
        bg: 'transparent',
        color: 'brand.500',
        _hover: { textDecoration: 'none', color: 'brand.600' },
      },
      favourite: {
        bg: 'transparent',
        color: 'red.500',
        _hover: { transform: 'scale(1.15) rotate(-2deg)', color: 'red.600' },
        _active: { transform: 'scale(1.1)' },
      },
    },
  },

  defaultVariants: {
    variant: 'solid',
    size: 'sm',
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
    recipes: {
      button: buttonRecipe,
    },
  },

  globalCss,
})

export const system = createSystem(defaultConfig, config)
