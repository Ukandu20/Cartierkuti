import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createCorsMiddleware, parseAllowedOrigins } from '../src/config/cors.js'

const buildCorsApp = (options) => {
  const app = express()
  app.use(createCorsMiddleware(options))
  app.get('/health', (_req, res) => res.json({ ok: true }))
  app.use((err, _req, res, _next) => {
    res.status(500).json({ message: err.message })
  })
  return app
}

describe('CORS configuration', () => {
  it('allows a configured origin', async () => {
    const app = buildCorsApp({
      clientUrl: 'https://portfolio.example.com',
      nodeEnv: 'production',
    })

    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://portfolio.example.com')
      .expect(200)

    expect(response.headers['access-control-allow-origin']).toBe('https://portfolio.example.com')
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })

  it('rejects an unapproved browser origin', async () => {
    const app = buildCorsApp({
      clientUrl: 'https://portfolio.example.com',
      nodeEnv: 'production',
    })

    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://attacker.example.com')
      .expect(500)

    expect(response.body.message).toMatch(/not allowed by cors/i)
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('requires CLIENT_URL in production', () => {
    expect(() => parseAllowedOrigins('', 'production')).toThrow(/CLIENT_URL is required/)
  })

  it('keeps localhost defaults outside production', () => {
    expect(parseAllowedOrigins('', 'test')).toEqual([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ])
  })
})
