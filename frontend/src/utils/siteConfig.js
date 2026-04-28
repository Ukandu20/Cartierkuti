const rawSiteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

export const siteUrl = rawSiteUrl.replace(/\/$/, '')
export const siteName = 'Preston Ukandu'
export const siteTitle = 'Preston Ukandu | Data Analyst and Security-minded Developer'

export const absoluteUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}
