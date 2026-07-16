export const editorialFonts = {
  heading: "'Playfair Display', serif",
  body: "'Source Sans 3', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
}

export const getEditorialTokens = (colorMode) => ({
  bg: colorMode === 'light' ? '#F6F4F1' : '#141414',
  surface: colorMode === 'light' ? '#FFFFFF' : '#1B1B1B',
  surfaceAlt: colorMode === 'light' ? '#FBFAF8' : '#222222',
  ink: colorMode === 'light' ? '#1A1A1A' : 'gray.100',
  muted: colorMode === 'light' ? '#4B4B4B' : 'gray.400',
  rule: colorMode === 'light' ? '#E2DED8' : 'gray.700',
  accentData: colorMode === 'light' ? '#0F766E' : '#5EEAD4',
  accentSoft: colorMode === 'light' ? '#DDF3EF' : '#123A36',
})
