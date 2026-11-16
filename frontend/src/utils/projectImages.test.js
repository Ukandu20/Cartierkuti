import { describe, expect, it } from 'vitest'
import { projectImageProps } from './projectImages'

describe('project images', () => {
  it('provides responsive Cloudinary widths with automatic format and quality', () => {
    const image = projectImageProps('https://res.cloudinary.com/demo/image/upload/v123/project.png')
    expect(image.src).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_960/v123/project.png')
    expect(image.srcSet).toContain('w_480/v123/project.png 480w')
    expect(image.srcSet).toContain('w_1600/v123/project.png 1600w')
    expect(image.decoding).toBe('async')
  })

  it('preserves other hosts and local images and provides a real fallback asset', () => {
    expect(projectImageProps('https://example.com/photo.png').src).toBe('https://example.com/photo.png')
    expect(projectImageProps('/photo.png').srcSet).toBeUndefined()
    expect(projectImageProps().src).toBe('/placeholder.svg')
    expect(projectImageProps('https://res.cloudinary.com.evil.test/demo/image/upload/p.png').srcSet).toBeUndefined()
    expect(projectImageProps('https://res.cloudinary.com/demo/image/upload/s--signature--/v1/p.png').srcSet).toBeUndefined()
  })
})
