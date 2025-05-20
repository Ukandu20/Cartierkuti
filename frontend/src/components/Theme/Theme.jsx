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
      light: { value: '#ffffff' },
      dark:  { value: '#1D242D' },
    },

    /* hard-coded text tones */
    text: {
      light:  { value: '#1D242D' },
      dark:   { value: '#E4E4E4' },
      muted:  { value: '#6B7280' },
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
        _dark: '{colors.text.light}',
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
  baseStyle: {
    fontWeight: 'bold',
    borderRadius: 'lg',
    transition: 'all 0.2s ease',
  },

  variants: {
    variant: {
      solid: {
        bg: 'brand.500',
        color: 'button.inverse',
        _hover:  { bg: 'brand.600' },
        _active: { bg: 'brand.700' },
      },

      outline: {
        border: '2px solid',
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: {
            base: 'brand.50',
            _dark: 'brand.900',
          },
        },
      },

      link: {
        bg: 'transparent',
        color: 'brand.500',
        _hover: { textDecoration: 'none', color: 'brand.600' },
      },

      favourite: {
        bg: 'transparent',
        color: 'red.500',
        _hover:  {
          transform: 'scale(1.15) rotate(-2deg)',
          color: 'red.600',
        },
        _active: { transform: 'scale(1.1)' },
      },
    },

    size: {
      sm:   { px: 3, py: 2, fontSize: 'sm' },
      md:   { px: 5, py: 3, fontSize: 'md' },
      lg:   { px: 6, py: 4, fontSize: 'md' },
      icon: { p: 2, h: 'auto', w: 'auto' },
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
const config = defineConfig({
  /* colour-mode behaviour */
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },

  theme: {
    tokens,
    semanticTokens,
    recipes: {
      button: buttonRecipe,
    },
  },

  globalCss,
})

export const system = createSystem(defaultConfig, config)
