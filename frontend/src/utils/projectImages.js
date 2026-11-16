// Only transform Cloudinary delivery URLs; preserve local and other providers' URLs.
const cloudinaryImage = (value, width) => {
  if (!value) return '/placeholder.svg'
  try {
    const parsed = new URL(value)
    if (parsed.hostname !== 'res.cloudinary.com' || !parsed.pathname.includes('/image/upload/') || parsed.pathname.includes('/s--')) return value
    parsed.pathname = parsed.pathname.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`)
    return parsed.toString()
  } catch {
    return value
  }
}

export function projectImageProps(value, { detail = false, featured = false } = {}) {
  const src = cloudinaryImage(value, detail ? 1600 : 960)
  const transformed = src !== value && Boolean(value)
  return {
    src,
    ...(transformed ? {
      srcSet: [480, 768, 960, 1280, 1600].map(width => `${cloudinaryImage(value, width)} ${width}w`).join(', '),
      sizes: detail ? '(max-width: 768px) 100vw, 1152px' : featured ? '(max-width: 992px) 100vw, 640px' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px',
    } : {}),
    decoding: 'async',
  }
}
