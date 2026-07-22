import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../src/app.js'
import Project from '../src/models/project.model.js'
import Activity from '../src/models/activity.model.js'
import ArchivedProject from '../src/models/archive.model.js'
import Category from '../src/models/category.model.js'
import AdminUser from '../src/models/admin-user.model.js'
import CredentialResetToken from '../src/models/credential-reset-token.model.js'
import { generateTotpCode } from '../src/services/totp.service.js'
import { migrateProjectClassifications } from '../src/services/project-classification.service.js'

let mongo
let token

const uploadStreamMock = vi.hoisted(() => vi.fn())
const destroyImageMock = vi.hoisted(() => vi.fn())
const securityEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue(true))

vi.mock('../src/config/cloudinary.js', () => ({
  default: {
    uploader: {
      upload_stream: uploadStreamMock,
      destroy: destroyImageMock,
    },
  },
}))

vi.mock('../src/services/security-email.service.js', () => ({
  sendSecurityEmail: securityEmailMock,
}))

const validProject = {
  category: 'Web Applications',
  title: 'Portfolio API',
  description: 'A hardened portfolio project API.',
  methods: ['REST API Design', 'Automated Testing'],
  tools: ['JavaScript', 'Node.js'],
  status: 'Completed',
  tags: ['Portfolio', 'Content Management'],
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
  process.env.ADMIN_RECOVERY_EMAIL = 'owner@example.com'
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_TOKEN_TTL = '30m'
  process.env.CLIENT_URL = 'https://portfolio.example.com'
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'

  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
}, 60_000)

beforeEach(async () => {
  securityEmailMock.mockClear()
  uploadStreamMock.mockReset()
  destroyImageMock.mockReset()
  destroyImageMock.mockResolvedValue({ result: 'ok' })
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

const enableMfa = async (authToken = token, password = 'correct-password') => {
  const setup = await request(app)
    .post('/api/admin/account/mfa/setup')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ currentPassword: password })
    .expect(200)
  const confirmed = await request(app)
    .post('/api/admin/account/mfa/confirm')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ code: generateTotpCode(setup.body.secret) })
    .expect(200)
  return { secret: setup.body.secret, recoveryCodes: confirmed.body.recoveryCodes }
}

const loginWithMfa = async ({ username = 'admin', password = 'correct-password', code }) => {
  const login = await request(app)
    .post('/api/admin/login')
    .send({ username, password })
    .expect(200)
  expect(login.body.mfaRequired).toBe(true)
  const verified = await request(app)
    .post('/api/admin/login/mfa')
    .send({ challengeToken: login.body.challengeToken, code })
    .expect(200)
  return verified.body.token
}

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

  it('changes credentials only after current-password verification and invalidates existing sessions', async () => {
    const { secret } = await enableMfa()
    token = await loginWithMfa({ code: generateTotpCode(secret) })

    await request(app)
      .post('/api/admin/account/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrong-password', newUsername: 'portfolio-owner' })
      .expect(401)

    await request(app)
      .post('/api/admin/account/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'correct-password',
        newUsername: 'portfolio-owner',
        newPassword: 'a-new-secure-password',
        confirmPassword: 'a-new-secure-password',
        mfaCode: generateTotpCode(secret),
      })
      .expect(200)

    await request(app)
      .get('/api/admin/verify')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correct-password' })
      .expect(401)

    const newToken = await loginWithMfa({
      username: 'portfolio-owner',
      password: 'a-new-secure-password',
      code: generateTotpCode(secret),
    })
    expect(newToken).toBeTruthy()
    expect(securityEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'owner@example.com',
      subject: expect.stringContaining('credentials changed'),
    }))
  }, 15_000)

  it('enrolls TOTP, requires it at login, and consumes recovery codes once', async () => {
    const { secret, recoveryCodes } = await enableMfa()
    expect(recoveryCodes).toHaveLength(8)

    await request(app)
      .get('/api/admin/verify')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    const firstToken = await loginWithMfa({ code: generateTotpCode(secret) })
    expect(firstToken).toBeTruthy()

    const recoveryLogin = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correct-password' })
      .expect(200)
    await request(app)
      .post('/api/admin/login/mfa')
      .send({ challengeToken: recoveryLogin.body.challengeToken, code: recoveryCodes[0] })
      .expect(200)
    await request(app)
      .post('/api/admin/login/mfa')
      .send({ challengeToken: recoveryLogin.body.challengeToken, code: recoveryCodes[0] })
      .expect(401)

    await request(app)
      .delete('/api/admin/account/mfa')
      .set('Authorization', `Bearer ${firstToken}`)
      .send({ currentPassword: 'correct-password', code: generateTotpCode(secret) })
      .expect(200)
    await request(app)
      .get('/api/admin/verify')
      .set('Authorization', `Bearer ${firstToken}`)
      .expect(401)
    const loginWithoutMfa = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correct-password' })
      .expect(200)
    expect(loginWithoutMfa.body.token).toBeTruthy()
  })

  it('resets a forgotten password with a hashed, expiring, single-use token', async () => {
    const generic = await request(app)
      .post('/api/admin/recovery/password/request')
      .send({ email: 'owner@example.com' })
      .expect(202)

    expect(generic.body.message).not.toContain('owner@example.com')
    const resetEmail = securityEmailMock.mock.calls.find(([message]) => message.subject.includes('Reset your'))?.[0]
    const resetUrl = new URL(resetEmail.text.match(/https:\/\/\S+/)[0])
    const resetToken = resetUrl.searchParams.get('token')
    expect(resetToken).toBeTruthy()

    const storedToken = await CredentialResetToken.findOne().select('+tokenHash').lean()
    expect(storedToken.tokenHash).not.toBe(resetToken)

    await request(app)
      .post('/api/admin/recovery/password/reset')
      .send({
        token: resetToken,
        password: 'replacement-password',
        confirmPassword: 'replacement-password',
      })
      .expect(200)

    await request(app)
      .post('/api/admin/recovery/password/reset')
      .send({
        token: resetToken,
        password: 'another-replacement',
        confirmPassword: 'another-replacement',
      })
      .expect(400)

    await request(app)
      .get('/api/admin/verify')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'replacement-password' })
      .expect(200)
  })

  it('returns indistinguishable recovery responses and sends username reminders only out of band', async () => {
    const known = await request(app)
      .post('/api/admin/recovery/username')
      .send({ email: 'owner@example.com' })
      .expect(202)
    const unknown = await request(app)
      .post('/api/admin/recovery/username')
      .send({ email: 'unknown@example.com' })
      .expect(202)

    expect(known.body).toEqual(unknown.body)
    expect(securityEmailMock).toHaveBeenCalledTimes(1)
    expect(securityEmailMock.mock.calls[0][0].text).toContain('admin')
  })

  it('rejects expired password reset tokens', async () => {
    await request(app)
      .post('/api/admin/recovery/password/request')
      .send({ email: 'owner@example.com' })
      .expect(202)
    const resetEmail = securityEmailMock.mock.calls.find(([message]) => message.subject.includes('Reset your'))?.[0]
    const resetToken = new URL(resetEmail.text.match(/https:\/\/\S+/)[0]).searchParams.get('token')
    await CredentialResetToken.updateOne({}, { $set: { expiresAt: new Date(Date.now() - 1000) } })

    await request(app)
      .post('/api/admin/recovery/password/reset')
      .send({ token: resetToken, password: 'replacement-password', confirmPassword: 'replacement-password' })
      .expect(400)
  })

  it('bootstraps credentials once and then uses the database as the source of truth', async () => {
    const admin = await AdminUser.findOne({ key: 'primary' }).select('+passwordHash')
    const originalHash = admin.passwordHash
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('environment-changed', 10)

    await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'environment-changed' })
      .expect(401)

    const unchanged = await AdminUser.findOne({ key: 'primary' }).select('+passwordHash')
    expect(unchanged.passwordHash).toBe(originalHash)
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-password', 10)
  })
})

describe('project API', () => {
  it('lets admins manage categories while protecting categories used by projects', async () => {
    const publicCategories = await request(app).get('/api/categories').expect(200)
    expect(publicCategories.body).toHaveLength(5)

    await request(app).post('/api/categories').send({ name: 'Decision Science' }).expect(401)
    const createdCategory = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Decision Science', aliases: ['Decision Analytics'], order: 25 })
      .expect(201)
    expect(createdCategory.body).toMatchObject({ name: 'Decision Science', slug: 'decision-science' })

    const project = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validProject, category: 'Decision Science', categorySlug: 'decision-science' })
      .expect(201)
    expect(project.body).toMatchObject({ category: 'Decision Science', categorySlug: 'decision-science' })

    await request(app)
      .put(`/api/categories/${createdCategory.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Decision Intelligence' })
      .expect(200)
    expect(await Project.findById(project.body._id).lean()).toMatchObject({
      category: 'Decision Intelligence',
      categorySlug: 'decision-science',
    })

    await request(app)
      .delete(`/api/categories/${createdCategory.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409)
    await request(app)
      .put(`/api/projects/${project.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Web Applications', categorySlug: 'web-applications' })
      .expect(200)
    await request(app)
      .delete(`/api/categories/${createdCategory.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    expect(await Category.findById(createdCategory.body._id).lean()).toMatchObject({ active: false })
  })

  it('migrates legacy categories and language lists into the new classification model', async () => {
    const legacy = await Project.create({
      ...validProject,
      title: 'FIFA World Cup Forecaster',
      category: 'Data Science',
      methods: [],
      tools: [],
      languages: ['Python', 'pandas', 'scikit-learn'],
      tags: ['Machine Learning', 'Data Analysis'],
    })
    await Project.collection.updateOne(
      { _id: legacy._id },
      { $unset: { classificationVersion: '' } },
    )

    expect(await migrateProjectClassifications()).toBe(1)
    const migrated = await Project.findById(legacy._id).select('+classificationVersion').lean()
    expect(migrated).toMatchObject({
      category: 'Sports Analytics',
      classificationVersion: 1,
      methods: ['Predictive Modeling', 'Tournament Forecasting', 'Model Evaluation'],
      tools: ['Python', 'pandas', 'scikit-learn'],
      tags: ['Football', 'FIFA World Cup', 'Tournament Prediction'],
    })
    expect(await migrateProjectClassifications()).toBe(0)
  })

  it('creates, updates, and deletes a project with admin auth', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(validProject)
      .expect(201)

    expect(created.body.title).toBe(validProject.title)
    expect(created.body.featured).toBe(true)
    expect(created.body).toMatchObject({ methods: validProject.methods, tools: validProject.tools, tags: validProject.tags })

    const updated = await request(app)
      .put(`/api/projects/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Portfolio API' })
      .expect(200)

    expect(updated.body.title).toBe('Updated Portfolio API')

    const afterUpdate = await Activity.find({ projectId: created.body._id }).sort({ timestamp: 1 }).lean()
    expect(afterUpdate.map(({ type }) => type)).toEqual(['Created', 'Updated'])

    await request(app)
      .delete(`/api/projects/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    expect(await Project.exists({ _id: created.body._id })).toBeNull()
    expect(await ArchivedProject.exists({ originalId: created.body._id })).toBeTruthy()
    const activityTypes = await Activity.find({ projectId: created.body._id }).distinct('type')
    expect(activityTypes.sort()).toEqual(['Created', 'Deleted', 'Updated'])
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

  it('rolls back a project when its audit record cannot be written', async () => {
    const activityCreate = vi.spyOn(Activity, 'create').mockRejectedValueOnce(new Error('audit unavailable'))

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(validProject)
      .expect(500)

    expect(await Project.countDocuments()).toBe(0)
    activityCreate.mockRestore()
  })

  it('does not create audit noise for public view counters', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(validProject)
      .expect(201)

    await request(app).patch(`/api/projects/${created.body._id}/hit`).expect(200)
    expect(await Activity.countDocuments({ projectId: created.body._id })).toBe(1)
  })

  it('rejects image content that does not match its declared MIME type', async () => {
    await request(app)
      .post('/api/projects/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('not an image'), {
        filename: 'forged.png',
        contentType: 'image/png',
      })
      .expect(400)

    await request(app)
      .post('/api/projects/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('89504e470d0a1a0a00000000', 'hex'), {
        filename: 'valid-signature.png',
        contentType: 'image/png',
      })
      .expect(200)
  })

  it('returns asset IDs and removes abandoned, replaced, and deleted project images', async () => {
    uploadStreamMock.mockImplementationOnce((_options, callback) => ({
      end: () => callback(null, {
        secure_url: 'https://res.cloudinary.com/test/image/upload/cartierkuti/preview.png',
        public_id: 'cartierkuti/preview',
      }),
    }))
    const uploaded = await request(app)
      .post('/api/projects/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('89504e470d0a1a0a00000000', 'hex'), { filename: 'preview.png', contentType: 'image/png' })
      .expect(200)
    expect(uploaded.body).toMatchObject({ imageAssetId: 'cartierkuti/preview' })

    await request(app)
      .delete('/api/projects/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageAssetId: 'cartierkuti/preview' })
      .expect(204)
    expect(destroyImageMock).toHaveBeenCalledWith('cartierkuti/preview', expect.objectContaining({ invalidate: true }))

    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validProject, imageAssetId: 'cartierkuti/old' })
      .expect(201)
    await request(app)
      .put(`/api/projects/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ imageUrl: 'https://example.com/new.png', imageAssetId: 'cartierkuti/new' })
      .expect(200)
    expect(destroyImageMock).toHaveBeenCalledWith('cartierkuti/old', expect.any(Object))

    await request(app)
      .delete(`/api/projects/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    expect(destroyImageMock).toHaveBeenCalledWith('cartierkuti/new', expect.any(Object))
  })
})

describe('reviews and resume', () => {
  it('validates public review submissions', async () => {
    const project = await Project.create(validProject)

    const submitted = await request(app)
      .post(`/api/projects/${project._id}/reviews`)
      .send({ stars: 5, comment: 'Strong work.' })
      .expect(201)

    expect(submitted.body.review).toMatchObject({ stars: 5, comment: 'Strong work.' })

    const reviews = await request(app)
      .get(`/api/projects/${project._id}/reviews?limit=1`)
      .expect(200)
    expect(reviews.body).toMatchObject({ total: 1, page: 1, limit: 1 })
    expect(reviews.body.reviews).toHaveLength(1)

    await request(app)
      .get(`/api/projects/${project._id}/reviews?limit=51`)
      .expect(400)

    await request(app)
      .post(`/api/projects/${project._id}/reviews`)
      .send({ stars: 9, comment: 'Invalid score.' })
      .expect(400)

    await request(app)
      .post(`/api/projects/${project._id}/reviews`)
      .send({ stars: 5, comment: 'Extra field.', date: new Date().toISOString() })
      .expect(400)
  })

  it('protects and validates activity history queries', async () => {
    await request(app).get('/api/activities').expect(401)

    await request(app)
      .get('/api/activities?limit=101')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    await request(app)
      .get('/api/activities?startDate=not-a-date')
      .set('Authorization', `Bearer ${token}`)
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
      .attach('resume', Buffer.from('not really a pdf'), {
        filename: 'forged.pdf',
        contentType: 'application/pdf',
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
