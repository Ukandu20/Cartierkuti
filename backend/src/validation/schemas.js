import mongoose from 'mongoose'
import { z } from 'zod'

const text = (max) => z.string().trim().min(1).max(max)
const optionalText = (max) => z.string().trim().max(max).optional()
const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
const url = z.string().trim().url().max(2048).refine(
  isHttpUrl,
  { message: 'URL must use http or https' },
)
const optionalUrl = z.union([z.literal(''), url]).optional()
const uniqueTextArray = (min, max) => z
  .array(text(60))
  .min(min)
  .max(max)
  .refine(
    (items) => new Set(items.map((item) => item.toLowerCase())).size === items.length,
    { message: 'Items must be unique' },
  )
const objectId = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid Mongo ObjectId',
})
const dateInput = z.string().trim().max(40).refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: 'Invalid date' },
)

export const objectIdSchema = z.object({
  id: objectId,
})

export const selectedProjectsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(3).default(3),
}).strict()

export const browseProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
  category: optionalText(90),
  search: optionalText(160),
  sort: z.enum(['date', 'title', 'views']).default('date'),
}).strict()

export const archiveQuerySchema = z
  .object({
    projectId: objectId.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()

export const activityQuerySchema = z
  .object({
    projectId: objectId.optional(),
    type: z.enum(['Created', 'Updated', 'Deleted']).optional(),
    startDate: dateInput.optional(),
    endDate: dateInput.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || new Date(startDate) <= new Date(endDate),
    { message: 'startDate must not be after endDate', path: ['startDate'] },
  )

export const authLoginSchema = z
  .object({
    username: text(120),
    password: z.string().min(1).max(256),
  })
  .strict()

const accountEmail = z.string().trim().email().max(254)
const adminUsername = z.string().trim().min(3).max(64).regex(
  /^[A-Za-z0-9._-]+$/,
  'Use only letters, numbers, periods, underscores, and hyphens'
)
const newPassword = z.string().min(12).max(128)

export const passwordRecoveryRequestSchema = z.object({ email: accountEmail }).strict()

export const usernameRecoveryRequestSchema = z.object({ email: accountEmail }).strict()

export const passwordResetSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: newPassword,
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const credentialChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    newUsername: adminUsername.optional(),
    newPassword: newPassword.optional(),
    confirmPassword: z.string().max(128).optional(),
    mfaCode: z.string().trim().min(6).max(32).optional(),
  })
  .strict()
  .refine(({ newUsername, newPassword }) => Boolean(newUsername || newPassword), {
    message: 'Provide a new username or password',
  })
  .refine(({ newPassword, confirmPassword }) => !newPassword || newPassword === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const mfaSetupSchema = z.object({ currentPassword: z.string().min(1).max(256) }).strict()

export const mfaCodeSchema = z.object({ code: z.string().trim().min(6).max(32) }).strict()

export const mfaLoginSchema = z
  .object({
    challengeToken: z.string().min(32).max(4096),
    code: z.string().trim().min(6).max(32),
  })
  .strict()

export const mfaDisableSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    code: z.string().trim().min(6).max(32),
  })
  .strict()

export const projectWriteSchema = z
  .object({
    category: text(80),
    categorySlug: optionalText(90),
    title: text(160),
    description: text(4000),
    methods: uniqueTextArray(1, 12),
    tools: uniqueTextArray(1, 20),
    status: text(80),
    tags: uniqueTextArray(1, 8),
    metadata: optionalText(4000),
    externalLink: url,
    githubLink: url,
    liveDemoLink: optionalUrl,
    imageUrl: optionalUrl,
    imageAssetId: optionalText(180),
    featured: z.boolean().optional(),
  })
  .strict()

export const categoryCreateSchema = z.object({
  name: text(80),
  aliases: z.array(text(80)).max(20).default([]),
  order: z.coerce.number().int().min(0).max(10_000).default(0),
}).strict()

export const categoryUpdateSchema = z.object({
  name: text(80).optional(),
  aliases: z.array(text(80)).max(20).optional(),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one category field is required',
})

export const imageAssetDeleteSchema = z.object({
  imageAssetId: text(180),
}).strict()

export const projectUpdateSchema = projectWriteSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one project field is required' }
)

export const reviewWriteSchema = z
  .object({
    stars: z.coerce.number().int().min(1).max(5),
    comment: text(1000),
  })
  .strict()

export const reviewQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict()

const studyDate = z.string().trim().regex(/^(?:\d{4}(?:-(?:0[1-9]|1[0-2]))?)?$/, 'Use a year or year and month').optional()

const stringArray = z.array(text(160)).max(50).default([])

const aboutContentSchema = z.object({
  ...Object.fromEntries(['pageTitle', 'metaDescription', 'introductionLabel', 'heroTitle', 'educationLabel', 'experienceLabel', 'experienceTitle', 'credentialsLabel', 'processLabel', 'processTitle', 'processDescription', 'capabilitiesLabel', 'capabilitiesTitle', 'capabilitiesDescription', 'primarySkillsLabel', 'secondarySkillsLabel', 'toolsSkillsLabel', 'personalLabel', 'personalTitle', 'galleryLabel', 'galleryTitle', 'ctaLabel', 'ctaTitle', 'ctaDescription', 'contactButtonLabel', 'resumeButtonLabel', 'credentialButtonLabel'].map(key => [key, optionalText(key === 'metaDescription' ? 320 : 1000)])),
  principles: z.array(z.object({ title: optionalText(160), description: optionalText(1000) }).strict()).max(12).optional(),
}).strict()

export const resumeWriteSchema = z
  .object({
    pageContent: aboutContentSchema.optional(),
    headline: optionalText(200),
    summary: optionalText(4000),
    highlights: stringArray,
    metrics: z
      .array(
        z
          .object({
            label: optionalText(80),
            value: optionalText(80),
            note: optionalText(160),
          })
          .strict()
      )
      .max(20)
      .default([]),
    experience: z
      .array(
        z
          .object({
            role: optionalText(160),
            company: optionalText(160),
            location: optionalText(160),
            period: optionalText(120),
            bullets: stringArray,
          })
          .strict()
      )
      .max(30)
      .default([]),
    education: z
      .array(
        z
          .object({
            school: optionalText(160),
            degree: optionalText(160),
            program: optionalText(160),
            level: optionalText(80),
            status: optionalText(80),
            visible: z.boolean().default(true),
            startDate: studyDate,
            finishDate: studyDate,
            expectedFinishDate: studyDate,
            period: optionalText(120),
            bullets: stringArray,
          })
          .strict()
          .superRefine((item, ctx) => {
            const ongoing = /^in[ -]progress$/i.test(item.status || '')
            if (ongoing && item.finishDate) ctx.addIssue({ code: 'custom', path: ['finishDate'], message: 'Use an expected finish for studies in progress' })
            const key = ongoing ? 'expectedFinishDate' : 'finishDate'
            const length = Math.min(item.startDate?.length || 0, item[key]?.length || 0)
            if (length && item[key].slice(0, length) < item.startDate.slice(0, length)) ctx.addIssue({ code: 'custom', path: [key], message: 'The finish must be on or after the start' })
          })
      )
      .max(20)
      .default([]),
    certifications: z
      .array(
        z
          .object({
            name: optionalText(160),
            issuer: optionalText(160),
            year: optionalText(40),
            credentialId: optionalText(160),
            credentialUrl: optionalUrl,
            showCredentialLink: z.boolean().default(false),
          })
          .strict()
          .refine(
            ({ credentialUrl, showCredentialLink }) => !showCredentialLink || Boolean(credentialUrl),
            { path: ['credentialUrl'], message: 'Add a credential URL or disable the public link' },
          )
      )
      .max(30)
      .default([]),
    personalItems: z.array(z.object({
      title: text(100),
      category: z.enum(['Language', 'Learning', 'Interest', 'Volunteering']),
      status: optionalText(80),
      level: optionalText(80),
      notes: optionalText(800),
      visible: z.boolean().default(true),
    }).strict()).max(20).optional(),
    gallery: z.array(z.object({
      title: text(160),
      caption: optionalText(1000),
      date: optionalText(80),
      location: optionalText(160),
      imageUrl: optionalUrl,
      imageAssetId: optionalText(180),
      altText: optionalText(200),
      visible: z.boolean().default(true),
      featured: z.boolean().default(false),
    }).strict().refine(item => !item.visible || Boolean(item.imageUrl), {
      path: ['imageUrl'], message: 'Add an image or hide this gallery entry',
    })).max(30).optional(),
    skills: z
      .object({
        primary: stringArray,
        secondary: stringArray,
        tools: stringArray,
      })
      .strict()
      .default({ primary: [], secondary: [], tools: [] }),
  })
  .strict()
