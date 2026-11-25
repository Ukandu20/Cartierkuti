import { normalizeHomeContent } from './homeContent'

export const suggestedSocialPlatforms = [
  'Instagram', 'Behance', 'LinkedIn', 'GitHub', 'X', 'YouTube', 'TikTok',
  'Facebook', 'Dribbble', 'Pinterest', 'Bluesky', 'Threads', 'Discord', 'Reddit', 'Twitch', 'Medium',
]

export function normalizeFooterContent(footer, home) {
  const legacy = normalizeHomeContent(home)
  const defaults = {
    eyebrow: legacy.ctaEyebrow, title: legacy.ctaTitle, description: legacy.ctaDescription,
    email: 'okechiprest@gmail.com',
  }
  const legacyLinks = [
    ['LinkedIn', 'linkedin', 'https://linkedin.com/in/okechiukandu'],
    ['X', 'x', 'https://x.com/cartierkut1'],
    ['GitHub', 'github', 'https://github.com/ukandu20'],
  ].map(([label, key, fallback]) => ({ label, url: typeof footer?.[key] === 'string' ? footer[key] : fallback })).filter(link => link.url)
  return {
    ...Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, typeof footer?.[key] === 'string' ? footer[key] : value])),
    socialLinks: Array.isArray(footer?.socialLinks)
      ? footer.socialLinks.map(link => ({ label: typeof link?.label === 'string' ? link.label : '', url: typeof link?.url === 'string' ? link.url : '' }))
      : legacyLinks,
  }
}
