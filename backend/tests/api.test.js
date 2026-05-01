import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../src/app.js'
import Project from '../src/models/project.model.js'

let mongo
let token

const uploadStreamMock = vi.hoisted(() => vi.fn())

vi.mock('../src/config/cloudinary.js', () => ({
  default: {
    uploader: {
      upload_stream: uploadStreamMock,
    },
  },
}))

const validProject = {
  category: 'Web Development',
  title: 'Portfolio API',
  description: 'A hardened portfolio project API.',
  languages: ['JavaScript', 'Node.js'],
  status: 'Completed',
  tags: ['api', 'portfolio'],
  metadata: 'Production hardening sample',
  externalLink: 'https://example.com/project',
  githubLink: 'https://github.com/example/project',
  liveDemoLink: 'https://demo.example.com',
  imageUrl: 'https://example.com/image.png',
  featured: true,
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.ADMIN_USERNAME = 'admin'
  process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-password', 10)
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_TOKEN_TTL = '30m'
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'

  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
}, 60_000)

beforeEach(async () => {
  uploadStreamMock.mockReset()
  uploadStreamMock.mockImplementation((_options, callback) => ({
    end: () => callback(null, {
      secure_url: 'https://res.cloudinary.com/test/raw/upload/cartierkuti/resume/resume.pdf',
    }),
  }))

  await mongoose.connection.db.dropDatabase()
  const login = await request(app)
    .post('/api/admin/login')
    .send({ username: 'admin', password: 'correct-password' })
  token = login.body.token
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongo?.stop()
})

describe('admin auth', () => {
  it('logs in with valid credentials and verifies the token', async () => {
    const login = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correct-password' })
      .expect(200)

    expect(login.body.token).toBeTruthy()
    expect(login.body.user).toEqual({ username: 'admin', role: 'admin' })

    await request(app)
      .get('/api/admin/verify')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200)
  })

  it('rejects invalid credentials and missing bearer tokens', async () => {
    await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'wrong' })
      .expect(401)

    const missingToken = await request(app).post('/api/projects').send(validProject).expect(401)
    expect(missingToken.body).toEqual({ message: 'Missing bearer token' })
  })
})

describe('project API', () => {
  it('creates, updates, and deletes a project with admin auth', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(validProject)
      .expect(200)

    expect(created.body.title).toBe(validProject.title)
    expect(created.body.featured).toBe(true)

    const updated = await request(app)
      .put(`/api/projects/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Portfolio API' })
      .expect(200)

    expect(updated.body.title).toBe('Updated Portfolio API')

    await request(app)
      .delete(`/api/projects/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  it('rejects malformed project bodies and bad ObjectIds', async () => {
    const invalidProject = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validProject, externalLink: 'not-a-url' })
      .expect(400)
    expect(invalidProject.body.message).toBe('Validation failed')
    expect(invalidProject.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'externalLink',
          message: 'Invalid url',
        }),
      ])
    )

    const badId = await request(app).get('/api/projects/not-an-id').expect(400)
    expect(badId.body).toMatchObject({
      message: 'Validation failed',
      errors: [
        {
          path: 'id',
          message: 'Invalid Mongo ObjectId',
        },
      ],
    })
  })
})

describe('reviews and resume', () => {
  it('validates public review submissions', async () => {
    const project = await Project.create(validProject)

    await request(app)
      .post(`/api/projects/${project._id}/reviews`)
      .send({ stars: 5, comment: 'Strong work.' })
      .expect(200)

    await request(app)
      .post(`/api/projects/${project._id}/reviews`)
      .send({ stars: 9, comment: 'Invalid score.' })
      .expect(400)
  })

  it('updates resume with admin auth and rejects invalid payloads', async () => {
    await request(app)
      .put('/api/resume')
      .set('Authorization', `Bearer ${token}`)
      .send({
        headline: 'Data analyst',
        summary: 'Security-minded analytics work.',
        highlights: ['Dashboards'],
        metrics: [{ label: 'Projects', value: '20+', note: 'Delivered' }],
        experience: [],
        education: [],
        certifications: [],
        skills: { primary: ['Python'], secondary: ['React'], tools: ['Git'] },
      })
      .expect(200)

    await request(app)
      .put('/api/resume')
      .set('Authorization', `Bearer ${token}`)
      .send({ headline: 42 })
      .expect(400)
  })

  it('uploads the downloadable resume PDF with admin auth', async () => {
    const uploaded = await request(app)
      .post('/api/resume/file')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.from('%PDF-1.4 test'), {
        filename: 'Preston-Resume.pdf',
        contentType: 'application/pdf',
      })
      .expect(200)

    expect(uploaded.body).toMatchObject({
      resumeFileUrl: 'https://res.cloudinary.com/test/raw/upload/cartierkuti/resume/resume.pdf',
      resumeFileName: 'Preston-Resume.pdf',
    })
    expect(uploadStreamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        public_id: 'resume.pdf',
        resource_type: 'raw',
      }),
      expect.any(Function),
    )

    const resume = await request(app).get('/api/resume').expect(200)
    expect(resume.body.resumeFileUrl).toBe(uploaded.body.resumeFileUrl)
    expect(resume.body.resumeFileName).toBe('Preston-Resume.pdf')
    expect(resume.body.resumeFileUpdatedAt).toBeTruthy()

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(Buffer.from('%PDF-1.4 test')),
    })

    const downloaded = await request(app).get('/api/resume/file/download').expect(200)
    expect(downloaded.headers['content-type']).toMatch(/application\/pdf/)
    expect(downloaded.headers['content-disposition']).toBe('attachment; filename="Preston-Resume.pdf"')
    expect(fetchMock).toHaveBeenCalledWith(uploaded.body.resumeFileUrl)
    fetchMock.mockRestore()
  })

  it('rejects unauthorized, missing, non-PDF, and oversized resume uploads', async () => {
    await request(app)
      .post('/api/resume/file')
      .attach('resume', Buffer.from('%PDF-1.4 test'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      })
      .expect(401)

    await request(app)
      .post('/api/resume/file')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    await request(app)
      .post('/api/resume/file')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.from('not a pdf'), {
        filename: 'resume.txt',
        contentType: 'text/plain',
      })
      .expect(400)

    await request(app)
      .post('/api/resume/file')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.alloc((5 * 1024 * 1024) + 1), {
        filename: 'large-resume.pdf',
        contentType: 'application/pdf',
      })
      .expect(400)
  })
})
