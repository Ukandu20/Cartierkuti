// src/Theme.jsx
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const chakraConfig = defineConfig({
  // 1️⃣ Color mode settings
  theme: {
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },
    // 2️⃣ Your design tokens must be wrapped in `{ value: ... }`
    tokens: {
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
        background: {
          light: { value: '#ffffff' },
          dark:  { value: '#1D242D'  },
        },
        text: {
          default: { value: '#1D242D' },
          muted:   { value: '#6B7280' },
        },
        primary:   { value: '#4F46E5' },
        secondary: { value: '#6366F1' },
      },
      fonts: {
        heading: { value: "'Poppins', sans-serif" },
        body:    { value: "'Poppins', sans-serif" },
      },
    },
  },

  // 3️⃣ Global styles
  globalCss: {
    '*': {
      boxSizing: 'border-box',
    },
    body: {
      fontFamily: 'body',
      bg:            '{colors.background.light}',
      color:         '{colors.text.default}',
      transition:    'background-color 0.3s ease, color 0.3s ease',
      lineHeight:    '1.6',
      minHeight:     '100vh',
    },
    a: {
      textDecoration: 'none',
      color:          'inherit',
      transition:     'color 0.2s ease',
      _hover:         { color: '{colors.brand.500}' },
    },
    img: {
      maxWidth: '100%',
      height:   'auto',
      display:  'block',
    },
    h1: {
      fontWeight: '700',
      fontSize:   '2.5rem',
      color:      '{colors.text.default}',
      lineHeight: '1.2',
    },
    h2: {
      fontWeight: '700',
      fontSize:   '2rem',
      color:      '{colors.text.default}',
      lineHeight: '1.2',
    },
    p: {
      color: '{colors.text.muted}',
      mb:    '1rem',
    },
  },
})

export const system = createSystem(defaultConfig, chakraConfig)
